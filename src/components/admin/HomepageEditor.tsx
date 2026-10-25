import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, ImageInput, ListInput, PageHeader, uploadMedia } from "./fields";
import { useSettings } from "./useSettings";
import { supabase } from "@/integrations/supabase/client";
import { HOMEPAGE_KEY, homepageContent, type HomepageContent } from "@/lib/homepage";

async function persistImage(url: string) {
  if (!url || /^https?:\/\//.test(url)) return url;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Gambar tidak dapat disimpan.");
  const blob = await response.blob();
  return uploadMedia(new File([blob], `homepage-${crypto.randomUUID()}.${blob.type === "image/png" ? "png" : "jpg"}`, { type: blob.type }));
}

export function HomepageEditor() {
  const { data, isPending, refetch } = useSettings();
  const router = useRouter();
  const [content, setContent] = useState(() => homepageContent(null));
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (data && !dirty) setContent(homepageContent(data[HOMEPAGE_KEY])); }, [data, dirty]);
  const patch = (value: Partial<HomepageContent>) => { setDirty(true); setContent(current => ({ ...current, ...value })); };
  const text = (key: keyof HomepageContent, label: string, long = false) => <Field label={label}>{long ? <Textarea aria-label={label} value={String(content[key])} onChange={e => patch({ [key]: e.target.value })} rows={3} /> : <Input aria-label={label} value={String(content[key])} onChange={e => patch({ [key]: e.target.value })} />}</Field>;
  const save = async () => {
    if (!content.title.trim() || !content.description.trim()) return toast.error("Judul utama dan deskripsi wajib diisi.");
    if (content.hero_image && !content.hero_alt.trim()) return toast.error("Teks alternatif gambar utama wajib diisi.");
    if (content.clients.some(x => !x.name.trim())) return toast.error("Isi nama setiap klien atau hapus baris kosong.");
    setBusy(true);
    try {
      const value = { ...content, hero_image: await persistImage(content.hero_image), clients: await Promise.all(content.clients.map(async client => ({ ...client, image: await persistImage(client.image) }))) };
      const { error } = await supabase.from("site_settings").upsert({ key: HOMEPAGE_KEY, value: JSON.parse(JSON.stringify(value)), updated_at: new Date().toISOString() });
      if (error) throw error;
      await refetch(); await router.invalidate(); setContent(value); setDirty(false); toast.success("Homepage disimpan");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Homepage gagal disimpan."); } finally { setBusy(false); }
  };
  const section = "space-y-5 border-b pb-8";
  if (isPending) return <p>Memuat Homepage…</p>;
  return <>
    <div className="sticky top-0 z-10 border-b bg-background py-4"><PageHeader title="Homepage" action={<div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to="/" target="_blank">Lihat Homepage<ExternalLink className="size-4" /></Link></Button><Button onClick={save} disabled={busy || !dirty}><Save className="size-4" />{busy ? "Menyimpan…" : "Simpan Homepage"}</Button></div>} /><p className="text-xs text-muted-foreground">{dirty ? "Ada perubahan belum disimpan" : "Semua perubahan tersimpan"}</p></div>
    <Tabs defaultValue="hero" className="mt-6">
      <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-1"><TabsTrigger value="hero">Pembuka</TabsTrigger><TabsTrigger value="clients">Logo Klien</TabsTrigger><TabsTrigger value="sections">Bagian Halaman</TabsTrigger><TabsTrigger value="steps">Cara Order</TabsTrigger><TabsTrigger value="cta">Konsultasi</TabsTrigger></TabsList>
      <TabsContent value="hero" className="space-y-6"><section className={section}>{text("eyebrow", "Teks pengantar")}{text("title", "Judul utama (H1)")}{text("title_accent", "Judul aksen")}{text("description", "Deskripsi utama", true)}<Field label="Gambar utama"><ImageInput value={content.hero_image} onChange={hero_image => patch({ hero_image })} /></Field>{text("hero_alt", "Teks alternatif gambar utama")}</section><section className={section}><div className="grid gap-5 sm:grid-cols-2">{text("primary_button", "Tombol konsultasi")}{text("secondary_button", "Tombol lihat layanan")}</div>{text("wa_message", "Pesan WhatsApp pembuka", true)}<Field label="Keunggulan singkat"><ListInput value={content.highlights} onChange={highlights => patch({ highlights })} /></Field></section></TabsContent>
      <TabsContent value="clients" className="space-y-6">{text("clients_title", "Judul bagian klien")}<div className="flex items-center justify-between gap-3"><h2 className="font-bold">Logo Klien ({content.clients.length})</h2><Button variant="outline" onClick={() => patch({ clients: [...content.clients, { id: crypto.randomUUID(), name: "", image: "" }] })}><Plus className="size-4" />Tambah klien</Button></div>{content.clients.map((client, i) => <section key={client.id} className="grid gap-4 border-b py-5 sm:grid-cols-[1fr_auto]"><div className="min-w-0 space-y-4"><Field label={`Nama klien ${i + 1}`}><Input aria-label={`Nama klien ${i + 1}`} value={client.name} onChange={e => patch({ clients: content.clients.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} /></Field><Field label={`Logo klien ${i + 1}`}><ImageInput value={client.image} onChange={image => patch({ clients: content.clients.map((x, j) => j === i ? { ...x, image } : x) })} /></Field></div><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label={`Naikkan klien ${i + 1}`} disabled={i === 0} onClick={() => { const clients = [...content.clients]; [clients[i - 1], clients[i]] = [clients[i], clients[i - 1]]; patch({ clients }); }}><ArrowUp /></Button><Button size="icon" variant="ghost" aria-label={`Turunkan klien ${i + 1}`} disabled={i === content.clients.length - 1} onClick={() => { const clients = [...content.clients]; [clients[i + 1], clients[i]] = [clients[i], clients[i + 1]]; patch({ clients }); }}><ArrowDown /></Button><Button size="icon" variant="ghost" aria-label={`Hapus klien ${i + 1}`} onClick={() => patch({ clients: content.clients.filter((_, j) => j !== i) })}><Trash2 /></Button></div></section>)}</TabsContent>
      <TabsContent value="sections" className="space-y-7"><div className="grid gap-4 sm:grid-cols-2">{Object.entries({ clients: "Logo Klien", services: "Layanan", products: "Layanan Populer", steps: "Cara Order", testimonials: "Testimoni", blog: "Artikel", cta: "Konsultasi" }).map(([key, label]) => <label key={key} className="flex items-center justify-between gap-3 border-b py-3 text-sm font-semibold">{label}<Switch aria-label={`Tampilkan ${label}`} checked={content.visible[key as keyof HomepageContent["visible"]]} onCheckedChange={checked => patch({ visible: { ...content.visible, [key]: checked } })} /></label>)}</div><section className={section}>{text("services_eyebrow", "Label layanan")}{text("services_title", "Judul layanan")}</section><section className={section}>{text("products_eyebrow", "Label layanan populer")}{text("products_title", "Judul layanan populer")}</section><section className={section}>{text("testimonials_eyebrow", "Label testimoni")}{text("testimonials_title", "Judul testimoni")}</section><section className={section}>{text("blog_title", "Judul artikel")}{text("blog_button", "Tombol artikel")}</section></TabsContent>
      <TabsContent value="steps" className="space-y-6">{text("steps_eyebrow", "Label cara order")}{text("steps_title", "Judul cara order")}{content.steps.map((step, i) => <section key={i} className={section}><h2 className="font-bold">Langkah {i + 1}</h2><Field label="Judul langkah"><Input aria-label={`Judul langkah ${i + 1}`} value={step.title} onChange={e => patch({ steps: content.steps.map((x, j) => j === i ? { ...x, title: e.target.value } : x) })} /></Field><Field label="Deskripsi langkah"><Textarea aria-label={`Deskripsi langkah ${i + 1}`} value={step.text} onChange={e => patch({ steps: content.steps.map((x, j) => j === i ? { ...x, text: e.target.value } : x) })} /></Field></section>)}</TabsContent>
      <TabsContent value="cta" className="space-y-5">{text("cta_title", "Judul konsultasi")}{text("cta_text", "Deskripsi konsultasi", true)}{text("cta_button", "Teks tombol konsultasi")}{text("cta_message", "Pesan WhatsApp penutup", true)}</TabsContent>
    </Tabs>
  </>;
}