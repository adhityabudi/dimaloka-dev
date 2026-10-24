import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, ImageInput, PageHeader } from "@/components/admin/fields";

export const Route = createFileRoute("/_authenticated/admin/testimoni")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["adm-testi"], queryFn: async () => (await supabase.from("testimonials").select("*").order("sort_order")).data ?? [] });
  const [edit, setEdit] = useState<any>(null);
  const set = (patch: any) => setEdit((e: any) => ({ ...e, ...patch }));
  const save = async () => {
    const { id, ...row } = edit;
    const res = id ? await supabase.from("testimonials").update(row).eq("id", id) : await supabase.from("testimonials").insert(row);
    if (res.error) return toast.error(res.error.message);
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["adm-testi"] });
  };
  const del = async (id: string) => {
    if (!confirm("Hapus testimoni?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["adm-testi"] });
  };
  return (
    <div>
      <PageHeader title="Testimoni" action={<Button onClick={() => setEdit({ name: "", title: "", content: "", rating: 5, photo_url: "", is_active: true, sort_order: data.length + 1 })}><Plus /> Tambah</Button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((t) => (
          <div key={t.id} className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              {t.photo_url && <img src={t.photo_url} alt="" className="h-10 w-10 rounded-full" />}
              <div className="flex-1"><p className="font-bold">{t.name}</p><p className="text-xs text-muted-foreground">{t.title}</p></div>
              <span className="text-xs">#{t.sort_order}</span>
            </div>
            <div className="mt-2 flex">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}</div>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{t.content}</p>
            <div className="mt-3 flex items-center justify-between"><span className="text-xs">{t.is_active ? "Aktif" : "Nonaktif"}</span><div><Button size="icon" variant="ghost" onClick={() => setEdit(t)} aria-label="Edit"><Pencil /></Button><Button size="icon" variant="ghost" onClick={() => del(t.id)} aria-label="Hapus"><Trash2 /></Button></div></div>
          </div>
        ))}
      </div>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Testimoni</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama"><Input value={edit.name} onChange={(e) => set({ name: e.target.value })} /></Field>
                <Field label="Jabatan / komunitas"><Input value={edit.title ?? ""} onChange={(e) => set({ title: e.target.value })} /></Field>
                <Field label="Rating (1–5)"><Input type="number" min={1} max={5} value={edit.rating} onChange={(e) => set({ rating: Math.min(5, Math.max(1, Number(e.target.value))) })} /></Field>
                <Field label="Urutan"><Input type="number" value={edit.sort_order} onChange={(e) => set({ sort_order: Number(e.target.value) })} /></Field>
              </div>
              <Field label="Foto"><ImageInput value={edit.photo_url} onChange={(v) => set({ photo_url: v })} /></Field>
              <Field label="Isi testimoni"><Textarea rows={4} value={edit.content} onChange={(e) => set({ content: e.target.value })} /></Field>
              <label className="flex items-center gap-2 text-sm font-semibold"><Switch checked={edit.is_active} onCheckedChange={(v) => set({ is_active: v })} /> Aktif</label>
              <Button onClick={save} className="w-full">Simpan</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
