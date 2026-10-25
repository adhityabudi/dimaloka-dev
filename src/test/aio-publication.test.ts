import { describe, it, expect } from "vitest";
import { parseAioOutput } from "@/lib/aio";
import { aioArticlePublication, aioProductImplementation, aioArticleSeoImplementation, aioServiceImplementation } from "@/lib/aio-publication";

describe("Explicit AIO implementation", () => {
  const article = parseAioOutput("article_generate", JSON.stringify({ title: "Artikel", content_markdown: "## Isi\nKonten", meta_title: "Judul SEO", meta_description: "Deskripsi", focus_keyword: "artikel" }));
  it("posts generated articles with a publication date", () => {
    expect(aioArticlePublication(article).status).toBe("published");
    expect(aioArticlePublication(article).published_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
  it("blocks article posting without required SEO", () => {
    expect(() => aioArticlePublication({ ...article, focus_keyword: "" })).toThrow("Focus keyword");
    expect(() => aioArticlePublication({ ...article, meta_title: "" })).toThrow("SEO title");
    expect(() => aioArticlePublication({ ...article, meta_description: "" })).toThrow("SEO description");
  });
  it("product implementation preserves commercial fields and URLs", () => {
    const result = parseAioOutput("product_seo", JSON.stringify({ description: "Konten", seo_title: "SEO", seo_description: "Deskripsi", keywords: ["produk"] }));
    const patch = aioProductImplementation(result, "Produk");
    expect(patch.status).toBe("published");
    for (const field of ["price", "packages", "slug", "category_id", "cover_image"]) expect(patch).not.toHaveProperty(field);
    expect(() => aioProductImplementation({ ...result, keywords: [] }, "Produk")).toThrow("Keywords");
  });
  it("SEO implementation preserves article content and slug", () => {
    const result = parseAioOutput("article_seo", JSON.stringify({ score: 80, meta_title: "SEO", meta_description: "Deskripsi" }));
    const patch = aioArticleSeoImplementation(result, { focus_keyword: "artikel" });
    expect(patch).not.toHaveProperty("content");
    expect(patch).not.toHaveProperty("slug");
  });
  it("service implementation escapes HTML and requires keywords", () => {
    const result = parseAioOutput("website_content", JSON.stringify({ hero: { headline: "Layanan", subheadline: "<script>x</script>" }, meta_title: "SEO", meta_description: "Deskripsi" }));
    const patch = aioServiceImplementation(result, [" layanan "]);
    expect(patch.description).toContain("<h2>Layanan</h2>");
    expect(patch.description).not.toContain("<script>");
    expect(patch.keywords).toEqual(["layanan"]);
    expect(() => aioServiceImplementation(result, [])).toThrow("Keywords");
  });
});