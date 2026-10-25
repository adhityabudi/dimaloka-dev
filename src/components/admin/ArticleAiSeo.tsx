import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateAiSeo } from "@/lib/ai-seo.functions";
import type { AiSeoResult } from "@/lib/ai-seo";
import { seoApplication } from "@/lib/ai-seo-application";
import { stripHtml } from "@/lib/format";
import { SeoRecommendationEditor } from "./SeoRecommendationEditor";

export function ArticleAiSeo({ value, onChange }: { value: { title: string; content: string; focus_keyword: string; keywords?: string[] }; onChange: (patch: Record<string, unknown>) => void }) {
  const generate = useServerFn(generateAiSeo);
  const [result, setResult] = useState<AiSeoResult | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [requestKeyword, setRequestKeyword] = useState("");
  return <section className="space-y-4 border-t pt-5">
    <h3 className="font-extrabold text-navy">Rekomendasi SEO AI</h3>
    <label className="block space-y-2 text-sm font-semibold">Kata kunci target artikel<Input aria-label="Kata kunci target artikel" value={value.focus_keyword ?? ""} maxLength={500} onChange={(e) => { onChange({ focus_keyword: e.target.value }); setResult(null); }} /></label>
    <Button disabled={busy || !(value.focus_keyword ?? "").trim()} onClick={async () => {
      const keyword = value.focus_keyword.trim();
      setBusy(true); setError(""); setResult(null);
      try {
        const content = stripHtml(value.content);
        const response = await generate({ data: { title: value.title || keyword, keywords: [keyword, ...(value.keywords ?? [])].join(", ").slice(0, 500), content: content.length >= 30 ? content : `Susun draf artikel informatif Dimaloka berdasarkan kata kunci target: ${keyword}. Topik: ${value.title || keyword}. Jangan mengarang fakta, harga, statistik, testimoni atau klaim perusahaan. Gunakan subjudul markdown ##, pembuka dan penutup alami. Artikel minimal 300 kata bila relevan.` } });
        setRequestKeyword(keyword); setResult(response.result);
      } catch (e) { setError(e instanceof Error ? e.message : "Rekomendasi gagal dibuat"); }
      finally { setBusy(false); }
    }}>{busy ? <Loader2 className="animate-spin" /> : <Sparkles />}{busy ? "Menyusun rekomendasi…" : "Rekomendasi SEO dari AI"}</Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {result && <><ol className="space-y-3">{result.improvements.map((item, i) => <li key={i} className="text-sm"><p className="font-semibold">{item.issue}</p><p className="text-muted-foreground">{item.suggestion}</p></li>)}</ol><SeoRecommendationEditor result={result} disabled={busy || requestKeyword !== value.focus_keyword.trim()} onApply={(draft, includeContent) => {
      onChange(seoApplication(draft, "article", includeContent));
      toast.success("SEO diterapkan ke form artikel; klik Simpan setelah diperiksa");
    }} /></>}
  </section>;
}