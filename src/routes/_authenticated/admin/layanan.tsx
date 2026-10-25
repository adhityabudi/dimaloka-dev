import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field, PageHeader, SeoFields } from "@/components/admin/fields";
import { CategoryIcon } from "@/components/site/CategoryIcon";
import { slugify } from "@/lib/format";
import { canPublish } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/admin/layanan")({ component: Page });

const empty = { name: "", slug: "", icon: "Sparkles", description: "", is_active: true, seo_title: "", seo_description: "", keywords: [] as string[], sort_order: 0 };

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["adm-cats"],
    queryFn: async () => {
      const [{ data: c }, { data: p }] = await Promise.all([supabase.from("categories").select("*").order("sort_order"), supabase.from("products").select("category_id")]);
      return (c ?? []).map((x) => ({ ...x, count: (p ?? []).filter((y) => y.category_id === x.id).length }));
    },
  });
  const [edit, setEdit] = useState<any>(null);
  const set = (patch: any) => setEdit((e: any) => ({ ...e, ...patch }));

  const save = async () => {
    const { count, id, created_at, ...row } = edit;
    if (row.is_active) {
      const c = canPublish(row, "category");
      if (!c.ok) return toast.error(`Lengkapi SEO dulu: ${c.missing.join(", ")}`);
    }
    row.slug = slugify(row.slug || row.name);
    const res = id ? await supabase.from("categories").update(row).eq("id", id) : await supabase.from("categories").insert({ ...row, sort_order: data.length + 1 });
    if (res.error) return toast.error(res.error.message);
    toast.success("Layanan disimpan");
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["adm-cats"] });
  };
  const move = async (i: number, dir: -1 | 1) => {
    const a = data[i], b = data[i + dir];
    if (!b) return;
    await Promise.all([supabase.from("categories").update({ sort_order: b.sort_order }).eq("id", a.id), supabase.from("categories").update({ sort_order: a.sort_order }).eq("id", b.id)]);
    qc.invalidateQueries({ queryKey: ["adm-cats"] });
  };
  const del = async (id: string) => {
    if (!confirm("Hapus layanan ini?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["adm-cats"] });
  };

  return (
    <div>
      <PageHeader title="Layanan" desc="Kelola layanan dan urutannya." action={<Button onClick={() => setEdit({ ...empty })}><Plus /> Tambah</Button>} />
      <div className="rounded-2xl border bg-card shadow-card">
        <Table>
          <TableHeader><TableRow><TableHead>Urutan</TableHead><TableHead>Layanan</TableHead><TableHead>Produk</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {data.map((c, i) => (
              <TableRow key={c.id}>
                <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Naik"><ArrowUp /></Button><Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === data.length - 1} aria-label="Turun"><ArrowDown /></Button></div></TableCell>
                <TableCell><div className="flex items-center gap-2 font-semibold"><CategoryIcon icon={c.icon} className="h-4 w-4 text-primary" /> {c.name}</div><p className="text-xs text-muted-foreground">/{c.slug}</p></TableCell>
                <TableCell>{c.count}</TableCell>
                <TableCell>{c.is_active ? <span className="font-semibold text-success">Aktif</span> : <span className="text-muted-foreground">Nonaktif</span>}</TableCell>
                <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => setEdit(c)} aria-label="Edit"><Pencil /></Button><Button size="icon" variant="ghost" onClick={() => del(c.id)} aria-label="Hapus"><Trash2 /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{edit?.id ? "Edit" : "Tambah"} Layanan</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama"><Input value={edit.name} onChange={(e) => set({ name: e.target.value, slug: edit.id ? edit.slug : slugify(e.target.value) })} /></Field>
                <Field label="Slug"><Input value={edit.slug} onChange={(e) => set({ slug: e.target.value })} /></Field>
              </div>
              <Field label="Ikon" hint="Nama ikon lucide (mis. Globe, Palette) atau emoji"><Input value={edit.icon ?? ""} onChange={(e) => set({ icon: e.target.value })} /></Field>
              <Field label="Deskripsi"><Textarea value={edit.description ?? ""} onChange={(e) => set({ description: e.target.value })} /></Field>
              <label className="flex items-center gap-2 text-sm font-semibold"><Switch checked={edit.is_active} onCheckedChange={(v) => set({ is_active: v })} /> Aktif (tampil publik)</label>
              <SeoFields v={edit} set={set} slugPath={`/layanan/${edit.slug}`} />
              <Button onClick={save} className="w-full">Simpan</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
