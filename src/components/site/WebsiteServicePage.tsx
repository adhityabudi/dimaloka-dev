import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronRight, FileText, LayoutTemplate, MessageCircle, MonitorSmartphone, Search } from "lucide-react";
import hero from "@/assets/website-service-hero.jpg";
import showcase from "@/assets/website-service-showcase.jpg";
import { Button } from "@/components/ui/button";
import { rupiah, waLink } from "@/lib/format";

type Service = { id: string; slug: string; title: string; short_description: string | null; price: number; sellers?: { name: string; slug: string } | null };

const capabilities = [
  { icon: LayoutTemplate, title: "Identitas yang konsisten", text: "Karakter bisnis diterjemahkan menjadi desain, konten, dan pengalaman yang selaras." },
  { icon: MonitorSmartphone, title: "Pengalaman lintas perangkat", text: "Informasi yang mudah dibaca dan navigasi yang nyaman, dari desktop hingga ponsel." },
  { icon: Search, title: "Struktur yang terarah", text: "Susunan halaman dan informasi layanan yang membantu calon pelanggan memahami bisnis." },
  { icon: FileText, title: "Komunikasi yang jelas", text: "Profil perusahaan, penawaran, dan jalur kontak hadir dalam satu kesatuan." },
];

export function WebsiteServicePage({ products, phone }: { products: Service[]; phone?: string }) {
  const contact = waLink(phone, "Halo Dimaloka, saya ingin mendiskusikan pembuatan website untuk bisnis saya.");
  return <>
    <section className="relative isolate overflow-hidden bg-navy text-navy-foreground">
      <img src={hero} alt="Konsep website perusahaan dengan desain arsitektur modern" width={1536} height={1024} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-right" />
      <div className="absolute inset-0 -z-10 bg-navy/15 max-md:bg-navy/85" />
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-7 sm:px-10 lg:px-16">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-navy-foreground/60"><Link to="/" className="hover:text-primary">Beranda</Link><ChevronRight className="size-3" /><span>Pembuatan Website</span></nav>
        <div className="max-w-[510px] pb-12 pt-14 sm:pb-16 sm:pt-20">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase"><span className="h-px w-8 bg-primary" />Dimaloka / Digital Presence</p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.12] sm:text-5xl lg:text-6xl">Jasa Pembuatan<br />Website<span className="text-primary">.</span></h1>
          <p className="mt-6 max-w-sm text-sm leading-7 text-navy-foreground/75">Wajah digital yang merepresentasikan bisnis Anda. Dirancang dengan karakter, disusun dengan tujuan.</p>
          <div className="mt-8 flex flex-wrap items-center gap-5"><Button asChild className="h-11 rounded px-5 text-sm font-semibold"><a href={contact} target="_blank" rel="noreferrer">Diskusikan kebutuhan <ArrowUpRight className="size-4" /></a></Button><Button asChild variant="link" className="h-11 px-0 text-navy-foreground"><a href="#layanan-website">Pilihan layanan <ArrowDown className="size-4" /></a></Button></div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-navy-foreground/20 pt-5 text-[11px] text-navy-foreground/60"><span>COMPANY PROFILE / E-COMMERCE</span><span className="flex items-center gap-2">Desain. Informasi. Koneksi.<ArrowDown className="size-3" /></span></div>
      </div>
    </section>

    <section className="border-b py-14 sm:py-20"><div className="mx-auto grid max-w-7xl gap-8 px-6 sm:px-10 lg:grid-cols-[1fr_2fr] lg:px-16"><div className="flex items-start gap-3 text-xs font-semibold uppercase text-muted-foreground"><span className="text-primary-strong">01</span>Tentang Layanan</div><div><h2 className="max-w-3xl text-3xl font-medium leading-tight text-navy sm:text-4xl">Bukan sekadar hadir online.<br /><span className="text-muted-foreground">Hadir dengan identitas.</span></h2><p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">Website yang tepat membantu orang mengenal siapa Anda, memahami apa yang Anda tawarkan, dan memulai percakapan. Dimaloka mempertemukan kebutuhan bisnis Anda dengan layanan pembuatan website yang sesuai.</p></div></div></section>

    <section className="py-14 sm:py-20"><div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16"><div className="grid items-start gap-10 lg:grid-cols-[1.35fr_1fr]"><figure><img src={showcase} alt="Contoh rancangan website perusahaan pada desktop dan ponsel" width={1536} height={1024} loading="lazy" className="aspect-[3/2] w-full object-contain" /><figcaption className="mt-3 flex justify-between gap-3 text-[10px] uppercase text-muted-foreground"><span>Studi visual / Company Profile</span><span>Konsep desain</span></figcaption></figure><div className="lg:pl-6"><p className="text-xs font-semibold uppercase text-primary-strong">Dirancang untuk bisnis</p><h2 className="mt-4 text-3xl font-medium leading-tight text-navy">Detail yang membentuk<br />kesan pertama.</h2><div className="mt-7 divide-y">{capabilities.map((f, i) => <div key={f.title} className="flex gap-4 py-5"><span className="pt-1 text-[10px] text-muted-foreground">0{i + 1}</span><div className="flex-1"><h3 className="flex items-center justify-between gap-3 text-sm font-semibold text-navy">{f.title}<f.icon className="size-4 shrink-0 text-muted-foreground" /></h3><p className="mt-2 text-xs leading-6 text-muted-foreground">{f.text}</p></div></div>)}</div></div></div></div></section>

    <section id="layanan-website" className="scroll-mt-20 border-y bg-muted py-14 sm:py-20"><div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16"><div className="grid gap-6 pb-10 lg:grid-cols-[1fr_2fr]"><p className="flex gap-3 text-xs font-semibold uppercase text-muted-foreground"><span className="text-primary-strong">02</span>Pilihan Layanan</p><div><h2 className="text-3xl font-medium text-navy sm:text-4xl">Pilih fondasi digital Anda.</h2><p className="mt-4 text-sm text-muted-foreground">Kebutuhan berbeda. Solusi yang tepat.</p></div></div><div className="border-t">{products.map((p, i) => <article key={p.id} className="grid gap-6 border-b py-8 md:grid-cols-[40px_1fr_220px] lg:gap-10"><span className="text-sm text-muted-foreground">0{i + 1}</span><div><p className="text-[10px] font-semibold uppercase text-primary-strong">{p.sellers?.name ?? "Dimaloka"}</p><h3 className="mt-2 text-2xl font-semibold leading-tight text-navy">{p.title}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{p.short_description}</p></div><div className="flex items-center justify-between gap-4 md:block"><div><p className="text-[10px] uppercase text-muted-foreground">Mulai dari</p><p className="mt-1 text-xl font-semibold text-navy">{rupiah(p.price)}</p></div><Button asChild variant="outline" className="rounded border-navy/20 bg-transparent md:mt-5 md:w-full"><Link to="/p/$slug" params={{ slug: p.slug }}>Detail layanan <ArrowUpRight className="size-4" /></Link></Button></div></article>)}</div>{products.length === 0 && <p className="py-8 text-muted-foreground">Belum ada layanan tersedia.</p>}</div></section>

    <section className="py-14 sm:py-20"><div className="mx-auto grid max-w-7xl gap-8 px-6 sm:px-10 lg:grid-cols-[1fr_2fr] lg:px-16"><p className="flex gap-3 text-xs font-semibold uppercase text-muted-foreground"><span className="text-primary-strong">03</span>Langkah Berikutnya</p><div><h2 className="max-w-xl text-3xl font-medium leading-tight text-navy sm:text-4xl">Website Anda berikutnya,<br />dimulai dari percakapan.</h2><div className="mt-7 flex flex-wrap items-center justify-between gap-6 border-t pt-7"><p className="max-w-sm text-sm leading-6 text-muted-foreground">Ceritakan bisnis dan kebutuhan Anda. Temukan layanan yang sesuai bersama Dimaloka.</p><Button asChild className="h-12 rounded px-5 font-semibold"><a href={contact} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> Mari berdiskusi <ArrowRight className="size-4" /></a></Button></div></div></div></section>
  </>;
}
