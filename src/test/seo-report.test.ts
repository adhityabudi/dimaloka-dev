import { describe, expect, it } from "vitest";
import { filterReportArticles, reportArticles, reportCsv } from "@/lib/seo-report";
const articles = [
  { id: "1", title: "Panduan SEO", slug: "panduan-seo", status: "published", published_at: "2026-10-25" },
  { id: "2", title: "Draft", slug: "draft", status: "draft", published_at: null },
];
describe("SEO report", () => {
  it("only includes published articles", () => { expect(reportArticles(articles).map(a => a.path)).toEqual(["/blog/panduan-seo"]); });
  it("never equates publication with indexing or invents traffic", () => { expect(reportArticles(articles)[0]).toMatchObject({ indexed: null, clicks: null, views: null, bounceRate: null }); });
  it("filters article titles and paths", () => { const rows = reportArticles(articles); expect(filterReportArticles(rows, " SEO ")).toEqual(rows); expect(filterReportArticles(rows, "absent")).toEqual([]); });
  it("exports unavailable metrics rather than zero values", () => { expect(reportCsv(reportArticles(articles))).toContain('"Belum tersedia","Belum tersedia","Belum tersedia","Belum tersedia"'); });
  it("neutralizes formula injection in exported titles", () => { expect(reportCsv(reportArticles([{ ...articles[0], title: "=SUM(1,1)" }]))).toContain('"\'=SUM(1,1)"'); });
});