import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Check, ChevronRight, FileText, Globe, LayoutTemplate, MessageCircle, MonitorSmartphone, Search, ShieldCheck, Sparkles } from "lucide-react";
import hero from "@/assets/website-service-hero.jpg";
import showcase from "@/assets/website-service-showcase.jpg";
import { Button } from "@/components/ui/button";
import { rupiah, waLink } from "@/lib/format";

type Service = { id: string; slug: string; title: string; short_description: string | null; price: number; sellers?: { name: string; slug: string } | null };

const experience = [
  { icon: LayoutTemplate, title: "Desain yang mencerminkan bisnis Anda", text: "Tampilkan identitas perusahaan, layanan, dan keunggulan bisnis dalam satu pengalaman yang konsisten." },
  { icon: FileText, title: "Informasi lengkap, navigasi sederhana", text: "Beranda, profil perusahaan, layanan, dan kontak disusun agar calon pelanggan mudah menemukan informasi." },
  { icon: MonitorSmartphone, title: "Nyaman di setiap perangkat", text: "Tampilan desktop dan ponsel yang sama-sama jelas, mudah dibaca, dan nyaman digunakan." },
];
const seo = [
  { icon: Search, title: "Kata kunci yang relevan", text: "Fokus pada layanan dan kebutuhan pencarian calon pelanggan." },
  { icon: LayoutTemplate, title: "Struktur halaman yang jelas", text: "Susunan halaman dan judul yang membantu pengunjung memahami bisnis." },
  { icon: FileText, title: "Informasi halaman lengkap", text: "Judul dan deskripsi yang menjelaskan isi setiap halaman." },
  { icon: MessageCircle, title: "Jalur kontak yang mudah", text: "Arahkan pengunjung dari informasi layanan menuju percakapan." },
];

export function WebsiteServicePage({ products, phone }: { products: Service[]; phone?: string }) {
  return <>
    <section className="relative isolate overflow-hidden bg-navy text-navy-foreground">
      <img src={hero} alt="Contoh desain website company profile" width={1536} height={1024} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-right" />
      <div className="absolute inset-0 -z-10 bg-navy/25 max-md:bg-navy/80" />
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-navy-foreground/65"><Link to="/">Beranda</Link><ChevronRight className="size-3.5" /><span>Pembuatan Website</span></nav>
        <div className="max-w-xl py-12 md:py-16">
          <p className="mb-4 text-xs font-bold uppercase text-primary">Dimaloka · Web Development</p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">Jasa Pembuatan Website</h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-navy-foreground/80">Bangun wajah digital perusahaan yang profesional. Perkenalkan bisnis, tampilkan layanan, dan hubungkan calon pelanggan dengan Anda.</p>
          <Button asChild size="lg" className="mt-7 h-12 rounded-md px-6 font-bold"><a href="#tentang-website">Jelajahi layanan <ArrowDown className="size-4" /></a></Button>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-navy-foreground/75"><span className="flex items-center gap-2"><Globe className="size-4" />Company Profile</span><span className="flex items-center gap-2"><MonitorSmartphone className="size-4" />Toko Online</span><span className="flex items-center gap-2"><LayoutTemplate className="size-4" />Landing Page</span></div>
        </div>
      </div>
    </section>

    <section id="tentang-website" className="scroll-mt-24 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase text-primary-strong">Website Company Profile</p><h2 className="mt-4 text-3xl font-extrabold leading-tight text-navy sm:text-4xl">Citra perusahaan yang kuat,<br className="hidden sm:block" /> dimulai dari website yang tepat.</h2><p className="mt-5 text-base leading-relaxed text-muted-foreground">Website adalah tempat calon pelanggan mengenal bisnis Anda. Hadirkan profil perusahaan yang meyakinkan, informasi layanan yang jelas, dan cara menghubungi Anda yang mudah.</p></div>
        <img src={showcase} alt="Contoh tampilan website perusahaan pada desktop dan ponsel" width={1536} height={1024} loading="lazy" className="mt-10 aspect-[3/2] w-full object-contain" />
        <div className="mt-9 grid gap-8 border-y py-8 md:grid-cols-3">{experience.map((f) => <div key={f.title}><f.icon className="mb-4 size-6 text-primary-strong" /><h3 className="text-lg font-bold text-navy">{f.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.text}</p></div>)}</div>
      </div>
    </section>

    <section className="bg-muted py-14 sm:py-20"><div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-xs font-bold uppercase text-primary-strong">Lebih dari sekadar tampilan</p><h2 className="mt-4 text-3xl font-extrabold leading-tight text-navy">Website yang mudah ditemukan dan dipahami.</h2><p className="mt-5 text-sm leading-relaxed text-muted-foreground">Desain, konten, dan struktur halaman bekerja bersama untuk membantu bisnis Anda hadir secara profesional.</p></div><div className="grid gap-x-8 gap-y-9 sm:grid-cols-2">{seo.map((f) => <div key={f.title}><f.icon className="size-5 text-navy-2" /><h3 className="mt-3 font-bold text-navy">{f.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p></div>)}</div></div></section>

    <section id="layanan-website" className="scroll-mt-24 py-14 sm:py-20"><div className="mx-auto max-w-6xl px-5 sm:px-8"><div className="mb-9 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-primary-strong">Pilihan Layanan</p><h2 className="mt-3 text-3xl font-extrabold text-navy">Website untuk kebutuhan bisnis Anda.</h2></div><span className="text-sm text-muted-foreground">{products.length} layanan tersedia</span></div><div className="grid gap-5 md:grid-cols-2">{products.map((p, i) => <article key={p.id} className="overflow-hidden rounded-lg border bg-card"><div className="flex items-center justify-between border-b px-6 py-4"><span className="text-xs font-bold uppercase text-muted-foreground">{p.sellers?.name ?? "Dimaloka"}</span>{i === 0 && <Sparkles className="size-4 text-primary-strong" />}</div><div className="p-6"><h3 className="text-2xl font-extrabold text-navy">{p.title}</h3><p className="mt-3 min-h-12 text-sm leading-relaxed text-muted-foreground">{p.short_description}</p><p className="mt-6 text-xs text-muted-foreground">Mulai dari</p><p className="mt-1 text-3xl font-extrabold text-primary-strong">{rupiah(p.price)}</p><Button asChild variant={i === 0 ? "default" : "outline"} className="mt-6 h-11 w-full rounded-md font-bold"><Link to="/p/$slug" params={{ slug: p.slug }}>Lihat detail layanan <ArrowRight className="size-4" /></Link></Button></div></article>)}</div>{products.length === 0 && <p className="border-y py-8 text-muted-foreground">Belum ada layanan website tersedia.</p>}</div></section>

    <section className="border-y bg-secondary py-12"><div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 md:grid-cols-3">{[{ icon: ShieldCheck, title: "Penyedia terkurasi", text: "Bandingkan layanan dari penyedia jasa di Dimaloka." }, { icon: Check, title: "Paket yang jelas", text: "Lihat harga dan rincian paket sebelum memilih." }, { icon: FileText, title: "Invoice resmi", text: "Informasi tagihan dan pembayaran tercatat dengan jelas." }].map((f) => <div key={f.title} className="flex gap-4"><f.icon className="size-6 shrink-0 text-navy-2" /><div><h3 className="font-bold text-navy">{f.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p></div></div>)}</div></section>

    <section className="bg-navy py-14 text-navy-foreground sm:py-20"><div className="mx-auto max-w-6xl px-5 sm:px-8"><p className="text-xs font-bold uppercase text-primary">Mulai dari kebutuhan Anda</p><h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">Siap membangun website untuk perusahaan Anda?</h2><p className="mt-5 max-w-xl text-navy-foreground/75">Diskusikan jenis website dan kebutuhan bisnis Anda bersama Dimaloka.</p><Button asChild size="lg" className="mt-7 h-12 rounded-md font-bold"><a href={waLink(phone, "Halo Dimaloka, saya ingin konsultasi pembuatan website untuk bisnis saya.")} target="_blank" rel="noreferrer"><MessageCircle className="size-5" /> Konsultasi via WhatsApp</a></Button></div></section>
  </>;
}