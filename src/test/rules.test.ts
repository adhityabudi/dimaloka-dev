import { describe, expect, it } from "vitest";
import { canPublish, descOk, scoreArticle, titleOk } from "@/lib/seo";
import { invoiceNumber, slugify } from "@/lib/format";

describe("SEO rules", () => {
  it("meta title max 60 chars", () => {
    expect(titleOk("a".repeat(60))).toBe(true);
    expect(titleOk("a".repeat(61))).toBe(false);
  });
  it("meta description must be 140-160 chars", () => {
    expect(descOk("a".repeat(139))).toBe(false);
    expect(descOk("a".repeat(150))).toBe(true);
    expect(descOk("a".repeat(161))).toBe(false);
  });
  it("blocks publishing a product without keywords", () => {
    expect(canPublish({ seo_title: "x", seo_description: "y", keywords: [] }, "product").ok).toBe(false);
    expect(canPublish({ seo_title: "x", seo_description: "y", keywords: ["k"] }, "product").ok).toBe(true);
  });
  it("blocks publishing an article without focus keyword", () => {
    expect(canPublish({ seo_title: "x", seo_description: "y", focus_keyword: "" }, "article").ok).toBe(false);
  });
  it("article with no focus keyword scores low", () => {
    expect(scoreArticle({ title: "T", slug: "t", content: "<p>x</p>" }).score).toBeLessThan(30);
  });
});

describe("Invoice & slug", () => {
  it("formats invoice number INV-YYYYMM-####", () => {
    expect(invoiceNumber(new Date(2026, 9, 25), 7)).toBe("INV-202610-0007");
  });
  it("slugifies titles", () => {
    expect(slugify("Jasa Pembuatan Website!")).toBe("jasa-pembuatan-website");
  });
});
