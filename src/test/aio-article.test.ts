import { describe, expect, it } from "vitest";
import { articleLinkCatalog, groundArticleLinks, validateArticleLinks } from "@/lib/aio-article";
import { parseAioOutput } from "@/lib/aio";

describe("Article internal links", () => {
  const links = articleLinkCatalog([{ title: "Website", slug: "company-profile" }], [{ name: "SEO", slug: "seo" }]);
  it("uses exact available product and service paths", () => {
    expect(links.map(l => l.url)).toEqual(["/p/company-profile", "/layanan/seo"]);
    expect(groundArticleLinks("[A](/p/company-profile) [B](/layanan/missing) [C](https://example.com) ![D](/fake.png)", links)).toBe("[A](/p/company-profile) B C D");
  });
  it("rejects edited links outside the current available catalog", () => {
    const article = parseAioOutput("article_generate", JSON.stringify({ title: "A", content_markdown: "[B](/layanan/seo)" }));
    expect(() => validateArticleLinks(article, links)).not.toThrow();
    expect(() => validateArticleLinks(article, [])).toThrow("Tautan tidak tersedia");
    expect(() => validateArticleLinks({ ...article, cta: "[C](/blog/fake)" }, links)).toThrow("/blog/fake");
  });
});