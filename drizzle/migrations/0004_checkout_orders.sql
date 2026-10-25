ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'awaiting_payment';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'revision';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number text UNIQUE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS brief text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_stage text NOT NULL DEFAULT 'full';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS progress integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.order_defaults() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE prefix text; n int;
BEGIN
  IF new.order_number IS NULL THEN
    prefix := 'ORD-' || to_char(now() AT TIME ZONE 'Asia/Jakarta','YYYYMM') || '-';
    SELECT coalesce(max(substring(order_number from 12)::int),0)+1 INTO n FROM public.orders WHERE order_number LIKE prefix || '%';
    new.order_number := prefix || lpad(n::text,4,'0');
  END IF;
  RETURN new;
END $$;
CREATE TRIGGER orders_defaults BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.order_defaults();

CREATE TABLE public.order_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  title text NOT NULL,
  note text,
  progress integer,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_updates TO authenticated;
GRANT ALL ON public.order_updates TO service_role;
ALTER TABLE public.order_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own order updates" ON public.order_updates FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid()));
CREATE POLICY "admin insert updates" ON public.order_updates FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update updates" ON public.order_updates FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete updates" ON public.order_updates FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.sync_order_paid() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF new.status = 'paid' AND (old.status IS DISTINCT FROM 'paid') AND new.order_id IS NOT NULL THEN
    UPDATE public.orders SET status = 'paid' WHERE id = new.order_id AND status::text IN ('awaiting_payment','new','contacted');
    INSERT INTO public.order_updates(order_id, title, note) VALUES (new.order_id, CASE WHEN new.payment_stage = 'dp' THEN 'DP diterima' ELSE 'Pembayaran diterima' END, 'Invoice ' || new.invoice_number || ' telah dikonfirmasi admin.');
  END IF;
  RETURN new;
END $$;
CREATE TRIGGER invoices_sync_order AFTER UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.sync_order_paid();