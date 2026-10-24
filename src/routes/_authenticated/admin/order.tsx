import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field, PageHeader } from "@/components/admin/fields";
import { rupiah, tanggal } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/order")({ component: Page });

export const ORDER_STATUS = [
  { v: "new", l: "Baru" },
  { v: "contacted", l: "Dihubungi" },
  { v: "in_progress", l: "Dikerjakan" },
  { v: "completed", l: "Selesai" },
  { v: "cancelled", l: "Dibatalkan" },
] as const;

function Page() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [edit, setEdit] = useState<any>(null);
  const [view, setView] = useState<any>(null);
  const { data = [] } = useQuery({ queryKey: ["adm-orders"], queryFn: async () => (await supabase.from("orders").select("*, products(title), sellers(name)").order("created_at", { ascending: false })).data ?? [] });
  const { data: products = [] } = useQuery({ queryKey: ["adm-prod-opts"], queryFn: async () => (await supabase.from("products").select("id,title,seller_id,price,packages").order("title")).data ?? [] });
  const set = (p: any) => setEdit((e: any) => ({ ...e, ...p }));
  const rows = data.filter((o) => filter === "all" || o.status === filter);
  const prod: any = products.find((p) => p.id === edit?.product_id);

  const updateStatus = async (id: string, status: any) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["adm-orders"] });
  };
  const save = async () => {
    if (!edit.product_id || !edit.buyer_name) return toast.error("Produk dan nama buyer wajib");
    let buyer_id = null;
    if (edit.buyer_email) {
      const { data: prof } = await supabase.from("profiles").select("id").eq("email", edit.buyer_email.trim()).maybeSingle();
      buyer_id = prof?.id ?? null;
    }
    const { error } = await supabase.from("orders").insert({ ...edit, buyer_id, seller_id: prod?.seller_id ?? null });
    if (error) return toast.error(error.message);
    toast.success("Order dicatat");
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["adm-orders"] });
  };

  return (
    <div>
      <PageHeader title="Order" desc="Catat order dari chat/WhatsApp dan pantau statusnya." action={<Button onClick={() => setEdit({ product_id: "", package_name: "", amount: 0, buyer_name: "", buyer_wa: "", buyer_email: "", notes: "", status: "new" })}><Plus /> Catat Order</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        {[{ v: "all", l: "Semua" }, ...ORDER_STATUS].map((s) => <Button key={s.v} size="sm" variant={filter === s.v ? "default" : "outline"} onClick={() => setFilter(s.v)}>{s.l}</Button>)}
      </div>
      <div className="rounded-2xl border bg-card shadow-card">
        <Table>
          <TableHeader><TableRow><TableHead>Buyer</TableHead><TableHead>Produk</TableHead><TableHead>Paket</TableHead><TableHead>Jumlah</TableHead><TableHead>Status</TableHead><TableHead>Tanggal</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {rows.map((o: any) => (
              <TableRow key={o.id}>
                <TableCell><p className="font-semibold">{o.buyer_name}</p><p className="text-xs text-muted-foreground">{o.buyer_wa}</p></TableCell>
                <TableCell>{o.products?.title}</TableCell>
                <TableCell>{o.package_name}</TableCell>
                <TableCell>{rupiah(o.amount)}</TableCell>
                <TableCell>
                  <Select value={o.status} onValueChange={(s) => updateStatus(o.id, s)}>
                    <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>{ORDER_STATUS.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{tanggal(o.created_at)}</TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Button size="icon" variant="ghost" onClick={() => setView(o)} aria-label="Detail"><Eye /></Button>
                  <Button size="sm" variant="outline" asChild><Link to="/admin/invoice/new" search={{ order: o.id }}><Receipt /> Buat Invoice</Link></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Belum ada order.</p>}
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detail Order</DialogTitle></DialogHeader>
          {view && (
            <dl className="grid grid-cols-3 gap-2 text-sm">
              <dt className="text-muted-foreground">Buyer</dt><dd className="col-span-2">{view.buyer_name}</dd>
              <dt className="text-muted-foreground">WA</dt><dd className="col-span-2">{view.buyer_wa}</dd>
              <dt className="text-muted-foreground">Email</dt><dd className="col-span-2">{view.buyer_email}</dd>
              <dt className="text-muted-foreground">Produk</dt><dd className="col-span-2">{view.products?.title}</dd>
              <dt className="text-muted-foreground">Brand</dt><dd className="col-span-2">{view.sellers?.name}</dd>
              <dt className="text-muted-foreground">Paket</dt><dd className="col-span-2">{view.package_name}</dd>
              <dt className="text-muted-foreground">Jumlah</dt><dd className="col-span-2">{rupiah(view.amount)}</dd>
              <dt className="text-muted-foreground">Catatan</dt><dd className="col-span-2 whitespace-pre-line">{view.notes || "-"}</dd>
            </dl>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Catat Order</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-4">
              <Field label="Produk">
                <Select value={edit.product_id} onValueChange={(id) => { const p: any = products.find((x) => x.id === id); set({ product_id: id, amount: p?.price ?? 0, package_name: "" }); }}>
                  <SelectTrigger><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                  <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              {prod && (prod.packages as any[])?.length > 0 && (
                <Field label="Paket">
                  <Select value={edit.package_name} onValueChange={(n) => { const k = (prod.packages as any[]).find((x) => x.name === n); set({ package_name: n, amount: k?.price ?? edit.amount }); }}>
                    <SelectTrigger><SelectValue placeholder="Pilih paket" /></SelectTrigger>
                    <SelectContent>{(prod.packages as any[]).map((k) => <SelectItem key={k.name} value={k.name}>{k.name} — {rupiah(k.price)}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              )}
              <Field label="Jumlah (Rp)"><Input type="number" value={edit.amount} onChange={(e) => set({ amount: Number(e.target.value) })} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama buyer"><Input value={edit.buyer_name} onChange={(e) => set({ buyer_name: e.target.value })} /></Field>
                <Field label="WhatsApp"><Input value={edit.buyer_wa} onChange={(e) => set({ buyer_wa: e.target.value })} /></Field>
              </div>
              <Field label="Email" hint="Jika buyer punya akun dengan email ini, order tampil di akunnya."><Input type="email" value={edit.buyer_email} onChange={(e) => set({ buyer_email: e.target.value })} /></Field>
              <Field label="Catatan"><Textarea value={edit.notes} onChange={(e) => set({ notes: e.target.value })} /></Field>
              <Button onClick={save} className="w-full">Simpan</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
