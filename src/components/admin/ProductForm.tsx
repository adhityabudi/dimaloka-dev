import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, GalleryInput, ImageInput, ListInput, PageHeader, RichEditor, SeoFields, TagInput } from "./fields";
import { slugify } from "@/lib/format";
import { canPublish } from "@/lib/seo";

type Pkg = { name: string; price: number; items: string[] };

export function ProductForm({ initial }: { initial?: any }) {
  const navigate = useNavigate();
  const [v, setV] = useState<any>(
    initial ?? { title: "", slug: "", short_description: "", description: "", features: [], benefits: [], tags: [], cover_image: "", gallery: [], price: 0, packages: [], status: "draft", is_featured: false, whatsapp_cta: "", seo_title: "", seo_description: "", keywords: [], category_id: null, seller_id: null },
  );
  const set = (patch: any) => setV((x: any) => ({ ...x, ...patch }));
  const { data: opts } = useQuery({
    queryKey: ["adm-opts"],
    queryFn: async () => {
      const [c, s] = await Promise.all([supabase.from("categories").select("id,name").order("sort_order"), supabase.from("sellers").select("id,name").order("name")]);
      return { cats: c.data ?? [], sellers: s.data ?? [] };
    },
  });
  const pkgs: Pkg[] = v.packages ?? [];
  const setPkg = (i: number, patch: Partial<Pkg>) => set({ packages: pkgs.map((p, j) => (j === i ? { ...p, ...patch } : p)) });

  const save = async () => {
    if (!v.title.trim()) return toast.error("Judul wajib diisi");
    if (v.status === "published") {
      const c = canPublish(v, "product");
      if (!c.ok) return toast.error(`Tidak bisa publish. Lengkapi: ${c.missing.join(", ")}`);
    }
    const { id, created_at, updated_at, sellers, categories, ...row } = v;
    row.slug = slugify(row.slug || row.title);
    row.slug_path = `/p/${row.slug}`;
    row.features = (row.features as string[]).map((s) => s.trim()).filter(Boolean);
    row.benefits = (row.benefits as string[]).map((s) => s.trim()).filter(Boolean);
    row.packages = pkgs.map((p) => ({ ...p, items: p.items.map((s) => s.trim()).filter(Boolean) }));
    if (row.packages.length && !Number(row.price)) row.price = Math.min(...row.packages.map((p: Pkg) => Number(p.price)));
    const res = id ? await supabase.from("products").update(row).eq("id", id) : await supabase.from("products").insert(row);
    if (res.error) return toast.error(res.error.message.includes("duplicate") ? "Slug sudah dipakai" : res.error.message);
    toast.success("Produk disimpan");
    navigate({ to: "/admin/produk" });
  };

  return (
    <div className="max-w-5xl">
      <PageHeader title={initial ? "Edit Produk" : "Produk Baru"} action={<Button onClick={save}>Simpan</Button>} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5 rounded-2xl border bg-card p-6 shadow-card">
          <Field label="Judul"><Input value={v.title} onChange={(e) => set({ title: e.target.value, slug: initial ? v.slug : slugify(e.target.value) })} /></Field>
          <Field label="Slug" hint={`URL: /p/${v.slug}`}><Input value={v.slug} onChange={(e) => set({ slug: e.target.value })} /></Field>
          <Field label="Deskripsi singkat"><Textarea rows={2} value={v.short_description ?? ""} onChange={(e) => set({ short_description: e.target.value })} /></Field>
          <Field label="Deskripsi lengkap"><RichEditor value={v.description ?? ""} onChange={(h) => set({ description: h })} /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Fitur"><ListInput value={v.features} onChange={(f) => set({ features: f })} /></Field>
            <Field label="Manfaat"><ListInput value={v.benefits} onChange={(f) => set({ benefits: f })} /></Field>
          </div>
          <Field label="Tags"><TagInput value={v.tags} onChange={(t) => set({ tags: t })} /></Field>
          <Field label="Gambar cover"><ImageInput value={v.cover_image} onChange={(c) => set({ cover_image: c })} /></Field>
          <Field label="Galeri"><GalleryInput value={v.gallery ?? []} onChange={(g) => set({ gallery: g })} /></Field>

          <div>
            <div className="mb-2 flex items-center justify-between"><h3 className="font-extrabold text-navy">Paket harga</h3><Button size="sm" variant="outline" onClick={() => set({ packages: [...pkgs, { name: "", price: 0, items: [] }] })}><Plus /> Paket</Button></div>
            <div className="space-y-3">
              {pkgs.map((p, i) => (
                <div key={i} className="rounded-xl border p-4">
                  <div className="flex gap-2">
                    <Input placeholder="Nama paket (Basic)" value={p.name} onChange={(e) => setPkg(i, { name: e.target.value })} />
                    <Input type="number" placeholder="Harga" value={p.price} onChange={(e) => setPkg(i, { price: Number(e.target.value) })} className="w-40" />
                    <Button size="icon" variant="ghost" onClick={() => set({ packages: pkgs.filter((_, j) => j !== i) })} aria-label="Hapus paket"><Trash2 /></Button>
                  </div>
                  <Textarea className="mt-2" rows={3} placeholder="Isi paket, satu per baris" value={p.items.join("\n")} onChange={(e) => setPkg(i, { items: e.target.value.split("\n") })} />
                </div>
              ))}
            </div>
          </div>
          <SeoFields v={v} set={set} slugPath={`/p/${v.slug}`} />
        </div>
        <div className="space-y-5">
          <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-card">
            <Field label="Status">
              <Select value={v.status} onValueChange={(s) => set({ status: s })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
              </Select>
            </Field>
            <label className="flex items-center gap-2 text-sm font-semibold"><Switch checked={v.is_featured} onCheckedChange={(f) => set({ is_featured: f })} /> Featured (HOT)</label>
            <Field label="Kategori">
              <Select value={v.category_id ?? ""} onValueChange={(c) => set({ category_id: c })}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>{opts?.cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Brand / Seller">
              <Select value={v.seller_id ?? ""} onValueChange={(c) => set({ seller_id: c })}>
                <SelectTrigger><SelectValue placeholder="Pilih brand" /></SelectTrigger>
                <SelectContent>{opts?.sellers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Harga mulai" hint="Kosongkan (0) untuk otomatis dari paket termurah"><Input type="number" value={v.price} onChange={(e) => set({ price: Number(e.target.value) })} /></Field>
            <Field label="WhatsApp CTA" hint="Kosongkan untuk pakai WA brand"><Input value={v.whatsapp_cta ?? ""} onChange={(e) => set({ whatsapp_cta: e.target.value })} /></Field>
          </div>
          <Button onClick={save} className="w-full">Simpan</Button>
        </div>
      </div>
    </div>
  );
}
