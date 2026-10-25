import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Eye, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, PageHeader } from "@/components/admin/fields";
import { OrderTimeline } from "@/components/site/OrderTimeline";
import { ORDER_STATUS, orderStatusLabel } from "@/lib/checkout";
import { paymentKind } from "@/lib/invoice-payments";
import { rupiah, tanggal, waLink } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/order_/$id")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const key = ["adm-order", id];
  const { data } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const [o, inv, up] = await Promise.all([
        supabase.from("orders").select("*, products(title,slug)").eq("id", id).maybeSingle(),
        supabase.from("invoices").select("*").eq("order_id", id).order("created_at"),
        supabase.from("order_updates").select("*").eq("order_id", id).order("created_at", { ascending: false }),
      ]);
      return { order: o.data as any, invoices: inv.data ?? [], updates: up.data ?? [] };
    },
  });
  const [u, setU] = useState({ title: "", note: "", progress: "" });
  const refresh = () => { qc.invalidateQueries({ queryKey: key }); qc.invalidateQueries({ queryKey: ["adm-orders"] }); };
  if (!data?.order) return <p className="text-muted-foreground">Memuat...</p>;
  const o = data.order;

  const setStatus = async (status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("order_updates").insert({ order_id: id, title: `Status: ${orderStatusLabel(status)}` });
    refresh();
  };
  const markPaid = async (invId: string) => {
    const { error } = await supabase.from("invoices").update({ status: "paid" }).eq("id", invId);
    if (error) return toast.error(error.message);
    toast.success("Pembayaran dikonfirmasi"); refresh();
  };
  const addUpdate = async () => {
    if (!u.title.trim()) return toast.error("Judul update wajib");
    const progress = u.progress === "" ? null : Math.max(0, Math.min(100, Number(u.progress)));
    const { error } = await supabase.from("order_updates").insert({ order_id: id, title: u.title.trim(), note: u.note || null, progress });
    if (error) return toast.error(error.message);
    if (progress != null) await supabase.from("orders").update({ progress }).eq("id", id);
    toast.success("Update progres ditambahkan");
    setU({ title: "", note: "", progress: "" }); refresh();
  };
  const latest = data.updates[0];
  const waMsg = `Halo ${o.buyer_name}, update pesanan ${o.order_number} (${o.products?.title ?? ""}):\n${latest ? `${latest.title}${latest.note ? `\n${latest.note}` : ""}` : orderStatusLabel(o.status)}\nProgres: ${o.progress}%\nDetail: ${window.location.origin}/pesanan/${o.id}`;

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-3"><Link to="/admin/order"><ArrowLeft /> Semua pesanan</Link></Button>
      <PageHeader title={o.order_number ?? "Pesanan"} desc={`${o.products?.title ?? ""}${o.package_name ? ` · Paket ${o.package_name}` : ""} · ${tanggal(o.created_at)}`} action={<Button variant="outline" asChild><a href={waLink(o.buyer_wa, waMsg)} target="_blank" rel="noreferrer"><MessageCircle /> Kabari via WhatsApp</a></Button>} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 font-extrabold text-navy">Tambah update progres</h2>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <Field label="Judul"><Input placeholder="Mis. Desain halaman utama selesai" value={u.title} onChange={(e) => setU({ ...u, title: e.target.value })} /></Field>
              <Field label="Progres (%)"><Input type="number" min={0} max={100} value={u.progress} onChange={(e) => setU({ ...u, progress: e.target.value })} /></Field>
            </div>
            <div className="mt-4"><Field label="Catatan untuk client"><Textarea value={u.note} onChange={(e) => setU({ ...u, note: e.target.value })} /></Field></div>
            <Button className="mt-4" onClick={addUpdate}><Send /> Simpan update</Button>
          </section>
          <section className="rounded-2xl border bg-card p-6"><h2 className="mb-4 font-extrabold text-navy">Riwayat</h2><OrderTimeline updates={data.updates} /></section>
        </div>
        <div className="space-y-6">
          <section className="rounded-2xl border bg-card p-6">
            <Field label="Status pesanan">
              <Select value={o.status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ORDER_STATUS.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}</SelectContent></Select>
            </Field>
            <p className="mt-3 text-sm text-muted-foreground">Progres saat ini: <b>{o.progress}%</b></p>
          </section>
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="font-extrabold text-navy">Invoice</h2>
            <div className="mt-3 space-y-2">
              {data.invoices.map((i) => (
                <div key={i.id} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between gap-2"><p className="font-mono text-sm font-bold">{i.invoice_number}</p><Button size="icon" variant="ghost" asChild><Link to="/admin/invoice/$id" params={{ id: i.id }} aria-label="Pratinjau"><Eye /></Link></Button></div>
                  <p className="text-xs text-muted-foreground">{paymentKind(i.payment_stage)} · {rupiah(i.amount)} · {i.status === "paid" ? "Lunas" : i.status === "cancelled" ? "Batal" : "Belum dibayar"}</p>
                  {i.status === "sent" && <Button size="sm" className="mt-2 w-full" onClick={() => markPaid(i.id)}><CheckCircle2 /> Tandai sudah dibayar</Button>}
                  {i.status === "paid" && i.payment_stage === "dp" && !data.invoices.some((x) => x.parent_invoice_id === i.id) && <Button size="sm" variant="outline" className="mt-2 w-full" asChild><Link to="/admin/invoice/new" search={{ settlement: i.id } as any}>Buat Pelunasan</Link></Button>}
                </div>
              ))}
              {data.invoices.length === 0 && <Button size="sm" variant="outline" asChild><Link to="/admin/invoice/new" search={{ order: o.id } as any}>Buat Invoice</Link></Button>}
            </div>
          </section>
          <section className="rounded-2xl border bg-card p-6 text-sm">
            <h2 className="mb-3 font-extrabold text-navy">Client</h2>
            <p className="font-semibold">{o.buyer_name}</p><p className="text-muted-foreground">{o.buyer_wa}</p><p className="text-muted-foreground">{o.buyer_email}</p>
            <h3 className="mt-4 font-bold text-navy">Brief</h3><p className="mt-1 whitespace-pre-line text-muted-foreground">{o.brief || o.notes || "-"}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
