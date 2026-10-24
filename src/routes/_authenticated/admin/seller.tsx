import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field, ImageInput, PageHeader } from "@/components/admin/fields";
import { slugify } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/seller")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["adm-sellers"],
    queryFn: async () => {
      const [{ data: s }, { data: p }] = await Promise.all([supabase.from("sellers").select("*").order("name"), supabase.from("products").select("seller_id")]);
      return (s ?? []).map((x) => ({ ...x, count: (p ?? []).filter((y) => y.seller_id === x.id).length }));
    },
  });
  const [edit, setEdit] = useState<any>(null);
  const set = (patch: any) => setEdit((e: any) => ({ ...e, ...patch }));
  const save = async () => {
    const { count, id, created_at, ...row } = edit;
    row.slug = slugify(row.slug || row.name);
    const res = id ? await supabase.from("sellers").update(row).eq("id", id) : await supabase.from("sellers").insert(row);
    if (res.error) return toast.error(res.error.message);
    toast.success("Brand disimpan");
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["adm-sellers"] });
  };
  const del = async (id: string) => {
    if (!confirm("Hapus brand ini?")) return;
    const { error } = await supabase.from("sellers").delete().eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["adm-sellers"] });
  };
  return (
    <div>
      <PageHeader title="Brand / Seller" desc="Nama toko yang tampil di listing produk." action={<Button onClick={() => setEdit({ name: "", slug: "", whatsapp: "", description: "", logo_url: "", is_active: true })}><Plus /> Tambah</Button>} />
      <div className="rounded-2xl border bg-card shadow-card">
        <Table>
          <TableHeader><TableRow><TableHead>Brand</TableHead><TableHead>WhatsApp</TableHead><TableHead>Produk</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {data.map((s) => (
              <TableRow key={s.id}>
                <TableCell><div className="flex items-center gap-3">{s.logo_url && <img src={s.logo_url} alt="" className="h-9 w-9 rounded-lg object-cover" />}<div><p className="font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">/store/{s.slug}</p></div></div></TableCell>
                <TableCell>{s.whatsapp}</TableCell>
                <TableCell>{s.count}</TableCell>
                <TableCell>{s.is_active ? <span className="font-semibold text-success">Aktif</span> : "Nonaktif"}</TableCell>
                <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => setEdit(s)} aria-label="Edit"><Pencil /></Button><Button size="icon" variant="ghost" onClick={() => del(s.id)} aria-label="Hapus"><Trash2 /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{edit?.id ? "Edit" : "Tambah"} Brand</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-4">
              <Field label="Nama"><Input value={edit.name} onChange={(e) => set({ name: e.target.value, slug: edit.id ? edit.slug : slugify(e.target.value) })} /></Field>
              <Field label="Slug"><Input value={edit.slug} onChange={(e) => set({ slug: e.target.value })} /></Field>
              <Field label="Nomor WhatsApp" hint="Format 628xxx"><Input value={edit.whatsapp ?? ""} onChange={(e) => set({ whatsapp: e.target.value })} /></Field>
              <Field label="Logo"><ImageInput value={edit.logo_url} onChange={(v) => set({ logo_url: v })} /></Field>
              <Field label="Deskripsi"><Textarea value={edit.description ?? ""} onChange={(e) => set({ description: e.target.value })} /></Field>
              <label className="flex items-center gap-2 text-sm font-semibold"><Switch checked={edit.is_active} onCheckedChange={(v) => set({ is_active: v })} /> Aktif</label>
              <Button onClick={save} className="w-full">Simpan</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
