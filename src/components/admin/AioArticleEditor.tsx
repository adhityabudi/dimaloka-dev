import { useEffect, useRef, useState } from "react";
import { ImagePlus, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageInput, uploadMedia } from "./fields";
import { supabase } from "@/integrations/supabase/client";
import { streamImage } from "@/lib/stream-image";
import type { AioOutput } from "@/lib/aio";
import type { ArticleLink } from "@/lib/aio-article";

export function AioArticleEditor({ value, onChange, links, cover, onCover, onBusy, disabled }: {
  value: AioOutput<"article_generate">; onChange: (value: AioOutput<"article_generate">) => void;
  links: ArticleLink[]; cover: string; onCover: (url: string) => void; onBusy: (busy: boolean) => void; disabled: boolean;
}) {
  const started = useRef(false);
  const [busy, setBusy] = useState(false), [preview, setPreview] = useState(""), [final, setFinal] = useState(false), [error, setError] = useState("");
  const [url, setUrl] = useState(""), [label, setLabel] = useState("");
  const createCover = async () => {
    setBusy(true); onBusy(true); setError(""); setPreview(""); setFinal(false);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("Silakan masuk kembali");
      let image = "";
      await streamImage("/api/public/aio-image", { title: value.title }, (frame, complete) => { setPreview(frame); setFinal(complete); if (complete) image = frame; }, undefined, { Authorization: `Bearer ${data.session.access_token}` });
      if (!image) throw new Error("Gambar belum selesai dibuat");
      const blob = await (await fetch(image)).blob();
      onCover(await uploadMedia(new File([blob], `artikel-${Date.now()}.png`, { type: "image/png" })));
    } catch (e) { setPreview(""); setError(e instanceof Error ? e.message : "Gambar gagal dibuat"); }
    finally { setBusy(false); onBusy(false); }
  };
  useEffect(() => { if (!started.current) { started.current = true; void createCover(); } }, []);
  const set = (patch: Partial<AioOutput<"article_generate">>) => onChange({ ...value, ...patch });
  return <div className="space-y-4 border-t pt-5">
    <h3 className="font-bold text-navy">Edit sebelum posting</h3>
    <fieldset disabled={disabled} className="space-y-4">
      <label className="block space-y-2 text-sm font-semibold">Judul artikel<Input aria-label="Judul artikel hasil AI" value={value.title} maxLength={200} onChange={e => set({ title: e.target.value })} /></label>
      <div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-semibold">Gambar artikel</h4><Button type="button" variant="outline" size="sm" disabled={busy || disabled} onClick={createCover}>{busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}{busy ? "Membuat gambar…" : "Generate Gambar"}</Button></div>
        {preview && <img src={preview} alt={value.title} className={`aspect-[3/2] w-full max-w-xl rounded-lg object-cover transition-[filter] ${final ? "blur-0" : "blur-2xl"}`} />}
        <ImageInput value={cover} onChange={onCover} />
        <p className="text-xs text-muted-foreground">Gambar otomatis menggunakan kredit AI Lovable; artikel tetap menggunakan DollarDesa.</p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-semibold">Judul SEO<Input aria-label="Judul SEO artikel" value={value.meta_title} maxLength={60} onChange={e => set({ meta_title: e.target.value })} /></label><label className="space-y-2 text-sm font-semibold">Focus keyword<Input aria-label="Focus keyword hasil AI" value={value.focus_keyword} onChange={e => set({ focus_keyword: e.target.value })} /></label></div>
      <label className="block space-y-2 text-sm font-semibold">Deskripsi SEO<Textarea aria-label="Deskripsi SEO artikel" value={value.meta_description} maxLength={160} onChange={e => set({ meta_description: e.target.value })} /></label>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><Select value={url} disabled={disabled} onValueChange={v => { setUrl(v); setLabel(links.find(l => l.url === v)?.title ?? ""); }}><SelectTrigger aria-label="Tautan internal artikel"><SelectValue placeholder="Pilih produk atau layanan" /></SelectTrigger><SelectContent>{links.map(l => <SelectItem key={l.url} value={l.url}>{l.title}</SelectItem>)}</SelectContent></Select><Input aria-label="Teks tautan internal" value={label} onChange={e => setLabel(e.target.value)} /><Button variant="outline" disabled={!url || !label.trim() || disabled} onClick={() => set({ content_markdown: `${value.content_markdown}\n\n[${label.replace(/[\[\]]/g, "")}](${url})` })}><Link2 /> Tambahkan</Button></div>
      <label className="block space-y-2 text-sm font-semibold">Isi artikel<Textarea aria-label="Isi artikel hasil AI" rows={16} value={value.content_markdown} onChange={e => set({ content_markdown: e.target.value })} /></label>
      {value.faq.map((f, i) => <div key={i} className="grid gap-2 sm:grid-cols-2"><Input aria-label={`Pertanyaan FAQ ${i + 1}`} value={f.q} onChange={e => set({ faq: value.faq.map((x, n) => n === i ? { ...x, q: e.target.value } : x) })} /><Textarea aria-label={`Jawaban FAQ ${i + 1}`} value={f.a} onChange={e => set({ faq: value.faq.map((x, n) => n === i ? { ...x, a: e.target.value } : x) })} /></div>)}
      <label className="block space-y-2 text-sm font-semibold">Penutup<Textarea aria-label="Penutup artikel" value={value.cta} onChange={e => set({ cta: e.target.value })} /></label>
    </fieldset>
  </div>;
}