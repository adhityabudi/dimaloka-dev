import { createFileRoute, Link, notFound, useLoaderData } from "@tanstack/react-router";
import { BadgeCheck, ChevronRight, Clock, ShieldCheck, Wallet } from "lucide-react";
import { getCategory, getPortfolio, getServiceContent } from "@/lib/public.functions";
import { portfolioPage } from "@/lib/portfolio";
import { ProductCard } from "@/components/site/ProductCard";
import { WaCta } from "@/components/site/WaCta";
import { CategoryIcon } from "@/components/site/CategoryIcon";
import { jsonLd, pageMeta } from "@/lib/site";
import { WebsiteServicePage } from "@/components/site/WebsiteServicePage";
import { ServiceLandingPage } from "@/components/site/ServiceLandingPage";
import { LANDING_SLUGS, serviceContent, servicePortfolio } from "@/lib/services";

export const Route = createFileRoute("/kategori/$slug")({
  loader: async ({ params }) => {
    const d = await getCategory({ data: { slug: params.slug } });
    if (!d) throw notFound();
    const landing = (LANDING_SLUGS as string[]).includes(params.slug) ? await getServiceContent({ data: { slug: params.slug } }) : null;
    return { ...d, landing, portfolio: params.slug === "website" ? await getPortfolio() : landing?.portfolio ?? null };
  },
  head: ({ loaderData, matches }) => {
    if (!loaderData) return { meta: [{ title: "Layanan tidak tersedia | Dimaloka" }, { name: "robots", content: "noindex" }] };
    const c = loaderData.category;
    const origin = (matches[0]?.loaderData as any)?.origin ?? "";
    const url = `${origin}/kategori/${c.slug}`;
    return {
      meta: [...pageMeta({ title: c.seo_title || `${c.name} | Dimaloka`, description: c.seo_description || c.description || "" }), { name: "keywords", content: c.keywords.join(", ") }],
      links: origin ? [{ rel: "canonical", href: url }] : [],
      scripts: [jsonLd({ "@context": "https://schema.org", "@type": "CollectionPage", name: c.name, description: c.seo_description, url })],
    };
  },
  component: CategoryPage,
});

const features = [
  { icon: BadgeCheck, t: "Brand terkurasi", d: "Hanya penyedia jasa terpilih." },
  { icon: Wallet, t: "Harga transparan", d: "Paket jelas tanpa biaya tersembunyi." },
  { icon: Clock, t: "Respons cepat", d: "Admin membalas dalam hitungan menit." },
  { icon: ShieldCheck, t: "Invoice resmi", d: "Setiap transaksi tercatat rapi." },
];

function CategoryPage() {
  const { category: c, products, portfolio, landing } = Route.useLoaderData();
  const { layout } = useLoaderData({ from: "__root__" });
  if (c.slug === "website") return <WebsiteServicePage products={products} phone={layout.settings.contact_whatsapp} portfolio={portfolioPage(portfolio)} />;
  const slug = LANDING_SLUGS.find(s => s === c.slug);
  if (slug && landing) return <ServiceLandingPage slug={slug} name={c.name} content={serviceContent(slug, landing.content)} portfolio={servicePortfolio(slug, portfolio)} products={products} phone={layout.settings.contact_whatsapp} />;
  return (
    <>
      <section className="bg-gradient-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-navy-foreground/70">
            <Link to="/" className="hover:text-primary">Beranda</Link><ChevronRight className="h-4 w-4" /><span>{c.name}</span>
          </nav>
          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><CategoryIcon icon={c.icon} className="h-7 w-7" /></div>
            <h1 className="text-3xl font-extrabold md:text-5xl">{c.name}</h1>
          </div>
          <p className="mt-4 max-w-2xl text-navy-foreground/75">{c.seo_description || c.description}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.t} className="flex gap-3 rounded-2xl border bg-card p-4 shadow-card">
              <f.icon className="h-6 w-6 shrink-0 text-primary" />
              <div><p className="font-bold text-navy">{f.t}</p><p className="text-sm text-muted-foreground">{f.d}</p></div>
            </div>
          ))}
        </div>
        <h2 className="mt-12 text-2xl font-extrabold text-navy">Layanan {c.name} ({products.length})</h2>
        {products.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed p-10 text-center text-muted-foreground">Belum ada layanan di sini.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p: any) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
      <WaCta phone={layout.settings.contact_whatsapp} title={`Butuh ${c.name}?`} />
    </>
  );
}
