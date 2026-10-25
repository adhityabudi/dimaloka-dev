ALTER TABLE public.invoices ADD COLUMN payment_stage text NOT NULL DEFAULT 'full', ADD COLUMN contract_total numeric, ADD COLUMN dp_amount numeric NOT NULL DEFAULT 0, ADD COLUMN parent_invoice_id uuid REFERENCES public.invoices(id);
ALTER TABLE public.invoices ADD CONSTRAINT invoice_payment_stage_valid CHECK (payment_stage IN ('full', 'dp', 'settlement'));
CREATE UNIQUE INDEX invoice_one_settlement ON public.invoices(parent_invoice_id) WHERE payment_stage = 'settlement' AND status <> 'cancelled';
CREATE FUNCTION public.validate_invoice_payment_stage() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE p public.invoices%ROWTYPE; item_total numeric;
BEGIN
  IF NEW.payment_stage = 'full' THEN
    NEW.contract_total := NEW.amount; NEW.dp_amount := 0; NEW.parent_invoice_id := NULL;
  ELSE
    IF jsonb_typeof(NEW.items) <> 'array' THEN RAISE EXCEPTION 'Item invoice tidak valid'; END IF;
    SELECT COALESCE(sum((x->>'qty')::numeric * (x->>'price')::numeric), 0) INTO item_total FROM jsonb_array_elements(NEW.items) x;
    IF NEW.contract_total IS NULL OR NEW.contract_total <= 0 OR NEW.dp_amount <= 0 OR NEW.dp_amount >= NEW.contract_total OR item_total <> NEW.contract_total THEN RAISE EXCEPTION 'Total kontrak dan DP tidak valid'; END IF;
    IF NEW.payment_stage = 'dp' THEN
      IF NEW.parent_invoice_id IS NOT NULL OR NEW.amount <> NEW.dp_amount THEN RAISE EXCEPTION 'Jumlah invoice DP tidak valid'; END IF;
    ELSE
      SELECT * INTO p FROM public.invoices WHERE id = NEW.parent_invoice_id FOR UPDATE;
      IF NOT FOUND OR p.payment_stage <> 'dp' OR p.status <> 'paid' THEN RAISE EXCEPTION 'Pelunasan hanya dapat dibuat setelah DP dibayar'; END IF;
      IF NEW.contract_total <> p.contract_total OR NEW.dp_amount <> p.dp_amount OR NEW.amount <> p.contract_total - p.dp_amount OR NEW.items <> p.items OR NEW.buyer_id IS DISTINCT FROM p.buyer_id THEN RAISE EXCEPTION 'Pelunasan harus sesuai invoice DP'; END IF;
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' AND EXISTS (SELECT 1 FROM public.invoices i WHERE i.parent_invoice_id = OLD.id AND i.status <> 'cancelled') THEN
    IF NEW.status <> 'paid' OR NEW.amount <> OLD.amount OR NEW.dp_amount <> OLD.dp_amount OR NEW.contract_total IS DISTINCT FROM OLD.contract_total OR NEW.items <> OLD.items OR NEW.payment_stage <> OLD.payment_stage THEN RAISE EXCEPTION 'Invoice DP sudah memiliki invoice pelunasan'; END IF;
  END IF;
  IF NEW.status = 'paid' AND NEW.paid_at IS NULL THEN NEW.paid_at := now(); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER validate_invoice_payment_stage BEFORE INSERT OR UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.validate_invoice_payment_stage();
CREATE FUNCTION public.get_invoice_by_token_v2(_token uuid) RETURNS TABLE(invoice_number text, buyer_name text, buyer_wa text, buyer_email text, amount numeric, items jsonb, status public.invoice_status, due_date date, paid_at timestamptz, created_at timestamptz, payment_stage text, contract_total numeric, dp_amount numeric, parent_invoice_number text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT i.invoice_number, i.buyer_name, i.buyer_wa, i.buyer_email, i.amount, i.items, i.status, i.due_date, i.paid_at, i.created_at, i.payment_stage, COALESCE(i.contract_total,i.amount), i.dp_amount, p.invoice_number
 FROM public.invoices i LEFT JOIN public.invoices p ON p.id = i.parent_invoice_id WHERE i.public_token = _token AND i.status <> 'draft';
$$;
REVOKE ALL ON FUNCTION public.get_invoice_by_token_v2(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invoice_by_token_v2(uuid) TO anon, authenticated, service_role;