import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, FileText, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/components/admin/useSettings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OrderTimeline } from "@/components/site/OrderTimeline";
import { orderStatusLabel } from "@/lib/checkout";
import { paymentKind } from "@/lib/invoice-payments";
import { rupiah, tanggal, waLink } from "@/lib/format";
import { pageMeta } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/pesanan/$id")({
  validateSearch: (s: Record<string, unknown>): { baru?: number } => ({ baru: s.baru ? 1 : undefined }),
  head: () => ({ meta: [...pageMeta({ title: "Detail Pesanan | Dimaloka", description: "Status pembayaran dan progres pesanan layanan Anda di Dimaloka." }), { name: "robots", content: "noindex, nofollow" }] }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const { baru } = Route.useSearch();
  const { data: settings = {} } = useSettings();
  const { data, isLoading } = useQuery({
    queryKey: ["my-order", id],
    queryFn: async () => {
      const [o, inv, up] = await Promise.all([
        supabase.from("orders").select("*, products(title,slug)").eq("id", id).maybeSingle(),
        supabase.from("invoices").select("*").eq("order_id", id).neq("status", "draft").order("created_at"),
        supabase.from("order_updates").select("*").eq("order_id", id).order("created_at", { ascending: false }),
      ]);
      return { order: o.data as any, invoices: inv.data ?? [], updates: up.data ?? [] };
    },
  });
  if (isLoading) return <p className="p-10 text-center text-muted-foreground">Memuat...</p>;
  if (!data?.order) return <p className="p-10 text-center">Pesanan tidak ditemukan. <Link to="/akun" className="text-primary-strong underline">Kembali</Link></p>;
  const o = data.order;
  const unpaid = data.invoices.find((i) => i.status === "sent");
  const confirmMsg = unpaid ? `Halo admin Dimaloka, saya sudah transfer untuk pesanan ${o.order_number}.\nInvoice: ${unpaid.invoice_number}\nNominal: ${rupiah(unpaid.amount)}\nAtas nama: ${o.buyer_name}\nBerikut bukti transfernya.` : "";
  const banks = String(settings.payment_info ?? "").trim();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {baru && (
        <div className="mb-8 flex gap-3 rounded-2xl border border-success/30 bg-success/10 p-5">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
          <div><p className="font-extrabold text-navy">Pesanan berhasil dibuat</p><p className="text-sm text-muted-foreground">Silakan transfer sesuai invoice, lalu konfirmasi pembayaran ke admin lewat WhatsApp.</p></div>
        </div>
      )}
      <Link to="/akun" className="text-sm text-muted-foreground hover:text-primary-strong">← Akun Saya</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div><p className="font-mono text-sm text-muted-foreground">{o.order_number}</p><h1 className="text-2xl font-extrabold text-navy">{o.products?.title ?? "Layanan"}</h1><p className="text-sm text-muted-foreground">{o.package_name ? `Paket ${o.package_name} · ` : ""}{tanggal(o.created_at)}</p></div>
        <Badge className="text-sm">{orderStatusLabel(o.status)}</Badge>
      </div>
      <div className="mt-5"><div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Progres pengerjaan</span><span>{o.progress}%</span></div><Progress value={o.progress} /></div>

      {unpaid && (
        <section className="mt-8 rounded-2xl border-2 border-primary/40 bg-accent p-6">
          <h2 className="font-extrabold text-navy">Menunggu pembayaran {rupiah(unpaid.amount)}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Invoice {unpaid.invoice_number} · jatuh tempo {tanggal(unpaid.due_date)}</p>
          {banks && <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-card p-4 font-sans text-sm">{banks}</pre>}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild className="font-bold shadow-cta"><a href={waLink(settings.contact_whatsapp, confirmMsg)} target="_blank" rel="noreferrer"><MessageCircle /> Konfirmasi Pembayaran via WhatsApp</a></Button>
            <Button asChild variant="outline"><Link to="/invoice/$token" params={{ token: unpaid.public_token }}><FileText /> Lihat Invoice</Link></Button>
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <section className="rounded-2xl border bg-card p-6"><h2 className="mb-4 font-extrabold text-navy">Riwayat progres</h2><OrderTimeline updates={data.updates} /></section>
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-extrabold text-navy">Invoice</h2>
          <div className="mt-3 space-y-2">
            {data.invoices.map((i) => (
              <Link key={i.id} to="/invoice/$token" params={{ token: i.public_token }} className="block rounded-xl border p-3 hover:border-primary">
                <p className="font-mono text-sm font-bold">{i.invoice_number}</p>
                <p className="text-xs text-muted-foreground">{paymentKind(i.payment_stage)} · {rupiah(i.amount)} · {i.status === "paid" ? "Lunas" : i.status === "cancelled" ? "Batal" : "Belum dibayar"}</p>
              </Link>
            ))}
          </div>
          {o.brief && <><h3 className="mt-5 text-sm font-bold text-navy">Brief Anda</h3><p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{o.brief}</p></>}
        </section>
      </div>
    </div>
  );
}
