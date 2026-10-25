import { z } from "zod";

export const AIO_FEATURES = ["article_generate", "article_seo", "website_content", "product_seo"] as const;
export type AioFeature = (typeof AIO_FEATURES)[number];
export const AIO_FEATURE_LABELS: Record<AioFeature, string> = {
  article_generate: "Generate Artikel Blog",
  article_seo: "Optimasi SEO Artikel",
  website_content: "Generate Konten Website",
  product_seo: "Generate Deskripsi + SEO Produk",
};
export const AIO_MODELS = ["deepseek-v4-pro", "claude-opus-5-5", "gpt-6-astra", "glm-5.3"] as const;
export const AIO_DEFAULT_MODEL = "deepseek-v4-pro";
export const AIO_DEFAULT_MAX_TOKENS = 2048;

const modelId = z.string().trim().min(1).max(120).refine((m) => !m.includes("/"), "Gunakan ID model tanpa prefix vendor");
export const aioRequestSchema = z.object({
  feature: z.enum(AIO_FEATURES),
  input: z.record(z.string(), z.string().max(24000)).refine((v) => Object.values(v).some((s) => s.trim().length > 0), "Input tidak boleh kosong"),
  model: modelId.optional(),
});
export const aioPromptSchema = z.object({
  feature: z.enum(AIO_FEATURES),
  system_prompt: z.string().trim().min(20).max(20000),
  temperature: z.number().min(0).max(2),
  model: modelId.nullable(),
});

const str = z.string().default("");
const strs = z.array(z.string()).default([]);
export const aioOutputSchemas = {
  article_generate: z.object({ title: z.string().min(1), meta_title: str, meta_description: str, slug: str, focus_keyword: str, keywords: strs, content_markdown: z.string().min(1), faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]), cta: str }),
  article_seo: z.object({ score: z.coerce.number().min(0).max(100), meta_title: z.string().min(1), meta_description: z.string().min(1), focus_keyword: str, keywords: strs, issues: z.array(z.object({ severity: z.string(), problem: z.string(), fix: z.string() })).default([]), suggested_h1: str, suggested_headings: strs, improved_excerpt: str }),
  website_content: z.object({ hero: z.object({ headline: str, subheadline: str, cta_primary: str, cta_secondary: str }).default({ headline: "", subheadline: "", cta_primary: "", cta_secondary: "" }), sections: z.array(z.object({ type: str, heading: str, body: str, items: strs })).default([]), meta_title: str, meta_description: str }),
  product_seo: z.object({ short_description: str, description: z.string().min(1), features: strs, benefits: strs, tags: strs, seo_title: str, seo_description: str, keywords: strs }),
};
export type AioOutput<F extends AioFeature> = z.infer<(typeof aioOutputSchemas)[F]>;

/** Old guide links use /kategori; public service URLs are /layanan. */
export function fixServiceLinks<T>(value: T): T {
  return JSON.parse(JSON.stringify(value).replace(/\/kategori\//g, "/layanan/")) as T;
}
export function parseAioOutput<F extends AioFeature>(feature: F, text: string): AioOutput<F> {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{"), end = cleaned.lastIndexOf("}");
  const json = JSON.parse(start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned);
  return fixServiceLinks(aioOutputSchemas[feature].parse(json)) as AioOutput<F>;
}

export function aioUserMessage(feature: AioFeature, input: Record<string, string>) {
  const labels: Record<string, string> = { topic: "Judul/topik", focus_keyword: "Focus keyword", tone: "Tone", title: "Judul artikel", article: "Isi artikel", section_type: "Tipe section", brief: "Deskripsi singkat", product_name: "Nama produk", category: "Layanan", features: "Fitur/keunggulan utama" };
  return Object.entries(input).filter(([, v]) => v.trim()).map(([k, v]) => `${labels[k] ?? k}: ${v.trim()}`).join("\n\n");
}

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function inline(s: string) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\[([^\]]+)\]\((\/[^\s)]*|https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
}
/** Minimal safe Markdown → HTML (headings, lists, bold, links). The H1 is dropped since the article title renders it. */
export function markdownToHtml(md: string) {
  const out: string[] = []; let list: string[] = []; let para: string[] = [];
  const flush = () => { if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`); para = []; if (list.length) out.push(`<ul>${list.map((i) => `<li>${inline(i)}</li>`).join("")}</ul>`); list = []; };
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    const h = line.match(/^(#{1,3})\s+(.+)$/), li = line.match(/^(?:[-*]|\d+\.)\s+(.+)$/);
    if (!line) flush();
    else if (h) { flush(); if (h[1].length > 1) out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); }
    else if (li) { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; } list.push(li[1]); }
    else { if (list.length) flush(); para.push(line); }
  }
  flush();
  return out.join("");
}

export function articleDraftFromAi(r: AioOutput<"article_generate">) {
  const faq = r.faq.length ? `<h2>FAQ</h2>${r.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}` : "";
  const cta = r.cta ? `<p><strong>${esc(r.cta)}</strong></p>` : "";
  return { title: r.title.slice(0, 200), slug: slugify(r.slug || r.title), content: markdownToHtml(r.content_markdown) + faq + cta, seo_title: r.meta_title.slice(0, 60), seo_description: r.meta_description.slice(0, 160), focus_keyword: r.focus_keyword, keywords: r.keywords.slice(0, 12), status: "draft" as const };
}
export function articleSeoPatchFromAi(r: AioOutput<"article_seo">) {
  return { seo_title: r.meta_title.slice(0, 60), seo_description: r.meta_description.slice(0, 160), ...(r.focus_keyword ? { focus_keyword: r.focus_keyword } : {}), keywords: r.keywords.slice(0, 12), ...(r.improved_excerpt ? { excerpt: r.improved_excerpt } : {}) };
}
export function productDraftFromAi(r: AioOutput<"product_seo">, title: string) {
  return { title: title.slice(0, 200), slug: slugify(title), short_description: r.short_description, description: markdownToHtml(r.description), features: r.features, benefits: r.benefits, tags: r.tags.slice(0, 12), seo_title: r.seo_title.slice(0, 60), seo_description: r.seo_description.slice(0, 160), keywords: r.keywords.slice(0, 12), status: "draft" as const };
}
export function articleMarkdown(r: AioOutput<"article_generate">) {
  return `${r.content_markdown}${r.faq.length ? `\n\n## FAQ\n\n${r.faq.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}` : ""}${r.cta ? `\n\n${r.cta}` : ""}`;
}
