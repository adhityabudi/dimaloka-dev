import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { pageMeta } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/fields";
import { rupiah } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/produk/")({ head: () => ({ meta: [...pageMeta({ title: "Kelola Produk | Dimaloka", description: "Kelola produk, harga, dan status aktif layanan Dimaloka." }), { name: "robots", content: "noindex" }] }), component: Page });

function Page() {
  const qc = useQueryClient();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [active, setActive] = useState("all");
  const toggle = async (id: string, enabled: boolean) => {
    setBusy(id);
    try {
      const { error } = await supabase.from("products").update({ is_active: enabled }).eq("id", id);
      if (error) throw error;
      await qc.invalidateQueries(); await router.invalidate();
      toast.success(enabled ? "Produk diaktifkan" : "Produk dinonaktifkan; data dan pesanan tetap tersimpan");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Status gagal disimpan"); } finally { setBusy(null); }
  };
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [cat, setCat] = useState("all");
  const { data = [] } = useQuery({ queryKey: ["adm-products"], queryFn: async () => (await supabase.from("products").select("id,title,slug,cover_image,price,status,is_active,is_featured,category_id,categories(name,is_active),sellers(name)").order("created_at", { ascending: false })).data ?? [] });
  const { data: cats = [] } = useQuery({ queryKey: ["adm-cat-opts"], queryFn: async () => (await supabase.from("categories").select("id,name").order("sort_order")).data ?? [] });
  const rows = data.filter((p) => (active === "all" || p.is_active === (active === "active")) && (status === "all" || p.status === status) && (cat === "all" || p.category_id === cat) && p.title.toLowerCase().includes(q.toLowerCase()));
  const del = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["adm-products"] });
  };
  return (
    <div>
      <PageHeader title="Produk / Layanan" action={<Button asChild><Link to="/admin/produk/new"><Plus /> Produk Baru</Link></Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Cari produk…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs bg-card" />
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-40 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Semua status</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select>
        <Select value={active} onValueChange={setActive}><SelectTrigger className="w-40 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Aktif & nonaktif</SelectItem><SelectItem value="active">Aktif</SelectItem><SelectItem value="inactive">Nonaktif</SelectItem></SelectContent></Select>
        <Select value={cat} onValueChange={setCat}><SelectTrigger className="w-48 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Semua layanan</SelectItem>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="rounded-2xl border bg-card shadow-card">
        <Table>
          <TableHeader><TableRow><TableHead>Produk</TableHead><TableHead>Layanan</TableHead><TableHead>Brand</TableHead><TableHead>Harga</TableHead><TableHead>Status</TableHead><TableHead>Aktif</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {rows.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell><div className="flex items-center gap-3">{p.cover_image && <img src={p.cover_image} alt="" className="h-10 w-14 rounded object-cover" />}<div><p className="font-semibold">{p.title}</p>{p.is_featured && <span className="text-[10px] font-bold text-coral">HOT</span>}</div></div></TableCell>
                <TableCell>{p.categories?.name}</TableCell>
                <TableCell>{p.sellers?.name}</TableCell>
                <TableCell>{p.price > 0 ? rupiah(p.price) : "Belum ditetapkan"}</TableCell>
                <TableCell><Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                <TableCell><label className="flex items-center gap-2"><Switch aria-label={`Aktifkan ${p.title}`} checked={p.is_active} disabled={busy !== null} onCheckedChange={enabled => toggle(p.id, enabled)} /><span className="text-xs">{p.is_active ? "Aktif" : "Nonaktif"}</span></label>{p.is_active && p.categories?.is_active === false && <p className="mt-1 text-xs text-muted-foreground">Layanan induk nonaktif</p>}</TableCell>
                <TableCell className="text-right whitespace-nowrap"><Button size="icon" variant="ghost" asChild><Link to="/admin/produk/$id/edit" params={{ id: p.id }} aria-label="Edit"><Pencil /></Link></Button><Button size="icon" variant="ghost" onClick={() => del(p.id)} aria-label="Hapus"><Trash2 /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Tidak ada produk.</p>}
      </div>
    </div>
  );
}
