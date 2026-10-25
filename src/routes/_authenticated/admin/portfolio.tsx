import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Save, Trash2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Field, GalleryInput, ImageInput, PageHeader, SeoFields, TagInput, uploadMedia } from "@/components/admin/fields";
import { useSettings } from "@/components/admin/useSettings";
import { defaultPortfolio, validProjectUrl, type PortfolioPage, type PortfolioProject } from "@/lib/portfolio";
import { MASTER_KEY, SERVICE_NAMES, SERVICE_SLUGS, masterPage, portfolioKey, servicePortfolio, type PortfolioMaster, type ServiceSlug } from "@/lib/services";
import { pageMeta } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/portfolio")({
  head: () => ({ meta: [...pageMeta({ title: "Kelola Portfolio | Dimaloka", description: "Kelola gambar, proyek, konten halaman Portfolio, dan pengantar portfolio layanan Website Dimaloka." }), { name: "robots", content: "noindex" }] }),
  component: AdminPortfolio,
});
function AdminPortfolio() {
  const [service, setService] = useState<ServiceSlug | "master">("master");
  return <div className="max-w-5xl">
    <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Pilih portfolio">{(["master", ...SERVICE_SLUGS] as const).map(s => <Button key={s} size="sm" variant={service === s ? "default" : "outline"} aria-pressed={service === s} onClick={() => setService(s)}>{s === "master" ? "Master Portfolio" : SERVICE_NAMES[s]}</Button>)}</div>
    {service === "master" ? <MasterEditor /> : <ServicePortfolioEditor key={service} service={service} />}
  </div>;
}

function MasterEditor() {
  const { data, isPending, save } = useSettings();
  const router = useRouter();
  const [m, setM] = useState<PortfolioMaster>(masterPage(null));
  useEffect(() => { if (data) setM(masterPage(data[MASTER_KEY])); }, [data]);
  const patch = (v: Partial<PortfolioMaster>) => setM(p => ({ ...p, ...v }));
  if (isPending) return <p className="text-muted-foreground">Memuat…</p>;
  const submit = async () => {
    if (!m.seo_title.trim() || !m.seo_description.trim() || !m.keywords.some(k => k.trim())) return toast.error("Lengkapi SEO title, description, dan keywords.");
    await save({ [MASTER_KEY]: m }); await router.invalidate();
  };
  return <><PageHeader title="Master Portfolio" desc="Halaman induk berisi card setiap layanan. Gambar dan teks card diatur di masing-masing layanan." action={<div className="flex gap-2"><Button asChild variant="outline"><Link to="/portfolio/$service" params={{ service }} target="_blank">Lihat halaman<ExternalLink className="size-4" /></Link></Button><Button onClick={submit}><Save className="size-4" />Simpan</Button></div>} />
    <div className="space-y-4">{([["eyebrow", "Teks pengantar"], ["title", "Judul halaman"], ["description", "Deskripsi halaman"], ["cta_title", "Judul konsultasi"], ["cta_description", "Deskripsi konsultasi"], ["cta_button", "Teks tombol konsultasi"]] as const).map(([k, l]) => <Field key={k} label={l}>{k.includes("description") ? <Textarea aria-label={l} value={m[k]} onChange={e => patch({ [k]: e.target.value })} /> : <Input aria-label={l} value={m[k]} onChange={e => patch({ [k]: e.target.value })} />}</Field>)}
      <SeoFields v={m} set={patch} slugPath="/portfolio" /></div></>;
}

function ServicePortfolioEditor({ service }: { service: ServiceSlug }) {
  const { data, isPending, error } = useSettings();
  const router = useRouter();
  const [page, setPage] = useState<PortfolioPage>(() => servicePortfolio(service, null));
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data) setPage(servicePortfolio(service, data[portfolioKey(service)])); }, [data, service]);
  const patch = (v: Partial<PortfolioPage>) => setPage(p => ({ ...p, ...v }));
  const editProject = (id: string, v: Partial<PortfolioProject>) => setPage(p => ({ ...p, projects: p.projects.map(project => project.id === id ? { ...project, ...v } : project) }));
  const move = (index: number, delta: number) => {
    const projects = [...page.projects];
    const item = projects[index];
    if (!item || index + delta < 0 || index + delta >= projects.length) return;
    projects.splice(index, 1); projects.splice(index + delta, 0, item); patch({ projects });
  };
  const save = async () => {
    if (!page.seo_title.trim() || !page.seo_description.trim() || !page.keywords.some(k => k.trim())) return toast.error("Lengkapi SEO title, description, dan keywords.");
    if (page.projects.some(p => p.published && (!p.title.trim() || !p.image || !p.image_alt.trim()))) return toast.error("Lengkapi judul, gambar, dan teks alternatif setiap portfolio yang ditampilkan.");
    if (page.projects.some(p => p.url && !validProjectUrl(p.url))) return toast.error("Alamat website harus diawali https:// atau http://.");
    setBusy(true);
    try {
      // Persist bundled dummy images to private media before storing their URLs.
      const persist = async (url: string) => {
        if (!url || /^https?:\/\//.test(url)) return url;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Gambar contoh tidak dapat disimpan.");
        const blob = await response.blob();
        return uploadMedia(new File([blob], `portfolio-${crypto.randomUUID()}.jpg`, { type: blob.type }));
      };
      const projects = await Promise.all(page.projects.map(async p => ({ ...p, image: await persist(p.image), gallery: await Promise.all(p.gallery.map(persist)) })));
      const value = { ...page, projects, cover_image: await persist(page.cover_image), card_image: await persist(page.card_image) };
      const { error } = await supabase.from("site_settings").upsert({ key: portfolioKey(service), value: JSON.parse(JSON.stringify(value)), updated_at: new Date().toISOString() });
      if (error) throw error;
      setPage(value);
      await router.invalidate();
      toast.success("Portfolio disimpan");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Portfolio gagal disimpan."); } finally { setBusy(false); }
  };
  if (isPending) return <p className="text-muted-foreground">Memuat portfolio…</p>;
  if (error) return <p className="text-destructive">Pengaturan portfolio belum dapat dimuat.</p>;
  return <div><PageHeader title={`Portfolio ${SERVICE_NAMES[service]}`} desc="Konten halaman portfolio layanan, card di Master Portfolio, dan cuplikan di halaman layanan." action={<div className="flex gap-2"><Button asChild variant="outline"><Link to="/portfolio" target="_blank">Lihat halaman<ExternalLink className="size-4" /></Link></Button><Button onClick={save} disabled={busy}><Save className="size-4" />{busy ? "Menyimpan…" : "Simpan portfolio"}</Button></div>} />
    <Tabs defaultValue="projects"><TabsList className="mb-6"><TabsTrigger value="projects">Proyek</TabsTrigger><TabsTrigger value="page">Halaman & SEO</TabsTrigger><TabsTrigger value="card">Card Master</TabsTrigger><TabsTrigger value="website">Bagian di Halaman Layanan</TabsTrigger></TabsList>
      <TabsContent value="projects"><div className="mb-6 flex items-center justify-between gap-4"><p className="text-sm text-muted-foreground">{page.projects.length} portfolio</p><Button variant="outline" onClick={() => patch({ projects: [...page.projects, { id: crypto.randomUUID(), title: "", category: page.categories[0] || "Company Profile", description: "", image: "", image_alt: "", gallery: [], url: "", is_demo: false, featured: false, published: false }] })}><Plus className="size-4" />Tambah portfolio</Button></div><div className="space-y-6">{page.projects.map((p, i) => <article key={p.id} className="rounded-lg border bg-card p-5 sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="font-bold text-navy">{i + 1}. {p.title || "Portfolio baru"}</h2><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label={`Naikkan ${p.title}`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-4" /></Button><Button variant="ghost" size="icon" aria-label={`Turunkan ${p.title}`} disabled={i === page.projects.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-4" /></Button><Button variant="ghost" size="icon" aria-label={`Hapus ${p.title}`} onClick={() => { if (window.confirm(`Hapus portfolio ${p.title || "ini"}?`)) patch({ projects: page.projects.filter(x => x.id !== p.id) }); }}><Trash2 className="size-4 text-destructive" /></Button></div></div><div className="grid gap-6 md:grid-cols-2"><div className="space-y-4"><Field label="Nama proyek"><Input aria-label={`Nama proyek ${i + 1}`} value={p.title} onChange={e => editProject(p.id, { title: e.target.value })} /></Field><Field label="Kategori"><select aria-label={`Kategori proyek ${i + 1}`} className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={p.category} onChange={e => editProject(p.id, { category: e.target.value })}>{Array.from(new Set([...page.categories, p.category])).map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Deskripsi"><Textarea value={p.description} onChange={e => editProject(p.id, { description: e.target.value })} /></Field><Field label="Alamat website (opsional)"><Input placeholder="https://" value={p.url} onChange={e => editProject(p.id, { url: e.target.value })} /></Field></div><div className="space-y-4"><Field label="Gambar utama"><ImageInput value={p.image} onChange={image => editProject(p.id, { image })} /></Field><Field label="Teks alternatif gambar"><Input value={p.image_alt} onChange={e => editProject(p.id, { image_alt: e.target.value })} /></Field><Field label="Galeri tambahan"><GalleryInput value={p.gallery} onChange={gallery => editProject(p.id, { gallery })} /></Field><div className="flex flex-wrap gap-4 text-sm">{([{ key: "published", label: "Tampilkan" }, { key: "featured", label: "Unggulan di Website" }, { key: "is_demo", label: "Konsep desain" }] as const).map(f => <label key={f.key} className="flex items-center gap-2"><Checkbox checked={p[f.key]} onCheckedChange={checked => editProject(p.id, { [f.key]: checked === true })} />{f.label}</label>)}</div></div></div></article>)}</div></TabsContent>
      <TabsContent value="page"><div className="space-y-8"><section className="space-y-4"><h2 className="text-lg font-bold text-navy">Pembuka halaman</h2>{([{ key: "eyebrow", label: "Teks pengantar" }, { key: "title", label: "Judul halaman" }, { key: "description", label: "Deskripsi halaman" }] as const).map(f => <Field key={f.key} label={f.label}>{f.key === "description" ? <Textarea aria-label={f.label} value={page[f.key]} onChange={e => patch({ [f.key]: e.target.value })} /> : <Input aria-label={f.label} value={page[f.key]} onChange={e => patch({ [f.key]: e.target.value })} />}</Field>)}<Field label="Gambar latar pembuka (opsional)"><ImageInput value={page.cover_image} onChange={cover_image => patch({ cover_image })} /></Field><Field label="Kategori filter"><TagInput value={page.categories} onChange={categories => patch({ categories })} /></Field></section><section className="space-y-4"><h2 className="text-lg font-bold text-navy">Ajakan konsultasi</h2>{([{ key: "cta_title", label: "Judul konsultasi" }, { key: "cta_description", label: "Deskripsi konsultasi" }, { key: "cta_button", label: "Teks tombol konsultasi" }] as const).map(f => <Field key={f.key} label={f.label}><Input value={page[f.key]} onChange={e => patch({ [f.key]: e.target.value })} /></Field>)}</section><SeoFields v={page} set={patch} slugPath={`/portfolio/${service}`} /></div></TabsContent>
      <TabsContent value="card"><section className="space-y-4"><h2 className="text-lg font-bold text-navy">Card di Master Portfolio</h2><Field label="Judul card"><Input aria-label="Judul card" value={page.card_title} onChange={e => patch({ card_title: e.target.value })} /></Field><Field label="Deskripsi card"><Textarea aria-label="Deskripsi card" value={page.card_description} onChange={e => patch({ card_description: e.target.value })} /></Field><Field label="Gambar card"><ImageInput value={page.card_image} onChange={card_image => patch({ card_image })} /></Field></section></TabsContent>
      <TabsContent value="website"><section className="space-y-4"><h2 className="text-lg font-bold text-navy">{`Pengantar portfolio di halaman ${SERVICE_NAMES[service]}`}</h2>{([{ key: "section_title", label: "Judul bagian" }, { key: "section_description", label: "Deskripsi bagian" }, { key: "section_button", label: "Teks tombol" }] as const).map(f => <Field key={f.key} label={f.label}><Input aria-label={f.label} value={page[f.key]} onChange={e => patch({ [f.key]: e.target.value })} /></Field>)}</section></TabsContent>
    </Tabs>
  </div>;
}