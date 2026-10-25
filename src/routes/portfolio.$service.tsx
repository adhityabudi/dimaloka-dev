import { createFileRoute, Link, notFound, useLoaderData } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, ChevronRight, Search, X } from "lucide-react";
import { getServicePortfolio } from "@/lib/public.functions";
import { filterPortfolio } from "@/lib/portfolio";
import { isServiceSlug, SERVICE_NAMES, servicePortfolio } from "@/lib/services";
import { pageMeta, jsonLd } from "@/lib/site";
import { waLink } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PortfolioCard } from "@/components/site/PortfolioCard";

export const Route = createFileRoute("/portfolio/$service")({
  loader: async ({ params }) => {
    if (!isServiceSlug(params.service)) throw notFound();
    return { slug: params.service, value: await getServicePortfolio({ data: { slug: params.service } }) };
  },
  head: ({ loaderData, matches }) => {
    if (!loaderData) return { meta: [{ title: "Portfolio tidak tersedia | Dimaloka" }, { name: "robots", content: "noindex" }] };
    const p = servicePortfolio(loaderData.slug, loaderData.value);
    const origin = (matches[0]?.loaderData as { origin?: string })?.origin;
    return { meta: [...pageMeta({ title: p.seo_title, description: p.seo_description, image: p.cover_image }), { name: "keywords", content: p.keywords.join(", ") }], links: origin ? [{ rel: "canonical", href: `${origin}/portfolio/${loaderData.slug}` }] : [], scripts: [jsonLd({ "@context": "https://schema.org", "@type": "CollectionPage", name: p.seo_title, description: p.seo_description })] };
  },
  component: Portfolio,
});
function Portfolio() {
  const { slug, value } = Route.useLoaderData();
  const p = servicePortfolio(slug, value);
  const { layout } = useLoaderData({ from: "__root__" });
  const [category, setCategory] = useState("Semua");
  const [prev, setPrev] = useState(slug);
  if (prev !== slug) { setPrev(slug); setCategory("Semua"); }
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(6);
  const projects = filterPortfolio(p.projects, category, search);
  return <>
    <section className="relative isolate overflow-hidden bg-navy text-navy-foreground">
      {p.cover_image && <img src={p.cover_image} alt="" width={1920} height={600} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover" />}
      {p.cover_image && <div className="absolute inset-0 -z-10 bg-navy/80" />}
      <div className="mx-auto max-w-4xl px-6 py-14 text-center sm:py-16"><nav aria-label="Breadcrumb" className="mb-6 flex items-center justify-center gap-2 text-xs text-navy-foreground/60"><Link to="/portfolio" className="hover:text-primary">Portfolio</Link><ChevronRight className="size-3" /><span>{SERVICE_NAMES[slug]}</span></nav><p className="text-xs font-semibold uppercase text-primary">{p.eyebrow}</p><h1 className="mt-5 text-4xl font-bold sm:text-5xl">{p.title}</h1><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-navy-foreground/75">{p.description}</p></div>
    </section>
    <section className="bg-muted py-10 sm:py-14"><div className="mx-auto grid max-w-7xl gap-6 px-6 sm:px-10 lg:grid-cols-[190px_minmax(0,1fr)]">
      <aside className="self-start lg:sticky lg:top-24"><p className="mb-4 text-xs font-semibold uppercase text-muted-foreground">Kategori</p><div className="flex flex-wrap gap-2 lg:flex-col">{["Semua", ...p.categories].map(c => <Button key={c} variant={category === c ? "default" : "outline"} aria-pressed={category === c} onClick={() => { setCategory(c); setLimit(6); }} className="h-11 justify-start rounded-md text-xs font-semibold lg:w-full">{c}</Button>)}</div></aside>
      <div className="min-w-0"><div className="relative"><Search className="absolute left-4 top-3.5 size-4 text-muted-foreground" /><Input aria-label="Cari portfolio" placeholder="Cari nama proyek atau bidang usaha" value={search} onChange={e => { setSearch(e.target.value); setLimit(6); }} className="h-11 rounded-md bg-background pl-11 pr-12" />{search && <Button variant="ghost" size="icon" aria-label="Hapus pencarian" onClick={() => setSearch("")} className="absolute right-1 top-0.5"><X className="size-4" /></Button>}</div>
        <div className="mb-5 mt-4 flex justify-between text-xs text-muted-foreground"><span>{category === "Semua" ? "Semua portfolio" : category}</span><span>{projects.length} portfolio</span></div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{projects.slice(0, limit).map(project => <PortfolioCard key={project.id} project={project} />)}</div>
        {projects.length === 0 && <div className="py-20 text-center"><p className="font-semibold text-navy">Portfolio tidak ditemukan.</p><p className="mt-2 text-sm text-muted-foreground">Coba kategori atau kata pencarian lain.</p><Button variant="outline" className="mt-5" onClick={() => { setCategory("Semua"); setSearch(""); }}>Tampilkan semua</Button></div>}
        {projects.length > limit && <div className="mt-9 text-center"><Button variant="outline" onClick={() => setLimit(limit + 6)}>Muat lebih banyak</Button></div>}
      </div>
    </div></section>
    <section className="border-t py-14 sm:py-20"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-6 sm:px-10"><div className="max-w-2xl"><h2 className="text-3xl font-bold leading-tight text-navy">{p.cta_title}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{p.cta_description}</p></div><Button asChild className="h-12 rounded-md"><a href={waLink(layout.settings.contact_whatsapp, `Halo Dimaloka, saya ingin konsultasi ${SERVICE_NAMES[slug]} setelah melihat portfolio.`)} target="_blank" rel="noreferrer">{p.cta_button}<ArrowUpRight className="size-4" /></a></Button></div></section>
  </>;
}