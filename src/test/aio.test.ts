import { describe, expect, it } from "vitest";
import { aioRequestSchema, articleDraftFromAi, parseAioOutput, productDraftFromAi, AIO_FEATURES } from "@/lib/aio";
import { AIO_DEFAULT_PROMPTS } from "@/lib/aio-prompts.server";

describe("AIO", () => {
  it("accepts only the four features and non-empty input", () => {
    expect(aioRequestSchema.safeParse({ feature: "other", input: { a: "x" } }).success).toBe(false);
    expect(aioRequestSchema.safeParse({ feature: "product_seo", input: { a: "  " } }).success).toBe(false);
    expect(aioRequestSchema.safeParse({ feature: "product_seo", input: { a: "x" }, model: "deepseek/v4" }).success).toBe(false);
    expect(aioRequestSchema.safeParse({ feature: "product_seo", input: { a: "x" }, model: "deepseek-v4-pro" }).success).toBe(true);
  });
  it("ships a default prompt for every feature", () => {
    for (const f of AIO_FEATURES) expect(AIO_DEFAULT_PROMPTS[f].system_prompt).toContain("Hanya keluarkan JSON valid");
  });
  it("article drafts stay draft and rewrite /kategori links to /layanan", () => {
    const r = parseAioOutput("article_generate", '```json\n{"title":"Jasa SEO","meta_title":"t","meta_description":"d","slug":"Jasa SEO!","focus_keyword":"jasa seo","keywords":["a"],"content_markdown":"# H1\\n\\nLihat [ini](/kategori/seo)","faq":[],"cta":"Hubungi"}\n```');
    const d = articleDraftFromAi(r);
    expect(d.status).toBe("draft");
    expect(d.slug).toBe("jasa-seo");
    expect(d.content).toContain('href="/layanan/seo"');
    expect(d.content).not.toContain("<h1>");
  });
  it("product drafts stay draft", () => {
    const d = productDraftFromAi(parseAioOutput("product_seo", '{"description":"x <b>","features":["f"]}'), "Logo");
    expect(d.status).toBe("draft");
    expect(d.description).toBe("<p>x &lt;b&gt;</p>");
  });
});
