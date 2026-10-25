import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, CreditCard, Eye, LayoutGrid, MessageCircle, Quote, ShieldCheck, Star, Zap } from "lucide-react";
import hero from "@/assets/hero.png";
import { getHome } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/site/CategoryIcon";
import { ProductCard } from "@/components/site/ProductCard";
import { WaCta } from "@/components/site/WaCta";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { jsonLd, pageMeta } from "@/lib/site";
import { tanggal, waLink } from "@/lib/format";

export const Route = createFileRoute("/")({
  loader: () => getHome(),
  head: ({ matches }) => {
    const root: any = matches[0]?.loaderData;
    const s = root?.layout?.settings ?? {};
    const origin = root?.origin ?? "";
    const title = s.global_seo_title ?? "Dimaloka — Marketplace Jasa Digital Terpercaya";
    const description = s.global_seo_description ?? "Marketplace jasa digital terpercaya.";
    return {
      meta: [...pageMeta({ title, description }), { name: "keywords", content: (s.global_keywords ?? []).join(", ") }],
      links: origin ? [{ rel: "canonical", href: `${origin}/` }] : [],
      scripts: [
        jsonLd({ "@context": "https://schema.org", "@type": "Organization", name: "Dimaloka", url: origin, email: s.contact_email }),
        jsonLd({ "@context": "https://schema.org", "@type": "WebSite", name: "Dimaloka", url: origin }),
      ],
    };
  },
  component: Index,
});

const steps = [
  { icon: LayoutGrid, t: "Pilih Layanan", d: "Jelajahi layanan sesuai kebutuhan bisnis Anda." },
  { icon: Eye, t: "Lihat Detail", d: "Bandingkan paket, fitur, dan harga setiap layanan." },
  { icon: MessageCircle, t: "Kontak Seller", d: "Diskusikan kebutuhan langsung via chat WhatsApp." },
  { icon: CreditCard, t: "Bayar & Akses", d: "Terima invoice resmi, bayar, dan proyek dimulai." },
];

function Index() {
  const data = Route.useLoaderData();
  const { layout } = useLoaderData({ from: "__root__" });
  const wa = (layout.settings.contact_whatsapp as string) ?? "6281234567890";
  const brands = [...data.sellers.map((s) => s.name), "Kopi Senja", "Tokoku.id", "Batik Nusa", "Rumah Kreatif", "UMKM Maju", "Laris Store"];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-navy text-navy-foreground">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky/30 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-navy-foreground/20 bg-navy-foreground/5 px-3 py-1 text-xs font-semibold">
              <Zap className="h-3.5 w-3.5 text-primary" /> Marketplace jasa digital #1 untuk UMKM
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
              Semua jasa digital bisnis Anda, <span className="text-primary">di satu tempat.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-navy-foreground/75">
              Website, desain, iklan, SEO, aplikasi, hingga video — dikerjakan brand terkurasi dengan harga transparan dan invoice resmi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-xl px-6 text-base font-bold shadow-cta">
                <a href={waLink(wa, "Halo Dimaloka, saya ingin konsultasi.")} target="_blank" rel="noreferrer"><MessageCircle /> Konsultasi Disini</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-navy-foreground/30 bg-transparent px-6 text-base font-bold text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground">
                <a href="#layanan">Lihat Layanan <ArrowRight /></a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-navy-foreground/75">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Brand terverifikasi</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Invoice resmi</span>
              <span className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Rating 4.9/5</span>
            </div>
          </div>
          <div className="relative">
            <img src={hero} alt="Ilustrasi layanan digital Dimaloka" width={1024} height={1024} className="hero-float mx-auto w-full max-w-lg drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="border-b bg-background py-8">
        <p className="text-center text-sm font-semibold text-muted-foreground">
          Dipercaya <span className="font-extrabold text-navy">500+ Brand</span> di seluruh Indonesia
        </p>
        <div className="relative mt-5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee gap-12">
            {[...brands, ...brands].map((b, i) => (
              <span key={i} className="whitespace-nowrap text-xl font-extrabold text-navy/30">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="layanan" className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-primary-strong">Layanan</p>
            <h2 className="mt-1 text-3xl font-extrabold text-navy md:text-4xl">Temukan jasa yang Anda butuhkan</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.categories.map((c, i) => (
            <Link key={c.id} to="/layanan/$slug" params={{ slug: c.slug }} className="group relative flex gap-4 rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-1 hover:border-primary/50">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${i % 3 === 0 ? "bg-accent text-primary-strong" : i % 3 === 1 ? "bg-secondary text-navy-2" : "bg-muted text-sky"}`}>
                <CategoryIcon icon={c.icon} className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-navy group-hover:text-primary-strong">{c.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                <p className="mt-2 text-xs font-semibold text-sky">{c.count} layanan</p>
              </div>
              {c.hot && <span className="absolute right-4 top-4 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-primary-foreground">HOT</span>}
            </Link>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="bg-muted/60 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold uppercase tracking-wider text-primary-strong">Layanan Populer</p>
          <h2 className="mt-1 text-3xl font-extrabold text-navy md:text-4xl">Paling banyak dipesan minggu ini</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.products.map((p: any) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-primary-strong">Cara Order</p>
          <h2 className="mt-1 text-3xl font-extrabold text-navy md:text-4xl">Cara order dalam 4 langkah</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.t} className="relative rounded-2xl border bg-card p-6 shadow-card">
              <span className="absolute right-5 top-4 text-5xl font-extrabold text-navy/5">0{i + 1}</span>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-cta"><s.icon className="h-6 w-6" /></div>
              <h3 className="mt-4 font-bold text-navy">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gradient-navy py-16 text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">Testimoni</p>
          <h2 className="mt-1 text-3xl font-extrabold md:text-4xl">Apa kata mereka</h2>
          <Carousel opts={{ align: "start", loop: true }} className="mt-8">
            <CarouselContent>
              {data.testimonials.map((t) => (
                <CarouselItem key={t.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="flex h-full flex-col rounded-2xl bg-navy-foreground/5 p-6 ring-1 ring-navy-foreground/10">
                    <Quote className="h-8 w-8 text-primary" />
                    <div className="mt-3 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-primary text-primary" : "text-navy-foreground/30"}`} />
                      ))}
                    </div>
                    <p className="mt-3 flex-1 text-navy-foreground/85">“{t.content}”</p>
                    <div className="mt-5 flex items-center gap-3">
                      {t.photo_url && <img src={t.photo_url} alt={t.name} loading="lazy" className="h-10 w-10 rounded-full object-cover" />}
                      <div>
                        <p className="font-bold">{t.name}</p>
                        <p className="text-xs text-navy-foreground/60">{t.title}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-3 hidden text-navy md:flex" />
            <CarouselNext className="-right-3 hidden text-navy md:flex" />
          </Carousel>
        </div>
      </section>

      {/* BLOG */}
      {data.articles.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-extrabold text-navy">Artikel terbaru</h2>
            <Link to="/blog" className="text-sm font-bold text-primary-strong hover:underline">Lihat semua →</Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {data.articles.map((a) => (
              <Link key={a.slug} to="/blog/$slug" params={{ slug: a.slug }} className="group overflow-hidden rounded-2xl border bg-card shadow-card">
                {a.cover_image && <img src={a.cover_image} alt={a.title} loading="lazy" className="aspect-[16/9] w-full object-cover" />}
                <div className="p-5">
                  <p className="text-xs text-muted-foreground">{tanggal(a.published_at)}</p>
                  <h3 className="mt-1 font-bold text-navy group-hover:text-primary-strong">{a.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <WaCta phone={wa} />
    </>
  );
}
