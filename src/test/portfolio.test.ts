import { describe, expect, it } from "vitest";
import { defaultPortfolio, filterPortfolio, liveHref, portfolioPage, validProjectUrl } from "@/lib/portfolio";

describe("Portfolio visibility and filtering", () => {
  it("falls back to available projects when page data is missing", () => {
    expect(portfolioPage(undefined).projects.map(p => p.id)).toEqual(["aruna", "lumiere", "nusa"]);
    expect(portfolioPage(null).projects.map(p => p.id)).toEqual(["aruna", "lumiere", "nusa"]);
  });
  it("normalizes null collections without replacing intentionally empty projects", () => {
    expect(portfolioPage({ projects: null, categories: null }).projects).toHaveLength(3);
    expect(portfolioPage({ projects: [] }).projects).toEqual([]);
    expect(portfolioPage({ projects: [null, {}] }).projects).toEqual([]);
  });
  it("keeps unpublished projects off public pages", () => {
    const hidden = { ...defaultPortfolio.projects[0], id: "hidden", published: false };
    expect(filterPortfolio([...defaultPortfolio.projects, hidden], "Semua", "").map(p => p.id)).not.toContain("hidden");
  });
  it("shows only the selected category", () => {
    expect(filterPortfolio(defaultPortfolio.projects, "E-Commerce", "").map(p => p.id)).toEqual(["lumiere"]);
  });
  it("searches title and industry without case sensitivity", () => {
    expect(filterPortfolio(defaultPortfolio.projects, "Semua", " ARSITEKTUR ").map(p => p.id)).toEqual(["aruna"]);
  });
  it("rejects unsafe project website protocols", () => {
    expect(validProjectUrl("javascript:alert(1)")).toBe(false);
    expect(validProjectUrl("https://example.com")).toBe(true);
  });
});