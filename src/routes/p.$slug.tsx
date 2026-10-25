import { publicPageHead } from "@/lib/structured-data";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ChevronRight, MessageCircle, ShoppingCart, Star, Store } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { getProduct } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { pageMeta } from "@/lib/site";
import { rupiah, waLink } from "@/lib/format";

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const d = await getProduct({ data: { slug: params.slug } });
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData, matches }) => {
    if (!loaderData) return { meta: [...pageMeta({ title: "Halaman tidak tersedia | Dimaloka", description: "Halaman yang Anda cari tidak tersedia." }), { name: "robots", content: "noindex" }] };
    return publicPageHead("product", loaderData, matches[0]?.loaderData as any);
  },
  component: ProductPage,
});

function ProductPage() {
  const { product: p, related, reviews } = Route.useLoaderData();
  const seller = p.sellers as any;
  const cat = p.categories as any;
  const gallery = ((p.gallery as string[]) ?? []).length ? (p.gallery as string[]) : p.cover_image ? [p.cover_image] : [];
  const packages = (p.packages as { name: string; price: number; items: string[] }[]) ?? [];
  const [img, setImg] = useState(0);
  const [pkg, setPkg] = useState(0);
  const phone = p.whatsapp_cta || seller?.whatsapp;
  const chosen = packages[pkg];
  const { user } = useAuth();
  const checkoutPath = `/checkout/${p.slug}${chosen ? `?paket=${encodeURIComponent(chosen.name)}` : ""}`;
  const msg = `Halo, saya tertarik dengan layanan "${p.title}"${chosen ? ` paket ${chosen.name} (${rupiah(chosen.price)})` : ""} di Dimaloka.`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary-strong">Beranda</Link><ChevronRight className="h-4 w-4" />
        {cat && <><Link to="/layanan/$slug" params={{ slug: cat.slug }} className="hover:text-primary-strong">{cat.name}</Link><ChevronRight className="h-4 w-4" /></>}
        <span className="text-navy">{p.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-2xl border bg-muted">
            {gallery[img] && <img src={gallery[img]} alt={`${p.title} - gambar ${img + 1}`} className="aspect-[16/10] w-full object-cover" />}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setImg(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${i === img ? "border-primary" : "border-transparent"}`}>
                  <img loading="lazy" decoding="async" src={g} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <h1 className="mt-8 text-3xl font-extrabold text-navy md:text-4xl">{p.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            {seller && <Link to="/store/$slug" params={{ slug: seller.slug }} className="flex items-center gap-1 font-semibold text-navy-2 hover:underline"><Store className="h-4 w-4" /> {seller.name}</Link>}
            <span className="flex items-center gap-1 font-semibold"><Star className="h-4 w-4 fill-primary text-primary" /> 4.9 (120 ulasan)</span>
            {p.tags.map((t) => <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">#{t}</span>)}
          </div>
          <p className="mt-4 text-lg text-muted-foreground">{p.short_description}</p>

          <h2 className="mt-10 text-xl font-extrabold text-navy">Deskripsi</h2>
          <div className="prose-content mt-2 text-foreground/90" dangerouslySetInnerHTML={{ __html: p.description ?? "" }} />

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border p-5">
              <h2 className="font-extrabold text-navy">Fitur</h2>
              <ul className="mt-3 space-y-2">{((p.features as string[]) ?? []).map((f) => <li key={f} className="flex gap-2 text-sm"><Check className="h-4 w-4 shrink-0 text-success" /> {f}</li>)}</ul>
            </div>
            <div className="rounded-2xl border p-5">
              <h2 className="font-extrabold text-navy">Manfaat</h2>
              <ul className="mt-3 space-y-2">{((p.benefits as string[]) ?? []).map((f) => <li key={f} className="flex gap-2 text-sm"><Check className="h-4 w-4 shrink-0 text-primary" /> {f}</li>)}</ul>
            </div>
          </div>

          <h2 className="mt-10 text-xl font-extrabold text-navy">Ulasan</h2>
          <div className="mt-4 space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border p-5">
                <div className="flex items-center gap-3">
                  {r.photo_url && <img src={r.photo_url} alt={r.name} loading="lazy" className="h-9 w-9 rounded-full" />}
                  <div><p className="font-bold text-navy">{r.name}</p><div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />)}</div></div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{r.content}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <p className="text-sm text-muted-foreground">{p.price > 0 ? "Harga mulai" : "Penawaran"}</p>
            <p className="text-3xl font-extrabold text-primary-strong">{p.price > 0 ? rupiah(p.price) : "Sesuai kebutuhan"}</p>
            {packages.length > 0 && (
              <div className="mt-5 space-y-3">
                {packages.map((k, i) => (
                  <button key={k.name} onClick={() => setPkg(i)} className={`w-full rounded-xl border-2 p-4 text-left transition ${i === pkg ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}>
                    <div className="flex items-center justify-between"><span className="font-bold text-navy">{k.name}</span><span className="font-extrabold text-primary-strong">{rupiah(k.price)}</span></div>
                    <ul className="mt-2 space-y-1">{(k.items ?? []).map((it) => <li key={it} className="flex gap-2 text-xs text-muted-foreground"><Check className="h-3.5 w-3.5 text-success" /> {it}</li>)}</ul>
                  </button>
                ))}
              </div>
            )}
            {p.price > 0 && <Button asChild size="lg" className="mt-5 h-12 w-full rounded-xl font-bold shadow-cta">
              {user ? <Link to="/checkout/$slug" params={{ slug: p.slug }} search={{ paket: chosen?.name }}><ShoppingCart /> Pesan Sekarang</Link>
                : <Link to="/auth/sign-in" search={{ redirect: checkoutPath }}><ShoppingCart /> Pesan Sekarang</Link>}
            </Button>}
            {p.price <= 0 && <p className="mt-5 text-sm text-muted-foreground">Biaya ditentukan setelah kebutuhan dan ruang lingkup disepakati.</p>}
            {p.price > 0 && !user && <p className="mt-2 text-center text-xs text-muted-foreground">Masuk atau daftar gratis untuk melanjutkan pesanan.</p>}
            <Button asChild size="lg" variant="outline" className="mt-2 h-12 w-full rounded-xl font-bold">
              <a href={waLink(phone, msg)} target="_blank" rel="noreferrer"><MessageCircle /> Tanya via Chat</a>
            </Button>
            <Button asChild size="lg" variant="ghost" className="mt-1 h-10 w-full rounded-xl font-semibold">
              <a href={waLink(phone, `Halo ${seller?.name ?? ""}, saya ingin bertanya tentang "${p.title}".`)} target="_blank" rel="noreferrer">Hubungi Seller</a>
            </Button>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold text-navy">Layanan terkait</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((r: any) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}
