import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Check, ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { rupiah, waLink } from "@/lib/format";
import { PortfolioSection } from "./PortfolioSection";
import type { PortfolioPage } from "@/lib/portfolio";
import type { ServiceContent } from "@/lib/services";

type Service = { id: string; slug: string; title: string; short_description: string | null; price: number };

export function ServiceLandingPage({ slug, name, content: c, portfolio, products, phone, revision }: { slug: string; name: string; content: ServiceContent; portfolio: PortfolioPage; products: Service[]; phone?: string; revision?: string }) {
  const contact = waLink(phone, c.wa_message);
  const wrap = "mx-auto max-w-7xl px-6 sm:px-10 lg:px-16";
  return <>
    <section className="bg-navy text-navy-foreground">
      <div className={`${wrap} pt-6`}>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-navy-foreground/60"><Link to="/" className="hover:text-primary">Beranda</Link><ChevronRight className="size-3" /><span>{name}</span></nav>
        <div className="grid items-center gap-10 pb-12 pt-8 md:grid-cols-2 md:gap-14 md:pb-16 md:pt-12">
          <div className="max-w-[540px]">
            <p className="text-xs font-semibold uppercase text-primary">{c.eyebrow}</p>
            <h1 className="mt-4 text-3xl font-bold leading-[1.15] sm:text-4xl lg:text-5xl">{c.title}</h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-navy-foreground/75 sm:text-base">{c.description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3"><Button asChild className="h-12 rounded-md px-5 font-semibold"><a href={contact} target="_blank" rel="noreferrer">Konsultasi {name} <ArrowUpRight className="size-4" /></a></Button><Button asChild variant="link" className="h-12 text-navy-foreground"><a href="#layanan">Lihat layanan <ArrowDown className="size-4" /></a></Button></div>
            {c.tags.length > 0 && <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs text-navy-foreground/70">{c.tags.map(t => <span key={t} className="flex items-center gap-2"><Sparkles className="size-4 text-primary" />{t}</span>)}</div>}
          </div>
          {c.hero_image && <div className="hero-float mx-auto w-full max-w-[480px] overflow-hidden rounded-lg border border-navy-foreground/10 shadow-card"><img src={c.hero_image} alt={c.hero_alt} width={1024} height={1024} fetchPriority="high" className="h-auto w-full object-contain" /></div>}
        </div>
      </div>
    </section>

    <section className="py-14 sm:py-20"><div className="mx-auto max-w-4xl px-6 text-center">{revision ? <div className="prose-content text-left" dangerouslySetInnerHTML={{ __html: revision }} /> : <><p className="text-xs font-semibold uppercase text-primary-strong">{c.intro_eyebrow}</p><h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{c.intro_title}</h2><p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-muted-foreground">{c.intro_text}</p></>}</div></section>

    {c.features.map((f, i) => <section key={i} className={i % 2 === 1 ? "bg-muted py-14 sm:py-20" : "pb-14 sm:pb-20" + (i > 0 ? " pt-14 sm:pt-20" : "")}>
      <div className={`${wrap} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
        {f.image && <img src={f.image} alt={f.image_alt} width={1536} height={1024} loading="lazy" className={`h-auto w-full rounded-lg object-contain ${i % 2 === 1 ? "lg:order-2" : ""}`} />}
        <div><p className="text-xs font-semibold uppercase text-primary-strong">{f.eyebrow}</p><h2 className="mt-4 text-3xl font-bold leading-tight">{f.title}</h2><p className="mt-5 text-sm leading-7 text-muted-foreground">{f.text}</p>{f.points.length > 0 && <ul className="mt-6 space-y-3 text-sm">{f.points.map(t => <li key={t} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-primary-strong" />{t}</li>)}</ul>}</div>
      </div>
    </section>)}

    <section className="border-y bg-muted py-14 sm:py-20"><div className={wrap}><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-semibold uppercase text-primary-strong">{c.basics_eyebrow}</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{c.basics_title}</h2><p className="mt-5 text-sm leading-7 text-muted-foreground">{c.basics_text}</p></div>
      <div className="mt-12 grid gap-x-12 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">{c.basics.map((b, i) => <div key={i}><span className="text-sm font-bold text-primary-strong">{String(i + 1).padStart(2, "0")}</span><h3 className="mt-3 text-base font-bold">{b.title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{b.text}</p></div>)}</div></div></section>

    <section id="layanan" className="scroll-mt-24 py-14 sm:py-20"><div className={wrap}><p className="text-xs font-semibold uppercase text-primary-strong">{c.services_eyebrow}</p><div className="mt-4 flex flex-wrap items-end justify-between gap-4"><h2 className="text-3xl font-bold sm:text-4xl">{c.services_title}</h2><span className="text-sm text-muted-foreground">{products.length} layanan tersedia</span></div>
      <div className="mt-9 grid gap-6 md:grid-cols-2">{products.map(p => <article key={p.id} className="rounded-lg border bg-card p-6 sm:p-8"><h3 className="text-2xl font-bold">{p.title}</h3><p className="mt-3 min-h-14 text-sm leading-7 text-muted-foreground">{p.short_description}</p><div className="mt-6 flex flex-wrap items-center justify-between gap-5 border-t pt-6"><div><p className="text-xs text-muted-foreground">{p.price > 0 ? "Mulai dari" : "Penawaran"}</p><p className="mt-1 text-2xl font-bold">{p.price > 0 ? rupiah(p.price) : "Sesuai kebutuhan"}</p></div><Button asChild variant="outline" className="h-11 rounded-md"><Link to="/p/$slug" params={{ slug: p.slug }}>Detail layanan <ArrowUpRight className="size-4" /></Link></Button></div></article>)}</div>
      {products.length === 0 && <p className="mt-8 text-muted-foreground">Belum ada layanan tersedia.</p>}</div></section>

    <PortfolioSection page={portfolio} service={slug} label={`Portfolio ${name}`} whatsapp={phone} />

    <section className="border-t py-14 sm:py-20"><div className={`${wrap} grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20`}><div><p className="text-xs font-semibold uppercase text-primary-strong">Sebelum Memulai</p><h2 className="mt-4 text-3xl font-bold leading-tight">{c.faq_title}</h2><p className="mt-5 text-sm leading-7 text-muted-foreground">Masih ada yang ingin ditanyakan? Sampaikan kebutuhan Anda melalui WhatsApp.</p></div><Accordion type="single" collapsible>{c.faq.map((f, i) => <AccordionItem key={i} value={`q-${i}`}><AccordionTrigger className="py-5 text-left text-sm font-semibold">{f.q}</AccordionTrigger><AccordionContent className="text-sm leading-7 text-muted-foreground">{f.a}</AccordionContent></AccordionItem>)}</Accordion></div></section>

    <section className="bg-navy py-14 text-navy-foreground sm:py-20"><div className={`${wrap} flex flex-wrap items-center justify-between gap-8`}><div className="max-w-2xl"><p className="text-xs font-semibold uppercase text-primary">{c.cta_eyebrow}</p><h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{c.cta_title}</h2><p className="mt-5 max-w-xl text-sm leading-7 text-navy-foreground/75">{c.cta_text}</p></div><Button asChild className="h-12 rounded-md px-6 font-semibold"><a href={contact} target="_blank" rel="noreferrer"><MessageCircle className="size-4" />{c.cta_button} <ArrowUpRight className="size-4" /></a></Button></div></section>
  </>;
}
