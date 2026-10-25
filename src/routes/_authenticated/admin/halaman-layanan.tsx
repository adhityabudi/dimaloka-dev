import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, ImageInput, ListInput, PageHeader, TagInput, uploadMedia } from "@/components/admin/fields";
import { useSettings } from "@/components/admin/useSettings";
import { LANDING_SLUGS, SERVICE_NAMES, serviceContent, serviceKey, type ServiceContent } from "@/lib/services";
import { pageMeta } from "@/lib/site";
import { HomepageEditor } from "@/components/admin/HomepageEditor";

export const Route = createFileRoute("/_authenticated/admin/halaman-layanan")({
  head: () => ({ meta: [...pageMeta({ title: "Kelola Halaman Layanan | Dimaloka", description: "Ubah teks dan gambar halaman Desain Grafis, Digital Marketing, SEO, Aplikasi Mobile, serta Video & Animasi." }), { name: "robots", content: "noindex" }] }),
  component: AdminServices,
});

type Slug = (typeof LANDING_SLUGS)[number];

// Bundled dummy images are relative URLs; copy them into media storage before saving.
async function persist(url: string) {
  if (!url || /^https?:\/\//.test(url)) return url;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gambar contoh tidak dapat disimpan.");
  const blob = await res.blob();
  return uploadMedia(new File([blob], `layanan-${crypto.randomUUID()}.jpg`, { type: blob.type }));
}

function AdminServices() {
  const [slug, setSlug] = useState<Slug | "homepage">("homepage");
  return <div className="max-w-5xl">
    <div className="mb-6 flex flex-wrap gap-2"><Button size="sm" variant={slug === "homepage" ? "default" : "outline"} aria-pressed={slug === "homepage"} onClick={() => setSlug("homepage")}>Homepage</Button>{LANDING_SLUGS.map(s => <Button key={s} size="sm" variant={slug === s ? "default" : "outline"} aria-pressed={slug === s} onClick={() => setSlug(s)}>{SERVICE_NAMES[s]}</Button>)}</div>
    {slug === "homepage" ? <HomepageEditor /> : <Editor key={slug} slug={slug} />}
  </div>;
}

function Editor({ slug }: { slug: Slug }) {
  const { data, isPending, refetch } = useSettings();
  const router = useRouter();
  const [c, setC] = useState<ServiceContent>(() => serviceContent(slug, null));
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data) setC(serviceContent(slug, data[serviceKey(slug)])); }, [data, slug]);
  const patch = (v: Partial<ServiceContent>) => setC(p => ({ ...p, ...v }));
  const text = (k: keyof ServiceContent, label: string, long = false) => <Field key={k} label={label}>{long
    ? <Textarea aria-label={label} value={c[k] as string} onChange={e => patch({ [k]: e.target.value })} />
    : <Input aria-label={label} value={c[k] as string} onChange={e => patch({ [k]: e.target.value })} />}</Field>;
  const setAt = <K extends "features" | "basics" | "faq">(k: K, i: number, v: Partial<ServiceContent[K][number]>) => patch({ [k]: c[k].map((x, j) => j === i ? { ...x, ...v } : x) } as Partial<ServiceContent>);

  const save = async () => {
    if (!c.title.trim() || !c.description.trim()) return toast.error("Judul dan deskripsi pembuka wajib diisi.");
    if (c.hero_image && !c.hero_alt.trim()) return toast.error("Isi teks alternatif gambar pembuka.");
    setBusy(true);
    try {
      const value: ServiceContent = { ...c, hero_image: await persist(c.hero_image), features: await Promise.all(c.features.map(async f => ({ ...f, image: await persist(f.image) }))) };
      const { error } = await supabase.from("site_settings").upsert({ key: serviceKey(slug), value: JSON.parse(JSON.stringify(value)), updated_at: new Date().toISOString() });
      if (error) throw error;
      setC(value); await refetch(); await router.invalidate();
      toast.success("Halaman layanan disimpan");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Gagal menyimpan."); } finally { setBusy(false); }
  };

  if (isPending) return <p className="text-muted-foreground">Memuat…</p>;
  const box = "space-y-4 rounded-lg border bg-card p-5 sm:p-6";
  return <>
    <PageHeader title={`Halaman ${SERVICE_NAMES[slug]}`} desc="SEO halaman ini mengikuti pengaturan pada menu Layanan. Paket layanan diambil dari menu Produk, dan portfolio dari menu Portfolio." action={<div className="flex gap-2"><Button asChild variant="outline"><Link to="/layanan/$slug" params={{ slug }} target="_blank">Lihat halaman<ExternalLink className="size-4" /></Link></Button><Button onClick={save} disabled={busy}><Save className="size-4" />{busy ? "Menyimpan…" : "Simpan"}</Button></div>} />
    <div className="space-y-6">
      <section className={box}><h2 className="text-lg font-bold text-navy">Pembuka</h2>{text("eyebrow", "Teks pengantar")}{text("title", "Judul utama (H1)")}{text("description", "Deskripsi", true)}<Field label="Gambar pembuka"><ImageInput value={c.hero_image} onChange={hero_image => patch({ hero_image })} /></Field>{text("hero_alt", "Teks alternatif gambar")}<Field label="Label kecil"><TagInput value={c.tags} onChange={tags => patch({ tags })} /></Field></section>
      <section className={box}><h2 className="text-lg font-bold text-navy">Pengantar</h2>{text("intro_eyebrow", "Label")}{text("intro_title", "Judul")}{text("intro_text", "Isi", true)}</section>
      {c.features.map((f, i) => <section key={i} className={box}><h2 className="text-lg font-bold text-navy">Keunggulan {i + 1}</h2>
        <Field label="Label"><Input value={f.eyebrow} onChange={e => setAt("features", i, { eyebrow: e.target.value })} /></Field>
        <Field label="Judul"><Input value={f.title} onChange={e => setAt("features", i, { title: e.target.value })} /></Field>
        <Field label="Isi"><Textarea value={f.text} onChange={e => setAt("features", i, { text: e.target.value })} /></Field>
        <Field label="Gambar"><ImageInput value={f.image} onChange={image => setAt("features", i, { image })} /></Field>
        <Field label="Teks alternatif gambar"><Input value={f.image_alt} onChange={e => setAt("features", i, { image_alt: e.target.value })} /></Field>
        <Field label="Poin (satu per baris)"><ListInput value={f.points} onChange={points => setAt("features", i, { points })} /></Field>
      </section>)}
      <section className={box}><h2 className="text-lg font-bold text-navy">Langkah / dasar kerja</h2>{text("basics_eyebrow", "Label")}{text("basics_title", "Judul")}{text("basics_text", "Deskripsi", true)}
        {c.basics.map((b, i) => <div key={i} className="grid gap-3 border-t pt-4 md:grid-cols-[1fr_2fr]"><Input aria-label={`Judul langkah ${i + 1}`} value={b.title} onChange={e => setAt("basics", i, { title: e.target.value })} /><Textarea aria-label={`Isi langkah ${i + 1}`} value={b.text} onChange={e => setAt("basics", i, { text: e.target.value })} /></div>)}</section>
      <section className={box}><h2 className="text-lg font-bold text-navy">Daftar layanan</h2>{text("services_eyebrow", "Label")}{text("services_title", "Judul")}</section>
      <section className={box}><h2 className="text-lg font-bold text-navy">Pertanyaan (FAQ)</h2>{text("faq_title", "Judul")}
        {c.faq.map((f, i) => <div key={i} className="space-y-2 border-t pt-4"><Input aria-label={`Pertanyaan ${i + 1}`} value={f.q} onChange={e => setAt("faq", i, { q: e.target.value })} /><Textarea aria-label={`Jawaban ${i + 1}`} value={f.a} onChange={e => setAt("faq", i, { a: e.target.value })} /></div>)}</section>
      <section className={box}><h2 className="text-lg font-bold text-navy">Ajakan konsultasi</h2>{text("cta_eyebrow", "Label")}{text("cta_title", "Judul")}{text("cta_text", "Isi", true)}{text("cta_button", "Teks tombol")}{text("wa_message", "Pesan WhatsApp otomatis", true)}</section>
    </div>
  </>;
}
