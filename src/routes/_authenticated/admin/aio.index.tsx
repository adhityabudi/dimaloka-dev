import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, FileDown, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { aiGenerate } from "@/lib/aio.functions";
import { AIO_FEATURES, AIO_FEATURE_LABELS, articleDraftFromAi, articleMarkdown, articleSeoPatchFromAi, productDraftFromAi, type AioFeature, type AioOutput } from "@/lib/aio";
import { stripHtml } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/aio/")({ component: Page });

const FIELDS: Record<AioFeature, { key: string; label: string; long?: boolean; required?: boolean }[]> = {
  article_generate: [{ key: "topic", label: "Judul / topik", required: true }, { key: "focus_keyword", label: "Focus keyword", required: true }, { key: "tone", label: "Tone (mis. kasual-profesional)" }],
  article_seo: [{ key: "title", label: "Judul artikel" }, { key: "article", label: "Isi artikel", long: true, required: true }, { key: "focus_keyword", label: "Focus keyword", required: true }],
  website_content: [{ key: "section_type", label: "Tipe section (hero / about / landing / lainnya)", required: true }, { key: "brief", label: "Deskripsi singkat halaman", long: true, required: true }],
  product_seo: [{ key: "product_name", label: "Nama produk", required: true }, { key: "category", label: "Layanan" }, { key: "features", label: "Fitur / keunggulan utama", long: true, required: true }],
};

const copy = (s: string) => navigator.clipboard.writeText(s).then(() => toast.success("Disalin"));

async function uniqueSlug(table: "articles" | "products", base: string) {
  const { data } = await supabase.from(table).select("slug").like("slug", `${base}%`);
  const taken = new Set((data ?? []).map((r) => r.slug));
  let slug = base || "draft", i = 2;
  while (taken.has(slug)) slug = `${base}-${i++}`;
  return slug;
}

function Page() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const generate = useServerFn(aiGenerate);
  const [feature, setFeature] = useState<AioFeature>("article_generate");
  const [input, setInput] = useState<Record<string, string>>({});
  const [articleId, setArticleId] = useState("manual");
  const [result, setResult] = useState<{ feature: AioFeature; content: any; model: string } | null>(null);
  const [busy, setBusy] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState("");
  const articles = useQuery({ queryKey: ["aio-articles"], queryFn: async () => {
    const { data, error } = await supabase.from("articles").select("id,title,content,focus_keyword").order("updated_at", { ascending: false });
    if (error) throw error; return data;
  }, enabled: feature === "article_seo" });
  const fields = FIELDS[feature];
  const ready = fields.every((f) => !f.required || (input[f.key] ?? "").trim());

  const run = async () => {
    setBusy(true); setError(""); setResult(null);
    try { const r = await generate({ data: { feature, input: Object.fromEntries(fields.map((f) => [f.key, input[f.key] ?? ""])) } }); setResult({ feature, ...r }); }
    catch (e) { setError(e instanceof Error ? e.message : "Generate gagal"); } finally { setBusy(false); }
  };

  const saveDraft = async () => {
    if (!result) return;
    setSaving(true);
    try {
      if (result.feature === "article_generate") {
        const draft = articleDraftFromAi(result.content);
        const { data, error } = await supabase.from("articles").insert({ ...draft, slug: await uniqueSlug("articles", draft.slug) }).select("id").single();
        if (error) throw error;
        await qc.invalidateQueries({ queryKey: ["adm-articles"] });
        toast.success("Draft artikel dibuat"); navigate({ to: "/admin/artikel/$id/edit", params: { id: data.id } });
      } else if (result.feature === "article_seo") {
        if (articleId === "manual") throw new Error("Pilih artikel tujuan terlebih dahulu");
        const { error } = await supabase.from("articles").update(articleSeoPatchFromAi(result.content)).eq("id", articleId);
        if (error) throw error;
        await qc.invalidateQueries({ queryKey: ["adm-article", articleId] }); await qc.invalidateQueries({ queryKey: ["adm-articles"] });
        toast.success("SEO diterapkan ke artikel"); navigate({ to: "/admin/artikel/$id/edit", params: { id: articleId } });
      } else if (result.feature === "product_seo") {
        const draft = productDraftFromAi(result.content, input.product_name ?? "Produk baru");
        const { data, error } = await supabase.from("products").insert({ ...draft, slug: await uniqueSlug("products", draft.slug) }).select("id").single();
        if (error) throw error;
        await qc.invalidateQueries({ queryKey: ["adm-products"] });
        toast.success("Draft produk dibuat"); navigate({ to: "/admin/produk/$id/edit", params: { id: data.id } });
      }
    } catch (e) { toast.error(e instanceof Error ? e.message : "Gagal menyimpan draft"); } finally { setSaving(false); }
  };

  return <div className="space-y-6">
    <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
      <label className="block space-y-2 text-sm font-semibold">Fitur AI
        <Select value={feature} onValueChange={(v) => { setFeature(v as AioFeature); setResult(null); setError(""); }}><SelectTrigger aria-label="Fitur AI"><SelectValue /></SelectTrigger><SelectContent>{AIO_FEATURES.map((f) => <SelectItem key={f} value={f}>{AIO_FEATURE_LABELS[f]}</SelectItem>)}</SelectContent></Select>
      </label>
      {feature === "article_seo" && <label className="block space-y-2 text-sm font-semibold">Ambil dari artikel
        <Select value={articleId} onValueChange={(id) => { setArticleId(id); const a = articles.data?.find((x) => x.id === id); if (a) setInput({ title: a.title, article: stripHtml(a.content), focus_keyword: a.focus_keyword ?? "" }); }}><SelectTrigger aria-label="Artikel"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="manual">Tempel manual</SelectItem>{articles.data?.map((a) => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}</SelectContent></Select>
      </label>}
      {fields.map((f) => <label key={f.key} className="block space-y-2 text-sm font-semibold">{f.label}{f.required && " *"}
        {f.long ? <Textarea aria-label={f.label} rows={f.key === "article" ? 12 : 4} value={input[f.key] ?? ""} onChange={(e) => setInput({ ...input, [f.key]: e.target.value })} /> : <Input aria-label={f.label} value={input[f.key] ?? ""} onChange={(e) => setInput({ ...input, [f.key]: e.target.value })} />}
      </label>)}
      <Button disabled={busy || !ready} onClick={run}>{busy ? <Loader2 className="animate-spin" /> : <Sparkles />}{busy ? "AI sedang menulis…" : "Generate"}</Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </section>
    {result && <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-extrabold text-navy">Hasil — {AIO_FEATURE_LABELS[result.feature]} <span className="text-xs font-normal text-muted-foreground">({result.model})</span></h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => copy(JSON.stringify(result.content, null, 2))}><Copy /> Copy JSON</Button>
          {result.feature === "article_generate" && <Button size="sm" variant="outline" onClick={() => copy(articleMarkdown(result.content))}><Copy /> Copy Markdown</Button>}
          {result.feature !== "website_content" && <Button size="sm" disabled={saving} onClick={saveDraft}>{saving ? <Loader2 className="animate-spin" /> : <FileDown />} Simpan ke draft</Button>}
        </div>
      </div>
      <Preview feature={result.feature} c={result.content} />
    </section>}
  </div>;
}

function Meta({ title, desc }: { title?: string; desc?: string }) {
  if (!title && !desc) return null;
  return <div className="rounded-xl border p-4"><p className="text-xs font-semibold text-muted-foreground">Pratinjau Google</p><p className="mt-1 text-lg text-primary-strong">{title} <span className="text-xs text-muted-foreground">({title?.length ?? 0}/60)</span></p><p className="text-sm text-muted-foreground">{desc} <span className="text-xs">({desc?.length ?? 0}/160)</span></p></div>;
}
const Tags = ({ items }: { items: string[] }) => <div className="flex flex-wrap gap-1.5">{items.map((k) => <span key={k} className="rounded-full bg-muted px-2.5 py-1 text-xs">{k}</span>)}</div>;
const List = ({ title, items }: { title: string; items: string[] }) => items.length ? <div><h3 className="font-bold">{title}</h3><ul className="ml-5 list-disc text-sm">{items.map((x) => <li key={x}>{x}</li>)}</ul></div> : null;

function Preview({ feature, c }: { feature: AioFeature; c: any }) {
  if (feature === "article_generate") { const r = c as AioOutput<"article_generate">; return <div className="space-y-4">
    <Meta title={r.meta_title} desc={r.meta_description} /><p className="text-sm">Slug: <code>/blog/{r.slug}</code> · Focus: <strong>{r.focus_keyword}</strong></p><Tags items={r.keywords} />
    <div className="prose max-w-none rounded-xl border p-5" dangerouslySetInnerHTML={{ __html: articleDraftFromAi(r).content }} /></div>; }
  if (feature === "article_seo") { const r = c as AioOutput<"article_seo">; return <div className="space-y-4">
    <p className="text-3xl font-extrabold">Skor SEO: <span className={r.score >= 80 ? "text-success" : r.score >= 60 ? "text-primary" : "text-destructive"}>{r.score}</span>/100</p>
    <Meta title={r.meta_title} desc={r.meta_description} /><Tags items={r.keywords} />
    {r.suggested_h1 && <p className="text-sm"><strong>H1 usulan:</strong> {r.suggested_h1}</p>}<List title="Struktur heading usulan" items={r.suggested_headings} />
    <ol className="space-y-2">{r.issues.map((i, n) => <li key={n} className="rounded-lg border p-3 text-sm"><span className="mr-2 rounded bg-muted px-1.5 text-xs font-bold uppercase">{i.severity}</span><strong>{i.problem}</strong><p className="text-muted-foreground">{i.fix}</p></li>)}</ol>
    {r.improved_excerpt && <p className="text-sm"><strong>Ringkasan:</strong> {r.improved_excerpt}</p>}</div>; }
  if (feature === "website_content") { const r = c as AioOutput<"website_content">; return <div className="space-y-4">
    <div className="rounded-xl bg-navy p-6 text-primary-foreground"><p className="text-2xl font-extrabold">{r.hero.headline}</p><p className="mt-2 opacity-80">{r.hero.subheadline}</p><div className="mt-4 flex gap-2"><span className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold">{r.hero.cta_primary}</span>{r.hero.cta_secondary && <span className="rounded-lg border px-4 py-2 text-sm">{r.hero.cta_secondary}</span>}</div></div>
    {r.sections.map((s, i) => <div key={i} className="rounded-xl border p-4"><p className="text-xs uppercase text-muted-foreground">{s.type}</p><h3 className="font-bold">{s.heading}</h3><p className="text-sm">{s.body}</p>{s.items.length > 0 && <ul className="ml-5 list-disc text-sm">{s.items.map((x) => <li key={x}>{x}</li>)}</ul>}<Button size="sm" variant="ghost" onClick={() => copy(`${s.heading}\n\n${s.body}\n${s.items.map((x) => `- ${x}`).join("\n")}`)}><Copy /> Salin</Button></div>)}
    <Meta title={r.meta_title} desc={r.meta_description} /></div>; }
  const r = c as AioOutput<"product_seo">; return <div className="space-y-4">
    <p className="font-semibold">{r.short_description}</p><div className="prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: productDraftFromAi(r, "x").description }} />
    <div className="grid gap-4 sm:grid-cols-2"><List title="Fitur" items={r.features} /><List title="Manfaat" items={r.benefits} /></div>
    <Tags items={r.tags} /><Meta title={r.seo_title} desc={r.seo_description} /><Tags items={r.keywords} /></div>;
}
