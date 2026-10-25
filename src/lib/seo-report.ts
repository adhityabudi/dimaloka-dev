export type ReportArticle = { id: string; title: string; slug: string; status: string; published_at: string | null };
export function reportArticles(articles: ReportArticle[]) {
  return articles.filter(a => a.status === "published").map(a => ({
    id: a.id, title: a.title, path: `/blog/${a.slug}`, publishedAt: a.published_at,
    indexed: null, clicks: null, views: null, bounceRate: null,
  }));
}
export function filterReportArticles<T extends { title: string; path: string }>(rows: T[], search: string) {
  const query = search.trim().toLocaleLowerCase("id-ID");
  return rows.filter(row => `${row.title} ${row.path}`.toLocaleLowerCase("id-ID").includes(query));
}
export function reportCsv(rows: ReturnType<typeof reportArticles>) {
  const cell = (v: string) => `"${(/^[=+@\-\t\r]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
  return ["Artikel,URL,Tanggal publikasi,Status indeks,Klik Google,Tayangan halaman,Bounce rate", ...rows.map(r => [r.title, r.path, r.publishedAt ?? "", "Belum tersedia", "Belum tersedia", "Belum tersedia", "Belum tersedia"].map(cell).join(","))].join("\r\n");
}