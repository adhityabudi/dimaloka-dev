import { articleDraftFromAi, articleSeoPatchFromAi, productDraftFromAi, markdownToHtml, type AioOutput } from "./aio";
import { canPublish } from "./seo";

export function requireAioSeo(value: Parameters<typeof canPublish>[0], kind: Parameters<typeof canPublish>[1]) {
  const check = canPublish(value, kind);
  if (!check.ok) throw new Error(`Belum bisa posting. Lengkapi: ${check.missing.join(", ")}`);
}
export function aioArticlePublication(result: AioOutput<"article_generate">) {
  const draft = articleDraftFromAi(result);
  requireAioSeo(draft, "article");
  return { ...draft, status: "published" as const, published_at: new Date().toISOString() };
}
export function aioProductImplementation(result: AioOutput<"product_seo">, title: string) {
  const { slug, status, ...patch } = productDraftFromAi(result, title);
  requireAioSeo(patch, "product");
  return { ...patch, status: "published" as const };
}
export function aioArticleSeoImplementation(result: AioOutput<"article_seo">, existing: Parameters<typeof canPublish>[0]) {
  const patch = articleSeoPatchFromAi(result);
  requireAioSeo({ ...existing, ...patch }, "article");
  return patch;
}
export function aioServiceImplementation(result: AioOutput<"website_content">, keywords: string[]) {
  const patch = { seo_title: result.meta_title.trim().slice(0, 60), seo_description: result.meta_description.trim().slice(0, 160), keywords: keywords.map(k => k.trim()).filter(Boolean), description: markdownToHtml([
    result.hero.headline ? `## ${result.hero.headline}` : "", result.hero.subheadline,
    ...result.sections.flatMap(s => [s.heading ? `## ${s.heading}` : "", s.body, ...s.items.map(item => `- ${item}`)]),
  ].join("\n\n")) };
  requireAioSeo(patch, "category");
  if (!patch.description) throw new Error("Konten halaman masih kosong");
  return patch;
}