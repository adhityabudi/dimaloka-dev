import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getProduct } from "@/lib/public.functions";
import { createCheckout } from "@/lib/checkout.functions";
import { checkoutQuote, productPackages } from "@/lib/checkout";
import { rupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { pageMeta } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/checkout/$slug")({
  validateSearch: (s: Record<string, unknown>): { paket?: string } => ({ paket: typeof s.paket === "string" ? s.paket : undefined }),
  loader: async ({ params }) => {
    const d = await getProduct({ data: { slug: params.slug } });
    if (!d) throw notFound();
    return d.product;
  },
  head: () => ({ meta: [...pageMeta({ title: "Checkout | Dimaloka", description: "Lengkapi pesanan layanan digital Anda di Dimaloka." }), { name: "robots", content: "noindex, nofollow" }] }),
  component: Checkout,
});

function Checkout() {
  const p = Route.useLoaderData();
  const { paket } = Route.useSearch();
  const { user } = Route.useRouteContext() as any;
  const navigate = useNavigate();
  const submitFn = useServerFn(createCheckout);
  const pkgs = productPackages(p);
  const [pkg, setPkg] = useState<string | null>(pkgs.find((k) => k.name === paket)?.name ?? pkgs[0]?.name ?? null);
  const [stage, setStage] = useState<"full" | "dp">("full");
  const [name, setName] = useState<string>(user?.user_metadata?.full_name ?? "");
  const [wa, setWa] = useState("");
  const [brief, setBrief] = useState("");
  const [busy, setBusy] = useState(false);
  let quote: ReturnType<typeof checkoutQuote> | null = null;
  try { quote = checkoutQuote(p, pkg, stage); } catch { quote = null; }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await submitFn({ data: { slug: p.slug, packageName: pkg, stage, buyer_name: name, buyer_wa: wa, brief } });
      toast.success("Pesanan berhasil dibuat");
      navigate({ to: "/pesanan/$id", params: { id: r.id }, search: { baru: 1 } });
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal membuat pesanan");
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground"><Link to="/p/$slug" params={{ slug: p.slug }} className="hover:text-primary-strong">{p.title}</Link><ChevronRight className="h-4 w-4" /><span className="text-navy">Checkout</span></nav>
      <h1 className="mt-4 text-3xl font-extrabold text-navy">Checkout Pesanan</h1>
      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {pkgs.length > 0 && (
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="font-extrabold text-navy">1. Pilih paket</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {pkgs.map((k) => (
                  <button type="button" key={k.name} onClick={() => setPkg(k.name)} className={`rounded-xl border-2 p-4 text-left transition ${pkg === k.name ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}>
                    <div className="flex justify-between gap-2"><span className="font-bold text-navy">{k.name}</span><span className="font-extrabold text-primary-strong">{rupiah(k.price)}</span></div>
                    <ul className="mt-2 space-y-1">{(k.items ?? []).slice(0, 4).map((it) => <li key={it} className="flex gap-2 text-xs text-muted-foreground"><Check className="h-3.5 w-3.5 text-success" />{it}</li>)}</ul>
                  </button>
                ))}
              </div>
            </section>
          )}
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="font-extrabold text-navy">{pkgs.length ? "2" : "1"}. Data pemesan</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="nm">Nama lengkap</Label><Input id="nm" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
              <div><Label htmlFor="wa">Nomor WhatsApp</Label><Input id="wa" required inputMode="tel" placeholder="08xxxxxxxxxx" value={wa} onChange={(e) => setWa(e.target.value)} className="mt-1" /></div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Email: {user?.email}</p>
            <div className="mt-4"><Label htmlFor="br">Catatan / brief kebutuhan</Label><Textarea id="br" rows={5} placeholder="Ceritakan kebutuhan, referensi, dan target waktu pengerjaan." value={brief} onChange={(e) => setBrief(e.target.value)} className="mt-1" /></div>
          </section>
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="font-extrabold text-navy">{pkgs.length ? "3" : "2"}. Metode pembayaran</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([{ v: "full", t: "Bayar Penuh", d: "Lunas sekali bayar" }, { v: "dp", t: "DP 50%", d: "Sisa dibayar saat pelunasan" }] as const).map((o) => (
                <button type="button" key={o.v} onClick={() => setStage(o.v)} className={`rounded-xl border-2 p-4 text-left ${stage === o.v ? "border-primary bg-accent" : "border-border"}`}><p className="font-bold text-navy">{o.t}</p><p className="text-xs text-muted-foreground">{o.d}</p></button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Pembayaran melalui transfer bank. Setelah transfer, konfirmasi ke admin lewat WhatsApp.</p>
          </section>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="font-extrabold text-navy">Ringkasan</h2>
            <p className="mt-3 text-sm font-semibold">{p.title}</p>
            {pkg && <p className="text-sm text-muted-foreground">Paket {pkg}</p>}
            <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Total layanan</dt><dd className="font-semibold">{rupiah(quote?.total ?? 0)}</dd></div>
              {stage === "dp" && <div className="flex justify-between"><dt className="text-muted-foreground">Sisa pelunasan</dt><dd>{rupiah((quote?.total ?? 0) - (quote?.dp ?? 0))}</dd></div>}
              <div className="flex justify-between border-t pt-3 text-base"><dt className="font-bold text-navy">Bayar sekarang</dt><dd className="font-extrabold text-primary-strong">{rupiah(quote?.amount ?? 0)}</dd></div>
            </dl>
            <Button disabled={busy || !quote} size="lg" className="mt-5 h-12 w-full rounded-xl font-bold shadow-cta">{busy ? "Memproses..." : "Buat Pesanan"}</Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Invoice dibuat otomatis setelah pesanan dibuat.</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
