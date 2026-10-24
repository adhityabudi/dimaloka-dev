import { slugify, stripHtml } from "./format";

export const TITLE_MAX = 60;
export const DESC_MIN = 140;
export const DESC_MAX = 160;

export function titleOk(t?: string | null) {
  const l = (t ?? "").trim().length;
  return l > 0 && l <= TITLE_MAX;
}
export function descOk(d?: string | null) {
  const l = (d ?? "").trim().length;
  return l >= DESC_MIN && l <= DESC_MAX;
}

/** Content may only be published when SEO title, description and keywords are filled. */
export function canPublish(c: { seo_title?: string | null; seo_description?: string | null; keywords?: string[] | null; focus_keyword?: string | null }, kind: "product" | "category" | "article") {
  const missing: string[] = [];
  if (!(c.seo_title ?? "").trim()) missing.push("SEO title");
  if (!(c.seo_description ?? "").trim()) missing.push("SEO description");
  if (kind === "article") {
    if (!(c.focus_keyword ?? "").trim()) missing.push("Focus keyword");
  } else if (!c.keywords || c.keywords.filter((k) => k.trim()).length === 0) missing.push("Keywords");
  return { ok: missing.length === 0, missing };
}

export type ArticleSeoInput = {
  title: string;
  slug: string;
  content: string;
  seo_title?: string | null;
  seo_description?: string | null;
  focus_keyword?: string | null;
  cover_image?: string | null;
};

export function scoreArticle(a: ArticleSeoInput) {
  const kw = (a.focus_keyword ?? "").trim().toLowerCase();
  const html = a.content ?? "";
  const text = stripHtml(html).toLowerCase();
  const firstP = stripHtml((html.match(/<p[^>]*>([\s\S]*?)<\/p>/i) ?? ["", ""])[1]).toLowerCase();
  const checks = [
    { label: "Focus keyword diisi", ok: kw.length > 0 },
    { label: `Meta title 1–${TITLE_MAX} karakter`, ok: titleOk(a.seo_title) },
    { label: `Meta description ${DESC_MIN}–${DESC_MAX} karakter`, ok: descOk(a.seo_description) },
    { label: "Keyword ada di judul (H1)", ok: !!kw && a.title.toLowerCase().includes(kw) },
    { label: "Keyword ada di meta title", ok: !!kw && (a.seo_title ?? "").toLowerCase().includes(kw) },
    { label: "Keyword ada di meta description", ok: !!kw && (a.seo_description ?? "").toLowerCase().includes(kw) },
    { label: "Keyword ada di paragraf pertama", ok: !!kw && firstP.includes(kw) },
    { label: "Keyword ada di URL", ok: !!kw && a.slug.includes(slugify(kw)) },
    { label: "Minimal 1 subjudul H2", ok: /<h2[\s>]/i.test(html) },
    { label: "Keyword ada di salah satu H2", ok: !!kw && [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].some((m) => stripHtml(m[1]).toLowerCase().includes(kw)) },
    { label: "Tidak ada H1 di dalam konten", ok: !/<h1[\s>]/i.test(html) },
    { label: "Semua gambar punya alt text", ok: [...html.matchAll(/<img[^>]*>/gi)].every((m) => /alt="[^"]+"/i.test(m[0])) },
    { label: "Ada internal link", ok: /<a[^>]+href="\/[^"]*"/i.test(html) },
    { label: "Ada gambar cover", ok: !!a.cover_image },
    { label: "Konten minimal 300 kata", ok: text.split(" ").filter(Boolean).length >= 300 },
  ];
  const passed = checks.filter((c) => c.ok).length;
  return { score: Math.round((passed / checks.length) * 100), checks };
}
