import { createFileRoute, notFound } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { getStore } from "@/lib/public.functions";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { jsonLd, pageMeta } from "@/lib/site";
import { waLink } from "@/lib/format";

export const Route = createFileRoute("/store/$slug")({
  loader: async ({ params }) => {
    const d = await getStore({ data: { slug: params.slug } });
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData, matches }) => {
    if (!loaderData) return { meta: [{ title: "Toko tidak tersedia | Dimaloka" }, { name: "robots", content: "noindex" }] };
    const s = loaderData.seller;
    const origin = (matches[0]?.loaderData as any)?.origin ?? "";
    const desc = `${s.description ?? ""} Lihat semua layanan ${s.name} dan order mudah via WhatsApp di Dimaloka.`.trim();
    return {
      meta: pageMeta({ title: `${s.name} — Toko Jasa di Dimaloka`, description: desc }),
      links: origin ? [{ rel: "canonical", href: `${origin}/store/${s.slug}` }] : [],
      scripts: [jsonLd({ "@context": "https://schema.org", "@type": "Organization", name: s.name, description: s.description, logo: s.logo_url, url: `${origin}/store/${s.slug}` })],
    };
  },
  component: StorePage,
});

function StorePage() {
  const { seller: s, products } = Route.useLoaderData();
  return (
    <>
      <section className="bg-gradient-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-12 md:flex-row md:items-center">
          {s.logo_url && <img src={s.logo_url} alt={`Logo ${s.name}`} className="h-24 w-24 rounded-2xl bg-background object-cover ring-4 ring-navy-foreground/10" />}
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold md:text-4xl">{s.name}</h1>
            <p className="mt-2 max-w-2xl text-navy-foreground/75">{s.description}</p>
          </div>
          <Button asChild size="lg" className="rounded-xl font-bold shadow-cta">
            <a href={waLink(s.whatsapp, `Halo ${s.name}, saya menemukan toko Anda di Dimaloka.`)} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a>
          </Button>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-extrabold text-navy">Layanan dari {s.name}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((p: any) => <ProductCard key={p.id} p={p} />)}</div>
      </section>
    </>
  );
}
