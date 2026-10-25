import { publicPageHead } from "@/lib/structured-data";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { getPortfolioOverview } from "@/lib/public.functions";
import { masterPage, SERVICE_SLUGS, servicePortfolio } from "@/lib/services";
import { pageMeta } from "@/lib/site";
import { waLink } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portfolio/")({
  loader: () => getPortfolioOverview(),
  head: ({ loaderData, matches }) => {
    return publicPageHead("portfolio", loaderData, matches[0]?.loaderData as any);
  },
  component: PortfolioMaster,
});

function PortfolioMaster() {
  const { master, services } = Route.useLoaderData();
  const { layout } = useLoaderData({ from: "__root__" });
  const m = masterPage(master);
  const cards = SERVICE_SLUGS.map(slug => ({ slug, p: servicePortfolio(slug, services[slug]) }));
  return <>
    <section className="bg-navy text-navy-foreground"><div className="mx-auto max-w-4xl px-6 py-14 text-center sm:py-16"><p className="text-xs font-semibold uppercase text-primary">{m.eyebrow}</p><h1 className="mt-5 text-4xl font-bold sm:text-5xl">{m.title}</h1><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-navy-foreground/75">{m.description}</p></div></section>
    <section className="bg-muted py-12 sm:py-16"><div className="mx-auto max-w-7xl px-6 sm:px-10">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{cards.map(({ slug, p }) => {
        const count = p.projects.filter(x => x.published).length;
        return <article key={slug} className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-card">
          <Link to="/portfolio/$service" params={{ service: slug }} className="block overflow-hidden border-b bg-background">{p.card_image ? <img src={p.card_image} alt={`Portfolio ${p.card_title}`} loading="lazy" width={1024} height={768} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <div className="aspect-[4/3]" />}</Link>
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-navy">{p.card_title}</h2><span className="shrink-0 rounded bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">{count} karya</span></div>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{p.card_description}</p>
            <Button asChild className="mt-5 h-10 w-full rounded-md font-semibold"><Link to="/portfolio/$service" params={{ service: slug }}>Lihat portfolio<ArrowUpRight className="size-4" /></Link></Button>
          </div>
        </article>;
      })}</div>
    </div></section>
    <section className="border-t py-14 sm:py-20"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-6 sm:px-10"><div className="max-w-2xl"><h2 className="text-3xl font-bold leading-tight text-navy">{m.cta_title}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{m.cta_description}</p></div><Button asChild className="h-12 rounded-md"><a href={waLink(layout.settings.contact_whatsapp, "Halo Dimaloka, saya ingin konsultasi setelah melihat portfolio.")} target="_blank" rel="noreferrer">{m.cta_button}<ArrowUpRight className="size-4" /></a></Button></div></section>
  </>;
}
