import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, FolderTree, Package, Plus, Receipt, ShoppingBag, Users, Wallet } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { rupiah, tanggal } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

function Dashboard() {
  const [days, setDays] = useState(7);
  const { data } = useQuery({
    queryKey: ["admin-dash"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const [p, c, o, inv, buyers, recentO, recentI] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id,created_at,amount"),
        supabase.from("invoices").select("amount,paid_at,status"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("orders").select("*, products(title)").order("created_at", { ascending: false }).limit(5),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      return { products: p.count ?? 0, categories: c.count ?? 0, orders: o.data ?? [], invoices: inv.data ?? [], buyers: buyers.count ?? 0, recentO: recentO.data ?? [], recentI: recentI.data ?? [] };
    },
  });
  const paid = (data?.invoices ?? []).filter((i) => i.status === "paid");
  const revenue = paid.reduce((s, i) => s + Number(i.amount), 0);
  const chart = Array.from({ length: days }).map((_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 864e5);
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      order: (data?.orders ?? []).filter((o) => o.created_at.slice(0, 10) === key).length,
      pendapatan: paid.filter((x) => x.paid_at?.slice(0, 10) === key).reduce((s, x) => s + Number(x.amount), 0),
    };
  });
  const stats = [
    { label: "Total Produk", v: data?.products ?? 0, icon: Package },
    { label: "Total Kategori", v: data?.categories ?? 0, icon: FolderTree },
    { label: "Total Order", v: data?.orders.length ?? 0, icon: ShoppingBag },
    { label: "Pendapatan", v: rupiah(revenue), icon: Wallet },
    { label: "Buyer Baru (30 hari)", v: data?.buyers ?? 0, icon: Users },
  ];
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-navy">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm"><Link to="/admin/produk/new"><Plus /> Produk</Link></Button>
          <Button asChild size="sm" variant="outline"><Link to="/admin/invoice/new"><Receipt /> Invoice</Link></Button>
          <Button asChild size="sm" variant="outline"><Link to="/admin/artikel/new"><FileText /> Artikel</Link></Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-card">
            <s.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-extrabold text-navy">{s.v}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-navy">Order & Pendapatan</h2>
          <div className="flex gap-1">{[7, 30].map((d) => <Button key={d} size="sm" variant={d === days ? "default" : "outline"} onClick={() => setDays(d)}>{d} hari</Button>)}</div>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <AreaChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis yAxisId="l" fontSize={12} allowDecimals={false} />
              <YAxis yAxisId="r" orientation="right" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v: any, n: any) => (n === "pendapatan" ? rupiah(v) : v)} />
              <Area yAxisId="l" dataKey="order" stroke="var(--navy-2)" fill="var(--navy-2)" fillOpacity={0.15} />
              <Area yAxisId="r" dataKey="pendapatan" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex justify-between"><h2 className="font-bold text-navy">Order terbaru</h2><Link to="/admin/order" className="text-sm text-primary-strong">Semua</Link></div>
          <div className="mt-3 divide-y">{(data?.recentO ?? []).map((o: any) => <div key={o.id} className="flex justify-between py-2 text-sm"><span>{o.buyer_name} · {o.products?.title}</span><Badge variant="secondary">{o.status}</Badge></div>)}{data?.recentO.length === 0 && <p className="py-4 text-sm text-muted-foreground">Belum ada order.</p>}</div>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex justify-between"><h2 className="font-bold text-navy">Invoice terbaru</h2><Link to="/admin/invoice" className="text-sm text-primary-strong">Semua</Link></div>
          <div className="mt-3 divide-y">{(data?.recentI ?? []).map((i) => <div key={i.id} className="flex justify-between py-2 text-sm"><span className="font-mono">{i.invoice_number}</span><span>{rupiah(i.amount)} · {tanggal(i.created_at)}</span></div>)}{data?.recentI.length === 0 && <p className="py-4 text-sm text-muted-foreground">Belum ada invoice.</p>}</div>
        </div>
      </div>
    </div>
  );
}
