import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { rupiah, tanggal } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { paymentKind } from "@/lib/invoice-payments";
import { orderStatusLabel } from "@/lib/checkout";

export const Route = createFileRoute("/_authenticated/akun")({
  head: () => ({ meta: [{ title: "Akun Saya | Dimaloka" }, { name: "robots", content: "noindex" }] }),
  component: Akun,
});

function Akun() {
  const { user } = Route.useRouteContext();
  const orders = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => (await supabase.from("orders").select("*, products(title,slug)").eq("buyer_id", user.id).order("created_at", { ascending: false })).data ?? [],
  });
  const invoices = useQuery({
    queryKey: ["my-invoices"],
    queryFn: async () => (await supabase.from("invoices").select("*").eq("buyer_id", user.id).neq("status", "draft").order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-navy">Akun Saya</h1>
      <p className="text-muted-foreground">{user.email}</p>
      <h2 className="mt-10 text-xl font-extrabold text-navy">Pesanan Saya</h2>
      <div className="mt-4 space-y-3">
        {(orders.data ?? []).map((o: any) => (
          <Link key={o.id} to="/pesanan/$id" params={{ id: o.id }} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4 hover:border-primary">
            <div><p className="font-mono text-xs text-muted-foreground">{o.order_number}</p><p className="font-bold">{o.products?.title ?? "Layanan"}</p><p className="text-sm text-muted-foreground">{o.package_name ? `Paket ${o.package_name} · ` : ""}{tanggal(o.created_at)} · progres {o.progress}%</p></div>
            <div className="flex items-center gap-3"><span className="font-bold">{rupiah(o.amount)}</span><Badge variant={o.status === "awaiting_payment" ? "default" : "secondary"}>{orderStatusLabel(o.status)}</Badge><ChevronRight className="h-4 w-4 text-muted-foreground" /></div>
          </Link>
        ))}
        {orders.data?.length === 0 && <p className="text-sm text-muted-foreground">Belum ada pesanan. <Link to="/layanan" className="text-primary-strong underline">Jelajahi layanan</Link></p>}
      </div>
      <h2 className="mt-10 text-xl font-extrabold text-navy">Invoice</h2>
      <div className="mt-4 space-y-3">
        {(invoices.data ?? []).map((i) => (
          <Link key={i.id} to="/invoice/$token" params={{ token: i.public_token }} className="flex items-center justify-between rounded-xl border p-4 hover:border-primary">
            <div><p className="font-mono font-bold">{i.invoice_number}</p><p className="text-sm text-muted-foreground">{tanggal(i.created_at)} · {paymentKind(i.payment_stage)}</p></div>
            <div className="flex items-center gap-3"><span className="font-bold">{rupiah(i.amount)}</span><Badge>{i.status === "paid" ? i.payment_stage === "dp" ? "DP Dibayar" : "Lunas" : i.status === "cancelled" ? "Batal" : "Belum Dibayar"}</Badge></div>
          </Link>
        ))}
        {invoices.data?.length === 0 && <p className="text-sm text-muted-foreground">Belum ada invoice.</p>}
      </div>
    </div>
  );
}
