import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field, PageHeader, TagInput } from "@/components/admin/fields";
import { useSettings } from "@/components/admin/useSettings";
import { descOk, scoreArticle, titleOk } from "@/lib/seo";
import { pageMeta } from "@/lib/site";
import { AiSeoAssistant } from "@/components/admin/AiSeoAssistant";

export const Route = createFileRoute("/_authenticated/admin/seo")({ head: () => ({ meta: [...pageMeta({ title: "Optimasi SEO | Dimaloka", description: "Kelola SEO layanan, artikel, dan produk Dimaloka." }), { name: "robots", content: "noindex" }] }), component: Page });

const KEYS = ["global_seo_title", "global_seo_description", "global_keywords", "canonical_domain", "google_analytics_id", "search_console_meta", "robots_txt"];

function Ok({ ok }: { ok: boolean }) {
  return ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />;
}

function Page() {
  const { data, save } = useSettings();
  const [v, setV] = useState<Record<string, any>>({});
  const [onlyBad, setOnlyBad] = useState(false);
  const [stamp, setStamp] = useState(Date.now());
  useEffect(() => { if (data) setV(data); }, [data]);

  const { data: rows = [] } = useQuery({
    queryKey: ["adm-seo-overview"],
    queryFn: async () => {
      const [p, c, a] = await Promise.all([
        supabase.from("products").select("id,title,slug,seo_title,seo_description,keywords"),
        supabase.from("categories").select("id,name,slug,seo_title,seo_description,keywords"),
        supabase.from("articles").select("*"),
      ]);
      const base = (x: any) => {
        const t = titleOk(x.seo_title), d = descOk(x.seo_description), k = (x.keywords?.length ?? 0) > 0 || !!x.focus_keyword;
        return { t, d, k, score: Math.round(([t, d, k].filter(Boolean).length / 3) * 100) };
      };
      return [
        ...(p.data ?? []).map((x) => ({ type: "Produk", id: x.id, title: x.title, url: `/p/${x.slug}`, edit: "produk", ...base(x) })),
        ...(c.data ?? []).map((x) => ({ type: "Layanan", id: x.id, title: x.name, url: `/layanan/${x.slug}`, edit: "layanan", ...base(x) })),
        ...(a.data ?? []).map((x) => ({ type: "Artikel", id: x.id, title: x.title, url: `/blog/${x.slug}`, edit: "artikel", ...base(x), score: scoreArticle(x as any).score })),
      ];
    },
  });
  const shown = rows.filter((r) => !onlyBad || r.score < 100);

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader title="Optimasi SEO" desc="Pengaturan SEO global, sitemap, robots.txt, dan status SEO semua konten." />
      <AiSeoAssistant />
      <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between"><h2 className="font-extrabold text-navy">SEO Global</h2><Button onClick={() => save(Object.fromEntries(KEYS.map((k) => [k, v[k] ?? ""])))}>Simpan</Button></div>
        <Field label="Site title" hint={`${(v.global_seo_title ?? "").length}/60`}><Input value={v.global_seo_title ?? ""} onChange={(e) => setV({ ...v, global_seo_title: e.target.value })} /></Field>
        <Field label="Meta description global" hint={`${(v.global_seo_description ?? "").length}/140–160`}><Textarea value={v.global_seo_description ?? ""} onChange={(e) => setV({ ...v, global_seo_description: e.target.value })} /></Field>
        <Field label="Default keywords"><TagInput value={v.global_keywords ?? []} onChange={(k) => setV({ ...v, global_keywords: k })} /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Canonical domain" hint="mis. https://dimaloka.com"><Input value={v.canonical_domain ?? ""} onChange={(e) => setV({ ...v, canonical_domain: e.target.value })} /></Field>
          <Field label="Google Analytics ID" hint="G-XXXXXXX"><Input value={v.google_analytics_id ?? ""} onChange={(e) => setV({ ...v, google_analytics_id: e.target.value })} /></Field>
          <Field label="Verifikasi Search Console" hint="Isi content dari meta tag"><Input value={v.search_console_meta ?? ""} onChange={(e) => setV({ ...v, search_console_meta: e.target.value })} /></Field>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="font-extrabold text-navy">Sitemap</h2>
          <p className="text-sm text-muted-foreground">Sitemap dibuat otomatis dari halaman, layanan, produk, toko, dan artikel yang sudah dipublikasi. Kirim URL ini ke Google Search Console.</p>
          <div className="flex gap-2">
            <Button variant="outline" asChild><a href={`/sitemap.xml?t=${stamp}`} target="_blank" rel="noreferrer"><ExternalLink /> Buka sitemap.xml</a></Button>
            <Button variant="outline" onClick={() => setStamp(Date.now())}><RefreshCw /> Regenerate</Button>
          </div>
        </section>
        <section className="space-y-3 rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="font-extrabold text-navy">Robots.txt</h2>
          <Textarea rows={5} className="font-mono text-xs" value={v.robots_txt ?? ""} onChange={(e) => setV({ ...v, robots_txt: e.target.value })} />
          <p className="text-xs text-muted-foreground">Baris Sitemap ditambahkan otomatis. Klik Simpan di atas.</p>
        </section>
      </div>
      <section className="rounded-2xl border bg-card shadow-card">
        <div className="flex items-center justify-between p-5"><h2 className="font-extrabold text-navy">Status SEO Konten</h2><label className="flex items-center gap-2 text-sm"><Switch checked={onlyBad} onCheckedChange={setOnlyBad} /> Belum dioptimasi saja</label></div>
        <Table>
          <TableHeader><TableRow><TableHead>Tipe</TableHead><TableHead>Konten</TableHead><TableHead>Title</TableHead><TableHead>Desc</TableHead><TableHead>Keyword</TableHead><TableHead>Skor</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {shown.map((r) => (
              <TableRow key={r.type + r.id}>
                <TableCell className="text-xs font-semibold">{r.type}</TableCell>
                <TableCell><p className="font-semibold">{r.title}</p><p className="text-xs text-muted-foreground">{r.url}</p></TableCell>
                <TableCell><Ok ok={r.t} /></TableCell><TableCell><Ok ok={r.d} /></TableCell><TableCell><Ok ok={r.k} /></TableCell>
                <TableCell className={`font-bold ${r.score >= 80 ? "text-success" : "text-destructive"}`}>{r.score}</TableCell>
                <TableCell>
                  {r.edit === "produk" ? <Link to="/admin/produk/$id/edit" params={{ id: r.id }} className="text-sm text-primary-strong">Perbaiki</Link>
                    : r.edit === "artikel" ? <Link to="/admin/artikel/$id/edit" params={{ id: r.id }} className="text-sm text-primary-strong">Perbaiki</Link>
                    : <Link to="/admin/layanan" className="text-sm text-primary-strong">Perbaiki</Link>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
