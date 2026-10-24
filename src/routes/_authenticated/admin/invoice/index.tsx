import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Copy, ExternalLink, Plus, Send, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/fields";
import { rupiah, tanggal } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/invoice/")({ component: Page });

const label: Record<string, string> = { draft: "Draft", sent: "Terkirim", paid: "Lunas", cancelled: "Batal" };

function Page() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const { data = [] } = useQuery({ queryKey: ["adm-invoices"], queryFn: async () => (await supabase.from("invoices").select("*").order("created_at", { ascending: false })).data ?? [] });
  const rows = data.filter((i) => filter === "all" || i.status === filter);
  const setStatus = async (id: string, status: "draft" | "sent" | "paid" | "cancelled") => {
    const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Status: ${label[status]}`);
    qc.invalidateQueries({ queryKey: ["adm-invoices"] });
  };
  const copy = async (inv: any) => {
    if (inv.status === "draft") await setStatus(inv.id, "sent");
    await navigator.clipboard.writeText(`${window.location.origin}/invoice/${inv.public_token}`);
    toast.success("Link invoice disalin");
  };
  return (
    <div>
      <PageHeader title="Invoice" action={<Button asChild><Link to="/admin/invoice/new"><Plus /> Invoice Baru</Link></Button>} />
      <div className="mb-4 flex flex-wrap gap-2">{["all", "draft", "sent", "paid", "cancelled"].map((s) => <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>{s === "all" ? "Semua" : label[s]}</Button>)}</div>
      <div className="rounded-2xl border bg-card shadow-card">
        <Table>
          <TableHeader><TableRow><TableHead>Nomor</TableHead><TableHead>Buyer</TableHead><TableHead>Jumlah</TableHead><TableHead>Status</TableHead><TableHead>Tanggal</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {rows.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-mono font-semibold">{i.invoice_number}</TableCell>
                <TableCell>{i.buyer_name}</TableCell>
                <TableCell>{rupiah(i.amount)}</TableCell>
                <TableCell><Badge variant={i.status === "paid" ? "default" : "secondary"}>{label[i.status]}</Badge></TableCell>
                <TableCell>{tanggal(i.created_at)}</TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Button size="sm" variant="ghost" onClick={() => copy(i)}><Copy /> Salin link</Button>
                  {i.status === "draft" && <Button size="sm" variant="ghost" onClick={() => setStatus(i.id, "sent")}><Send /> Kirim</Button>}
                  {i.status !== "paid" && i.status !== "cancelled" && <Button size="sm" variant="ghost" onClick={() => setStatus(i.id, "paid")}><CheckCircle2 /> Tandai dibayar</Button>}
                  {i.status !== "cancelled" && i.status !== "paid" && <Button size="icon" variant="ghost" onClick={() => setStatus(i.id, "cancelled")} aria-label="Batalkan"><XCircle /></Button>}
                  {i.status !== "draft" && <Button size="icon" variant="ghost" asChild><a href={`/invoice/${i.public_token}`} target="_blank" rel="noreferrer" aria-label="Lihat / PDF"><ExternalLink /></a></Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Belum ada invoice.</p>}
      </div>
    </div>
  );
}
