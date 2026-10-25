import { describe, expect, it } from "vitest";
import { absoluteUrl, publicPageHead, serviceOffers } from "@/lib/structured-data";
import { jsonLd } from "@/lib/site";
import { xmlEscape } from "@/lib/sitemap-utils";

const root = { origin: "https://example.com", layout: { settings: {} } };
const graph = (head: ReturnType<typeof publicPageHead>) => JSON.parse(head.scripts[0].children)["@graph"] as Record<string, any>[];
describe("automatic public structured data", () => {
  it("updates service image, keyword and content from current admin values", () => {
    const data = { category: { slug: "seo", name: "SEO", keywords: ["audit SEO"], seo_title: "Audit SEO", seo_description: "Audit teknis", description: "Layanan audit" }, landing: { content: { title: "Audit Website", description: "Periksa website bisnis", hero_image: "https://example.com/new.jpg" } }, products: [] };
    const first = graph(publicPageHead("service", data, root));
    expect(first.find(e => e["@type"] === "Service")).toMatchObject({ name: "Audit Website", image: "https://example.com/new.jpg", keywords: "audit SEO" });
    const next = graph(publicPageHead("service", { ...data, category: { ...data.category, keywords: ["SEO lokal"] }, landing: { content: { title: "SEO Lokal", hero_image: "https://example.com/replaced.jpg" } } }, root));
    expect(next.find(e => e["@type"] === "Service")).toMatchObject({ name: "SEO Lokal", image: "https://example.com/replaced.jpg", keywords: "SEO lokal" });
  });
  it("uses service offers and never manufactures product review ratings", () => {
    const p = { slug: "audit", title: "Audit", price: 750000, packages: [{ name: "Dasar", price: 900000 }] };
    expect(serviceOffers(p, root.origin)[0]).toMatchObject({ price: 900000, priceCurrency: "IDR", url: "https://example.com/p/audit" });
    const entity = graph(publicPageHead("product", { product: p }, root)).find(e => e["@type"] === "Service");
    expect(entity).toBeDefined(); expect(entity).not.toHaveProperty("aggregateRating");
  });
  it("updates article headline, image, keywords, and modified date", () => {
    const entities = graph(publicPageHead("article", { article: { slug: "panduan", title: "Panduan Terbaru", cover_image: "/media/article.jpg", focus_keyword: "SEO website", keywords: ["optimasi"], updated_at: "2026-10-25T02:00:00Z" } }, root));
    expect(entities.find(e => e["@type"] === "BlogPosting")).toMatchObject({ headline: "Panduan Terbaru", image: "https://example.com/media/article.jpg", keywords: "SEO website, optimasi", dateModified: "2026-10-25T02:00:00Z" });
  });
  it("excludes unpublished portfolio works", () => {
    const head = publicPageHead("servicePortfolio", { slug: "website", value: { projects: [{ id: "hidden", title: "Private", category: "Web", published: false }, { id: "visible", title: "Visible", category: "Web", published: true, image: "/visible.jpg", is_demo: true }] } }, root);
    const list = graph(head).find(e => e["@type"] === "ItemList");
    expect(list?.numberOfItems).toBe(1); expect(list?.itemListElement[0].item.name).toBe("Visible");
    expect(head.scripts[0].children).not.toContain("Private");
  });
  it("uses self-referencing canonical URLs and ordered breadcrumbs", () => {
    const head = publicPageHead("article", { article: { slug: "seo", title: "SEO" } }, root);
    expect(head.links[0].href).toBe("https://example.com/blog/seo");
    const breadcrumb = graph(head).find(e => e["@type"] === "BreadcrumbList");
    expect(breadcrumb?.itemListElement.map((e: any) => e.position)).toEqual([1, 2, 3]);
  });
  it("safely serializes admin text and rejects unsafe image URLs", () => {
    const text = '</script><script>alert("x")</script>';
    const script = jsonLd({ name: text }); expect(script.children).not.toContain("</script>"); expect(JSON.parse(script.children).name).toBe(text);
    expect(absoluteUrl("javascript:alert(1)", root.origin)).toBeUndefined();
    expect(xmlEscape("https://example.com/?a=1&b=2")).toBe("https://example.com/?a=1&amp;b=2");
  });
});