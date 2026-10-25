import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Field, ImageInput, PageHeader, RichEditor, SeoFields } from "./fields";
import { slugify } from "@/lib/format";
import { canPublish, scoreArticle } from "@/lib/seo";
import { ArticleAiSeo } from "./ArticleAiSeo";

export function ArticleForm({ initial }: { initial?: any }) {
  const navigate = useNavigate();
  const [v, setV] = useState<any>(initial ?? { title: "", slug: "", excerpt: "", content: "", cover_image: "", og_image: "", author: "Tim Dimaloka", status: "draft", seo_title: "", seo_description: "", focus_keyword: "", keywords: [], category_id: null, published_at: null });
  const set = (patch: any) => setV((x: any) => ({ ...x, ...patch }));
  const { data: cats = [] } = useQuery({ queryKey: ["adm-cat-opts"], queryFn: async () => (await supabase.from("categories").select("id,name").order("sort_order")).data ?? [] });
  const seo = scoreArticle(v);

  const save = async () => {
    if (!v.title.trim()) return toast.error("Judul wajib diisi");
    if (v.status === "published") {
      const c = canPublish(v, "article");
      if (!c.ok) return toast.error(`Tidak bisa publish. Lengkapi: ${c.missing.join(", ")}`);
    }
    const { id, created_at, updated_at, categories, ...row } = v;
    row.slug = slugify(row.slug || row.title);
    if (row.published_at === "") row.published_at = null;
    const res = id ? await supabase.from("articles").update(row).eq("id", id) : await supabase.from("articles").insert(row);
    if (res.error) return toast.error(res.error.message.includes("duplicate") ? "Slug sudah dipakai" : res.error.message);
    toast.success("Artikel disimpan");
    navigate({ to: "/admin/artikel" });
  };

  return (
    <div className="max-w-6xl">
      <PageHeader title={initial ? "Edit Artikel" : "Artikel Baru"} action={<Button onClick={save}>Simpan</Button>} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5 rounded-2xl border bg-card p-6 shadow-card">
          <Field label="Judul (H1)"><Input value={v.title} onChange={(e) => set({ title: e.target.value, slug: initial ? v.slug : slugify(e.target.value) })} /></Field>
          <Field label="Slug" hint={`URL: /blog/${v.slug}`}><Input value={v.slug} onChange={(e) => set({ slug: e.target.value })} /></Field>
          <Field label="Ringkasan"><Textarea rows={2} value={v.excerpt ?? ""} onChange={(e) => set({ excerpt: e.target.value })} /></Field>
          <Field label="Konten" hint="Gunakan H2/H3 untuk subjudul. Judul artikel otomatis menjadi H1."><RichEditor value={v.content ?? ""} onChange={(h) => set({ content: h })} /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Gambar cover"><ImageInput value={v.cover_image} onChange={(c) => set({ cover_image: c })} /></Field>
            <Field label="OG image (opsional)"><ImageInput value={v.og_image} onChange={(c) => set({ og_image: c })} /></Field>
          </div>
          <SeoFields v={v} set={set} slugPath={`/blog/${v.slug}`} keywordMode="both" />
          <ArticleAiSeo value={v} onChange={set} />
        </div>
        <div className="space-y-5">
          <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-card">
            <Field label="Status"><Select value={v.status} onValueChange={(s) => set({ status: s })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select></Field>
            <Field label="Jadwal publish" hint="Kosongkan untuk terbit sekarang"><Input type="datetime-local" value={v.published_at ? String(v.published_at).slice(0, 16) : ""} onChange={(e) => set({ published_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /></Field>
            <Field label="Layanan"><Select value={v.category_id ?? ""} onValueChange={(c) => set({ category_id: c })}><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger><SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Penulis"><Input value={v.author ?? ""} onChange={(e) => set({ author: e.target.value })} /></Field>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between"><h3 className="font-extrabold text-navy">Skor SEO</h3><span className={`text-2xl font-extrabold ${seo.score >= 80 ? "text-success" : seo.score >= 50 ? "text-primary-strong" : "text-destructive"}`}>{seo.score}</span></div>
            <Progress value={seo.score} className="mt-2" />
            <ul className="mt-4 space-y-2">
              {seo.checks.map((c) => (
                <li key={c.label} className="flex items-start gap-2 text-sm">{c.ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <XCircle className="h-4 w-4 shrink-0 text-destructive" />}<span className={c.ok ? "" : "text-muted-foreground"}>{c.label}</span></li>
              ))}
            </ul>
          </div>
          <Button onClick={save} className="w-full">Simpan</Button>
        </div>
      </div>
    </div>
  );
}
