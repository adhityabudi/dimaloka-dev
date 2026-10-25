import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, PageHeader } from "@/components/admin/fields";
import { rupiah } from "@/lib/format";
import { splitPayment } from "@/lib/invoice-payments";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/invoice/new")({
  validateSearch: (s: Record<string, unknown>): { order?: string; settlement?: string } => ({ order: typeof s["order"] === "string" ? s["order"] : undefined, settlement: typeof s["settlement"] === "string" ? s["settlement"] : undefined }),
  component: Page,
});

type Item = { name: string; qty: number; price: number };

function Page() {
  const { order, settlement } = Route.useSearch();
  const navigate = useNavigate();
  const [v, setV] = useState({ buyer_name: "", buyer_wa: "", buyer_email: "", due_date: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10), order_id: null as string | null, buyer_id: null as string | null });
  const [items, setItems] = useState<Item[]>([{ name: "", qty: 1, price: 0 }]);
  const [stage, setStage] = useState("full");
  const [dp, setDp] = useState(0);
  const [saving, setSaving] = useState(false);
  const [parent, setParent] = useState<{ id: string; invoice_number: string | null } | null>(null);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  useEffect(() => {
    if (settlement) {
      supabase.from("invoices").select("*").eq("id", settlement).single().then(({ data: p, error }) => {
        if (error || !p || p.payment_stage !== "dp" || p.status !== "paid") { toast.error("Invoice DP harus sudah dibayar"); return; }
        setParent({ id: p.id, invoice_number: p.invoice_number });
        setStage("settlement"); setDp(Number(p.dp_amount));
        setV((x) => ({ ...x, buyer_name: p.buyer_name ?? "", buyer_wa: p.buyer_wa ?? "", buyer_email: p.buyer_email ?? "", buyer_id: p.buyer_id, order_id: p.order_id }));
        setItems(p.items as Item[]);
      });
      return;
    }
    if (!order) return;
    supabase.from("orders").select("*, products(title)").eq("id", order).single().then(({ data: o }) => {
      if (!o) return;
      setV((x) => ({ ...x, buyer_name: o.buyer_name ?? "", buyer_wa: o.buyer_wa ?? "", buyer_email: o.buyer_email ?? "", order_id: o.id, buyer_id: o.buyer_id }));
      setItems([{ name: `${(o as any).products?.title ?? "Layanan"}${o.package_name ? ` — Paket ${o.package_name}` : ""}`, qty: 1, price: Number(o.amount) }]);
    });
  }, [order, settlement]);

  const save = async (status: "draft" | "sent") => {
    if (!v.buyer_name || items.some((i) => !i.name)) return toast.error("Lengkapi nama buyer dan item");
    if (settlement && !parent) return toast.error("Invoice DP belum siap");
    if (items.some((i) => !Number.isFinite(i.qty) || i.qty < 1 || !Number.isFinite(i.price) || i.price < 0)) return toast.error("Qty dan harga tidak valid");
    if (stage !== "full") { try { splitPayment(total, dp); } catch (e) { return toast.error(e instanceof Error ? e.message : "DP tidak valid"); } }
    setSaving(true);
    let buyer_id = v.buyer_id;
    if (!buyer_id && v.buyer_email) {
      const { data: prof } = await supabase.from("profiles").select("id").eq("email", v.buyer_email.trim()).maybeSingle();
      buyer_id = prof?.id ?? null;
    }
    const { data, error } = await supabase.from("invoices").insert({ ...v, buyer_id, items, amount: stage === "dp" ? dp : stage === "settlement" ? total - dp : total, contract_total: total, dp_amount: stage !== "full" ? dp : 0, parent_invoice_id: parent?.id ?? null, payment_stage: stage, status }).select("invoice_number,public_token").single();
    setSaving(false);
    if (error) return toast.error(error.message);
    if (status === "sent") {
      await navigator.clipboard.writeText(`${window.location.origin}/invoice/${data.public_token}`).catch(() => {});
      toast.success(`${data.invoice_number} dibuat, link disalin`);
    } else toast.success(`${data.invoice_number} disimpan sebagai draft`);
    navigate({ to: "/admin/invoice" });
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title={settlement ? "Invoice Pelunasan" : "Invoice Baru"} desc={parent ? `Invoice utama: ${parent.invoice_number}` : order ? "Data diisi otomatis dari order." : undefined} />
      <div className="space-y-5 rounded-2xl border bg-card p-6 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama buyer"><Input value={v.buyer_name} onChange={(e) => setV({ ...v, buyer_name: e.target.value })} /></Field>
          <Field label="WhatsApp"><Input value={v.buyer_wa} onChange={(e) => setV({ ...v, buyer_wa: e.target.value })} /></Field>
          <Field label="Email"><Input type="email" value={v.buyer_email} onChange={(e) => setV({ ...v, buyer_email: e.target.value })} /></Field>
          <Field label="Jatuh tempo"><Input type="date" value={v.due_date} onChange={(e) => setV({ ...v, due_date: e.target.value })} /></Field>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between"><h3 className="font-extrabold text-navy">Item</h3><Button disabled={Boolean(settlement)} size="sm" variant="outline" onClick={() => setItems([...items, { name: "", qty: 1, price: 0 }])}><Plus /> Item</Button></div>
          <fieldset disabled={Boolean(settlement)} className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="Nama item" value={it.name} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <Input type="number" className="w-20" value={it.qty} min={1} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value) } : x)))} aria-label="Qty" />
                <Input type="number" className="w-40" value={it.price} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) } : x)))} aria-label="Harga" />
                <Button size="icon" variant="ghost" onClick={() => setItems(items.filter((_, j) => j !== i))} disabled={items.length === 1} aria-label="Hapus"><Trash2 /></Button>
              </div>
            ))}
          </fieldset>
          <p className="mt-4 text-right text-xl font-extrabold text-primary-strong">Total: {rupiah(total)}</p>
        </div>
        <p className="text-xs text-muted-foreground">Nomor invoice dibuat otomatis (INV-YYYYMM-####).</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pembayaran"><Select disabled={Boolean(settlement)} value={stage} onValueChange={setStage}><SelectTrigger aria-label="Pembayaran"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="full">Full Payment</SelectItem><SelectItem value="dp">Termin 2 tahap — DP & Pelunasan</SelectItem><SelectItem value="settlement" disabled>Pelunasan 2/2</SelectItem></SelectContent></Select></Field>
          {stage !== "full" && <Field label="Nominal DP (Rp)"><Input disabled={Boolean(settlement)} aria-label="Nominal DP" type="number" min={1} max={total - 1} value={dp} onChange={(e) => setDp(Number(e.target.value))} /></Field>}
        </div>
        {stage !== "full" && <div className="flex flex-wrap justify-between gap-2 border-y py-3 text-sm"><span>DP 1/2: <b>{rupiah(dp)}</b></span><span>Pelunasan 2/2: <b>{rupiah(Math.max(0, total - dp))}</b></span></div>}
        <div className="flex gap-2"><Button disabled={saving} variant="outline" onClick={() => save("draft")}>Simpan draft</Button><Button disabled={saving} onClick={() => save("sent")} className="flex-1">Buat & salin link</Button></div>
      </div>
    </div>
  );
}
