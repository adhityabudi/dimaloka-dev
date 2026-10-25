import { describe, expect, it } from "vitest";
import { isServiceSlug, portfolioKey, serviceContent, servicePortfolio, SERVICE_SLUGS } from "@/lib/services";

describe("Master portfolio per service", () => {
  it("covers website plus the five service pages", () => {
    expect([...SERVICE_SLUGS]).toEqual(["website", "desain-grafis", "digital-marketing", "seo", "aplikasi", "video"]);
    expect(isServiceSlug("blog")).toBe(false);
  });
  it("keeps the existing Website portfolio data under its original key", () => {
    expect(portfolioKey("website")).toBe("portfolio_page");
    expect(portfolioKey("seo")).toBe("portfolio_seo");
  });
  it("falls back to each service's own demo projects", () => {
    expect(servicePortfolio("video", null).projects.map(p => p.id)).toEqual(["veritas", "fintrack", "serenity"]);
  });
  it("uses the first published project image when no card image is set", () => {
    const p = servicePortfolio("seo", { card_image: "", projects: [{ id: "a", title: "A", category: "SEO Lokal", image: "x.jpg", published: true }] });
    expect(p.card_image).toBe("x.jpg");
  });
  it("keeps admin edits to service page text", () => {
    expect(serviceContent("aplikasi", { title: "Aplikasi Baru" }).title).toBe("Aplikasi Baru");
    expect(serviceContent("aplikasi", null).features).toHaveLength(3);
  });
});
