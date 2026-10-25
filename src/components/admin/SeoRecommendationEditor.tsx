import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { AiSeoResult } from "@/lib/ai-seo";
import { seoDraftSchema, type SeoDraft } from "@/lib/ai-seo-application";

export function SeoRecommendationEditor({ result, onApply, busy, disabled }: { result: AiSeoResult; onApply: (draft: SeoDraft, includeContent: boolean) => void; busy?: boolean; disabled?: boolean }) {
  const [draft, setDraft] = useState<SeoDraft>({ seo_title: result.titles[0] ?? "", seo_description: result.descriptions[0] ?? "", content: result.revised_content });
  const [includeContent, setIncludeContent] = useState(false);
  const valid = seoDraftSchema.safeParse(draft).success;
  return <div className="space-y-5 border-t pt-5">
    <h4 className="font-bold text-navy">SEO yang akan diterapkan</h4>
    <div className="space-y-2"><label htmlFor="ai-draft-title" className="text-sm font-semibold">Judul SEO</label><Input id="ai-draft-title" aria-label="Judul SEO pilihan" value={draft.seo_title} onChange={(e) => setDraft({ ...draft, seo_title: e.target.value })} /><span className="text-xs text-muted-foreground">{draft.seo_title.length} / 60 karakter</span><div className="flex flex-wrap gap-2">{result.titles.map((title, i) => <Button key={i} size="sm" variant="outline" onClick={() => setDraft({ ...draft, seo_title: title })}>Pilihan {i + 1}</Button>)}</div></div>
    <div className="space-y-2"><label htmlFor="ai-draft-desc" className="text-sm font-semibold">Deskripsi meta</label><Textarea id="ai-draft-desc" aria-label="Deskripsi meta pilihan" value={draft.seo_description} onChange={(e) => setDraft({ ...draft, seo_description: e.target.value })} /><span className="text-xs text-muted-foreground">{draft.seo_description.length} / 140–160 karakter</span><div className="flex flex-wrap gap-2">{result.descriptions.map((desc, i) => <Button key={i} size="sm" variant="outline" onClick={() => setDraft({ ...draft, seo_description: desc })}>Deskripsi {i + 1}</Button>)}</div></div>
    <div className="space-y-2"><label htmlFor="ai-draft-content" className="text-sm font-semibold">Konten revisi</label><Textarea id="ai-draft-content" aria-label="Konten revisi pilihan" rows={10} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} /></div>
    <label className="flex items-center gap-2 text-sm"><Checkbox checked={includeContent} onCheckedChange={(v) => setIncludeContent(v === true)} /> Terapkan juga konten revisi</label>
    <Button type="button" disabled={disabled || busy || !valid} onClick={() => onApply(draft, includeContent)}>{busy ? <Loader2 className="animate-spin" /> : <Check />} Terapkan SEO</Button>
  </div>;
}