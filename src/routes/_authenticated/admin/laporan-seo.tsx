import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Download, FileText, Globe, MousePointerClick, RefreshCw, Search, TrendingUp, Unplug } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSeoReport } from "@/lib/seo-report.functions";
import { filterReportArticles, reportCsv } from "@/lib/seo-report";
import { pageMeta } from "@/lib/site";

const reportQuery = queryOptions({ queryKey: ["admin-seo-report"], queryFn: () => getSeoReport() });
export const Route = createFileRoute("/_authenticated/admin/laporan-seo")({
  head: () => ({ meta: [...pageMeta({ title: "Laporan SEO | Dimaloka", description: "Laporan indeks Google, klik pencarian, bounce rate, dan traffic artikel Dimaloka." }), { name: "robots", content: "noindex, nofollow" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(reportQuery),
  component: SeoReportPage,
});

function SeoReportPage() {
  const { data, refetch, isFetching } = useSuspenseQuery(reportQuery);
  const [search, setSearch] = useState("");
  const shown = filterReportArticles(data.articles, search);
  const metrics = [
    { label: "Halaman diindeks", source: "Google Search Console", icon: Globe },
    { label: "Klik dari Google", source: "Google Search Console", icon: MousePointerClick },
    { label: "Bounce rate", source: "Google Analytics 4", icon: TrendingUp },
    { label: "Traffic blog & artikel", source: "Tayangan halaman · Google Analytics 4", icon: FileText },
  ];
  const exportReport = () => {
    const url = URL.createObjectURL(new Blob(["\uFEFF", reportCsv(shown)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "dimaloka-laporan-seo.csv"; link.click(); URL.revokeObjectURL(url);
  };
  return <div className="max-w-7xl space-y-8">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="mb-2 text-xs font-semibold uppercase text-primary-strong">Dimaloka / Laporan</p><h1 className="text-2xl font-extrabold text-navy">Laporan SEO</h1><p className="mt-2 text-sm text-muted-foreground">Indeks pencarian dan performa konten website.</p></div>
      <div className="flex gap-2"><Button variant="outline" disabled={isFetching} onClick={() => void refetch()}><RefreshCw className={isFetching ? "animate-spin" : ""} /> Muat ulang</Button><Button variant="outline" onClick={exportReport}><Download /> Ekspor CSV</Button></div>
    </header>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(m => <article key={m.label} className="rounded-lg border bg-card p-5"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">{m.label}</h2><m.icon className="h-4 w-4 shrink-0 text-sky" /></div><p className="my-4 text-3xl font-bold text-navy" aria-label={`${m.label}: belum tersedia`}>—</p><p className="text-xs text-muted-foreground">{m.source}</p><p className="mt-2 text-xs font-medium text-primary-strong">Belum terhubung</p></article>)}</div>
    <section className="border-y py-6">
      <div className="flex items-center gap-2"><Unplug className="h-5 w-5 text-primary-strong" /><h2 className="font-bold text-navy">Sumber data belum terhubung</h2></div>
      <div className="mt-4 grid gap-5 text-sm md:grid-cols-2">
        <div><h3 className="font-semibold">Google Search Console</h3><p className="mt-1 leading-relaxed text-muted-foreground">Klik pencarian memerlukan properti website terverifikasi. Jumlah halaman diindeks belum tersedia; artikel terbit tidak berarti sudah diindeks Google.</p></div>
        <div><h3 className="font-semibold">Google Analytics 4</h3><p className="mt-1 leading-relaxed text-muted-foreground">Traffic blog dan bounce rate memerlukan akses laporan Analytics. ID pengukuran saja tidak memberikan akses membaca laporan.</p></div>
      </div>
      <Button variant="outline" className="mt-4" asChild><Link to="/admin/seo"><Search /> Pengaturan SEO</Link></Button>
    </section>
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-bold text-navy">Blog & artikel</h2><p className="mt-1 text-sm text-muted-foreground">{data.articles.length} artikel terbit · {data.products} produk terbit · {data.services} layanan aktif</p></div><Input className="w-full sm:w-72" aria-label="Cari artikel" placeholder="Cari judul atau URL artikel…" value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="mt-5 overflow-hidden rounded-lg border bg-background"><Table><TableHeader><TableRow><TableHead className="min-w-64">Artikel</TableHead><TableHead>Indeks Google</TableHead><TableHead className="text-right">Klik</TableHead><TableHead className="text-right">Traffic</TableHead><TableHead className="text-right">Bounce rate</TableHead></TableRow></TableHeader><TableBody>
        {shown.map(a => <TableRow key={a.id}><TableCell><Link to="/blog/$slug" params={{ slug: a.path.slice("/blog/".length) }} target="_blank" className="font-semibold text-navy hover:text-primary-strong">{a.title}</Link><p className="mt-1 break-all text-xs text-muted-foreground">{a.path}</p></TableCell><TableCell className="text-xs text-muted-foreground">Belum diperiksa</TableCell><TableCell className="text-right">—</TableCell><TableCell className="text-right">—</TableCell><TableCell className="text-right">—</TableCell></TableRow>)}
        {!shown.length && <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">{search ? "Tidak ada artikel sesuai pencarian." : "Belum ada artikel yang dipublikasikan."}</TableCell></TableRow>}
      </TableBody></Table></div><p className="mt-3 text-xs text-muted-foreground">— berarti data belum tersedia, bukan nol. Traffic mencakup /blog dan halaman artikel /blog/….</p>
    </section>
  </div>;
}