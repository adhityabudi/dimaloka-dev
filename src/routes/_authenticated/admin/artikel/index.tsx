import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/fields";
import { tanggal } from "@/lib/format";
import { scoreArticle } from "@/lib/seo";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/artikel/")({
  head: () => ({ meta: [{ title: "Artikel Blog | Dimaloka Admin" }, { name: "description", content: "Kelola artikel, publikasi, dan optimasi SEO blog Dimaloka." }, { property: "og:title", content: "Artikel Blog | Dimaloka Admin" }, { property: "og:description", content: "Kelola artikel dan optimasi SEO blog Dimaloka." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const { data = [], isPending, isError, refetch } = useQuery({ queryKey: ["adm-articles"], queryFn: async () => {
    const { data, error } = await supabase.from("articles").select("*, categories(name)").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } });
  const del = async (id: string) => {
    if (!confirm("Hapus artikel?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return toast.error("Artikel gagal dihapus. Silakan coba lagi.");
    await qc.invalidateQueries({ queryKey: ["adm-articles"] });
  };
  return (
    <div>
      <PageHeader title="Artikel Blog" action={<Button asChild><Link to="/admin/artikel/new"><Plus /> Tulis Artikel</Link></Button>} />
      <div className="rounded-2xl border bg-card shadow-card">
        <Table>
          <TableHeader><TableRow><TableHead>Artikel</TableHead><TableHead>Layanan</TableHead><TableHead>Status</TableHead><TableHead>Publish</TableHead><TableHead>SEO</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {isPending && <TableRow><TableCell colSpan={6} role="status">Memuat artikel…</TableCell></TableRow>}
            {isError && <TableRow><TableCell colSpan={6}><div role="alert" className="flex flex-wrap items-center gap-3"><span>Artikel belum dapat dimuat.</span><Button variant="outline" onClick={() => refetch()}>Coba lagi</Button></div></TableCell></TableRow>}
            {!isPending && !isError && data.length === 0 && <TableRow><TableCell colSpan={6}>Belum ada artikel.</TableCell></TableRow>}
            {data.map((a: any) => (
              <TableRow key={a.id}>
                <TableCell><div className="flex items-center gap-3">{a.cover_image && <img src={a.cover_image} alt="" className="h-10 w-14 rounded object-cover" />}<span className="font-semibold">{a.title}</span></div></TableCell>
                <TableCell>{a.categories?.name}</TableCell>
                <TableCell><Badge variant={a.status === "published" ? "default" : "secondary"}>{a.status}</Badge></TableCell>
                <TableCell>{tanggal(a.published_at)}</TableCell>
                <TableCell className="font-bold">{scoreArticle(a).score}</TableCell>
                <TableCell className="text-right whitespace-nowrap"><Button size="icon" variant="ghost" asChild><Link to="/admin/artikel/$id/edit" params={{ id: a.id }} aria-label="Edit"><Pencil /></Link></Button><Button size="icon" variant="ghost" onClick={() => del(a.id)} aria-label="Hapus"><Trash2 /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
