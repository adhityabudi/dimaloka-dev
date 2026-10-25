import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, ExternalLink, Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "./fields";
import { generateAiSeo, getAiSeoConfig, listAiSeoModels, saveAiSeoConfig } from "@/lib/ai-seo.functions";
import type { AiSeoResult } from "@/lib/ai-seo";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { stripHtml } from "@/lib/format";
import { seoApplication } from "@/lib/ai-seo-application";
import { SeoRecommendationEditor } from "./SeoRecommendationEditor";

export function AiSeoAssistant() {
  const qc = useQueryClient();
  const router = useRouter();
  const [target, setTarget] = useState("manual");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState<{ url: string; title: string; description: string; includeContent: boolean } | null>(null);
  const sources = useQuery({ queryKey: ["ai-seo-sources"], queryFn: async () => {
    const [articles, products, services] = await Promise.all([
      supabase.from("articles").select("id,slug,status,title,content,focus_keyword,keywords"),
      supabase.from("products").select("id,slug,status,title,description,keywords"),
      supabase.from("categories").select("id,slug,name,description,keywords"),
    ]);
    if (articles.error || products.error || services.error) throw new Error("Konten SEO tidak dapat dimuat");
    return [
      ...(articles.data ?? []).map((r) => ({ key: `article:${r.id}`, id: r.id, url: `/blog/${r.slug}`, published: r.status === "published", kind: "article" as const, title: r.title, label: `Artikel — ${r.title}`, content: stripHtml(r.content), keywords: [r.focus_keyword, ...(r.keywords ?? [])].filter(Boolean).join(", ") })),
      ...(products.data ?? []).map((r) => ({ key: `product:${r.id}`, id: r.id, url: `/p/${r.slug}`, published: r.status === "published", kind: "product" as const, title: r.title, label: `Produk — ${r.title}`, content: stripHtml(r.description), keywords: (r.keywords ?? []).join(", ") })),
      ...(services.data ?? []).map((r) => ({ key: `category:${r.id}`, id: r.id, url: `/layanan/${r.slug}`, published: true, kind: "category" as const, title: r.name, label: `Layanan — ${r.name}`, content: stripHtml(r.description), keywords: (r.keywords ?? []).join(", ") })),
    ];
  }, retry: false });
  const getConfig = useServerFn(getAiSeoConfig), getModels = useServerFn(listAiSeoModels), saveConfig = useServerFn(saveAiSeoConfig), generate = useServerFn(generateAiSeo);
  const config = useQuery({ queryKey: ["ai-seo-config"], queryFn: () => getConfig(), retry: false });
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState<string | null>(null), [enabled, setEnabled] = useState<boolean | null>(null);
  const [settingsBusy, setSettingsBusy] = useState(false), [busy, setBusy] = useState(false);
  const [input, setInput] = useState({ title: "", keywords: "", content: "" });
  const [output, setOutput] = useState<{ result: AiSeoResult; model: string } | null>(null);
  const [error, setError] = useState("");
  const selected = model ?? config.data?.settings.model ?? "";
  const active = enabled ?? config.data?.settings.enabled ?? false;
  const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); toast.success("Rekomendasi disalin"); } catch { toast.error("Tidak dapat menyalin rekomendasi"); } };

  return <section className="space-y-6 border-t pt-6">
    <div><h2 className="flex items-center gap-2 text-xl font-extrabold text-navy"><Sparkles className="h-5 w-5 text-primary" /> Asisten AI SEO</h2><p className="mt-1 text-sm text-muted-foreground">DollarDesa</p></div>
    <div className="space-y-4">
      <h3 className="font-bold text-navy">Pengaturan AI Gateway</h3>
      {config.isPending ? <Loader2 className="animate-spin" /> : config.error ? <p role="alert" className="text-sm text-destructive">{config.error.message}</p> : <>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Alamat gateway"><Input readOnly value={config.data?.baseUrl ?? ""} /></Field>
          <Field label="Kunci API"><p className={`py-2 text-sm font-semibold ${config.data?.configured ? "text-success" : "text-destructive"}`}>{config.data?.configured ? "Tersimpan aman" : "Belum diatur"}</p><p className="text-xs text-muted-foreground">Perubahan kunci: Pengaturan proyek → Secrets → DOLLARDESA_API_KEY.</p></Field>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1"><Field label="Model"><Select value={selected} onValueChange={setModel}><SelectTrigger aria-label="Model AI SEO"><SelectValue placeholder="Pilih model" /></SelectTrigger><SelectContent>{Array.from(new Set([selected, ...models])).filter(Boolean).map((id) => <SelectItem key={id} value={id}>{id}</SelectItem>)}</SelectContent></Select></Field></div>
          <Button variant="outline" disabled={settingsBusy || !config.data?.configured} onClick={async () => { setSettingsBusy(true); try { const list = await getModels(); setModels(list); toast.success(`${list.length} model tersedia`); } catch (e) { toast.error(e instanceof Error ? e.message : "Model tidak dapat dimuat"); } finally { setSettingsBusy(false); } }}><RefreshCw className={settingsBusy ? "animate-spin" : ""} /> Muat model</Button>
          <Button disabled={settingsBusy || !selected} onClick={async () => { setSettingsBusy(true); try { await saveConfig({ data: { model: selected, enabled: active } }); await qc.invalidateQueries({ queryKey: ["ai-seo-config"] }); toast.success("Pengaturan AI disimpan"); } catch (e) { toast.error(e instanceof Error ? e.message : "Pengaturan gagal disimpan"); } finally { setSettingsBusy(false); } }}><Save /> Simpan pengaturan AI</Button>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold"><Switch checked={active} onCheckedChange={setEnabled} aria-label="Aktifkan AI SEO" /> Aktifkan AI SEO</label>
      </>}
    </div>
    <form className="space-y-4 border-t pt-5" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setError(""); setOutput(null); try { setOutput(await generate({ data: input })); } catch (e) { setError(e instanceof Error ? e.message : "Rekomendasi gagal dibuat"); } finally { setBusy(false); } }}>
      <Field label="Konten yang dioptimasi"><Select value={target} disabled={busy || applying} onValueChange={(key) => {
        setTarget(key); setOutput(null); setError(""); setApplied(null);
        const source = sources.data?.find((s) => s.key === key);
        setInput(source ? { title: source.title, content: source.content, keywords: source.keywords } : { title: "", content: "", keywords: "" });
      }}><SelectTrigger aria-label="Konten yang dioptimasi"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="manual">Konten manual (salin hasil)</SelectItem>{sources.data?.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent></Select></Field>
      {sources.error && <p role="alert" className="text-sm text-destructive">{sources.error.message}</p>}
      <fieldset disabled={busy || applying} className="space-y-4" onChange={() => setOutput(null)}>
      <div className="grid gap-4 md:grid-cols-2"><Field label="Judul halaman"><Input aria-label="Judul halaman AI" maxLength={200} value={input.title} onChange={(e) => setInput({ ...input, title: e.target.value })} /></Field><Field label="Kata kunci target"><Input required aria-label="Kata kunci target" maxLength={500} placeholder="jasa website company profile, website bisnis" value={input.keywords} onChange={(e) => setInput({ ...input, keywords: e.target.value })} /></Field></div>
      <Field label="Konten halaman" hint={`${input.content.length.toLocaleString("id-ID")} / 24.000 karakter`}><Textarea aria-label="Konten halaman AI" required minLength={30} maxLength={24000} rows={9} value={input.content} onChange={(e) => setInput({ ...input, content: e.target.value })} /></Field>
      </fieldset>
      <p className="text-xs text-muted-foreground">Konten dan kata kunci dikirim ke DollarDesa. Biaya mengikuti akun DollarDesa Anda. Rekomendasi tidak disimpan otomatis.</p>
      <Button type="submit" disabled={busy || applying || settingsBusy || !config.data?.configured || !config.data.settings.enabled}>{busy ? <Loader2 className="animate-spin" /> : <Sparkles />}{busy ? "Menemukan peluang…" : "Temukan Peluang SEO"}</Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
    {output && <div className="space-y-6 border-t pt-5" aria-label="Hasil rekomendasi SEO">
      <div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold text-navy">Rekomendasi SEO</h3><span className="text-xs text-muted-foreground">{output.model}</span></div>
      <div className="grid gap-6 md:grid-cols-2">{([{ label: "Judul SEO", values: output.result.titles }, { label: "Deskripsi meta", values: output.result.descriptions }]).map((group) => <div key={group.label} className="space-y-3"><h4 className="font-semibold text-navy">{group.label}</h4>{group.values.map((text, i) => <div key={i} className="rounded-lg border bg-card p-4"><p className="break-words text-sm">{text}</p><div className="mt-3 flex items-center justify-between"><span className="text-xs text-muted-foreground">{text.length} karakter</span><Button size="icon" variant="ghost" aria-label={`Salin ${group.label} ${i + 1}`} title="Salin rekomendasi" onClick={() => copy(text)}><Copy /></Button></div></div>)}</div>)}</div>
      <div><h4 className="mb-3 font-semibold text-navy">Perbaikan konten</h4><ol className="divide-y">{output.result.improvements.map((item, i) => <li key={i} className="py-4"><span className="text-xs font-bold uppercase text-primary-strong">Prioritas {item.priority}</span><p className="mt-1 text-sm font-semibold">{item.issue}</p><p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{item.suggestion}</p></li>)}</ol></div>
      <div><div className="mb-3 flex items-center justify-between gap-3"><h4 className="font-semibold text-navy">Usulan konten revisi</h4><Button variant="outline" size="sm" onClick={() => copy(output.result.revised_content)}><Copy /> Salin konten</Button></div><div className="whitespace-pre-wrap break-words rounded-lg border bg-muted/30 p-5 text-sm leading-relaxed">{output.result.revised_content}</div></div>
      {target !== "manual" && <SeoRecommendationEditor result={output.result} busy={applying} onApply={async (draft, includeContent) => {
        const source = sources.data?.find((s) => s.key === target);
        if (!source) return;
        if (!window.confirm(`Terapkan SEO ke ${source.title}?${includeContent ? " Konten saat ini juga akan diganti." : " Konten tetap dipertahankan."}`)) return;
        setApplying(true); setError(""); setApplied(null);
        try {
          const patch = seoApplication(draft, source.kind, includeContent);
          const table = source.kind === "article" ? "articles" : source.kind === "product" ? "products" : "categories";
          const { data: saved, error: saveError } = await supabase.from(table).update(patch).eq("id", source.id).select("id,seo_title,seo_description").single();
          if (saveError || !saved) throw new Error("SEO gagal diterapkan; periksa kelengkapan konten dan akses Anda");
          if (saved.seo_title !== patch.seo_title || saved.seo_description !== patch.seo_description) throw new Error("SEO tersimpan tidak sesuai rekomendasi. Silakan coba kembali.");
          await qc.invalidateQueries(); await router.invalidate();
          setApplied({ url: source.published ? source.url : "", title: saved.seo_title ?? "", description: saved.seo_description ?? "", includeContent });
          toast.success("SEO diterapkan dan disimpan");
        } catch (e) { const message = e instanceof Error ? e.message : "SEO gagal diterapkan"; setError(message); toast.error(message); }
        finally { setApplying(false); }
      }} />}
      {applied && <div role="status" className="space-y-3 border-l-2 border-success pl-4">
        <p className="font-semibold text-success">SEO berhasil disimpan</p>
        <p className="text-sm font-semibold">{applied.title}</p><p className="text-sm text-muted-foreground">{applied.description}</p>
        <p className="text-sm text-muted-foreground">{applied.includeContent ? "Konten revisi juga telah disimpan." : "Judul dan deskripsi SEO diperbarui. Isi halaman tetap dipertahankan."}{!applied.url && " Konten masih draft; publikasikan agar terlihat di website."}</p>
        {applied.url && <Button asChild variant="outline"><a href={applied.url} target="_blank" rel="noreferrer"><ExternalLink /> Periksa halaman website</a></Button>}
      </div>}
    </div>}
  </section>;
}