import type { AioOutput } from "./aio";

export type ArticleLink = { title: string; url: string };
export function articleLinkCatalog(products: { title: string; slug: string }[], services: { name: string; slug: string }[]): ArticleLink[] {
  return [...products.map(p => ({ title: p.title, url: `/p/${p.slug}` })), ...services.map(s => ({ title: s.name, url: `/layanan/${s.slug}` }))];
}
export function groundArticleLinks(text: string, links: ArticleLink[]) {
  const allowed = new Set(links.map(l => l.url));
  return text.replace(/!?\[([^\]]+)\]\(([^\s)]+)\)/g, (match, label: string, url: string) => allowed.has(url) && !match.startsWith("!") ? `[${label}](${url})` : label);
}
export function validateArticleLinks(result: AioOutput<"article_generate">, links: ArticleLink[]) {
  const allowed = new Set(links.map(l => l.url));
  const text = [result.content_markdown, result.cta, ...result.faq.flatMap(f => [f.q, f.a])].join("\n");
  for (const match of text.matchAll(/!?\[([^\]]+)\]\(([^\s)]+)\)/g)) {
    if (match[0].startsWith("!") || !allowed.has(match[2])) throw new Error(`Tautan tidak tersedia: ${match[2]}. Pilih produk atau layanan yang tersedia.`);
  }
}