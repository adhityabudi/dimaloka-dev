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

export const Route = createFileRoute("/_authenticated/admin/artikel/")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["adm-articles"], queryFn: async () => (await supabase.from("articles").select("*, categories(name)").order("created_at", { ascending: false })).data ?? [] });
  const del = async (id: string) => {
    if (!confirm("Hapus artikel?")) return;
    await supabase.from("articles").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["adm-articles"] });
  };
  return (
    <div>
      <PageHeader title="Artikel Blog" action={<Button asChild><Link to="/admin/artikel/new"><Plus /> Tulis Artikel</Link></Button>} />
      <div className="rounded-2xl border bg-card shadow-card">
        <Table>
          <TableHeader><TableRow><TableHead>Artikel</TableHead><TableHead>Kategori</TableHead><TableHead>Status</TableHead><TableHead>Publish</TableHead><TableHead>SEO</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
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
