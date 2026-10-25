import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioCard } from "./PortfolioCard";
import { filterPortfolio, portfolioPage, type PortfolioPage } from "@/lib/portfolio";

export function PortfolioSection({ page: value, service = "website", label = "Portfolio Website", whatsapp }: { page?: PortfolioPage | null; service?: string; label?: string; whatsapp?: string }) {
  const page = value ?? portfolioPage(value);
  const projects = filterPortfolio(page.projects, "Semua", "").filter(p => p.featured).slice(0, 3);
  return <section className="border-y bg-muted py-14 sm:py-20"><div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
    <p className="text-xs font-semibold uppercase text-primary-strong">{label}</p>
    <div className="mt-4 flex flex-wrap items-end justify-between gap-6"><div className="max-w-2xl"><h2 className="text-3xl font-bold leading-tight sm:text-4xl">{page.section_title}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{page.section_description}</p></div><Button asChild variant="outline" className="h-11 rounded-md bg-background"><Link to="/portfolio/$service" params={{ service }}>{page.section_button}<ArrowUpRight className="size-4" /></Link></Button></div>
    <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{projects.map(p => <PortfolioCard key={p.id} project={p} whatsapp={whatsapp} />)}</div>
  </div></section>;
}