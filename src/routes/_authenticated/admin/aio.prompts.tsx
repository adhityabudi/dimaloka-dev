import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAioPrompts, resetAioPrompt, saveAioPrompt } from "@/lib/aio.functions";
import { AIO_MODELS, type AioFeature } from "@/lib/aio";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/aio/prompts")({ component: Page });

type Row = Awaited<ReturnType<typeof listAioPrompts>>[number];

function Page() {
  const list = useServerFn(listAioPrompts);
  const q = useQuery({ queryKey: ["aio-prompts"], queryFn: () => list(), retry: false });
  const [editing, setEditing] = useState<AioFeature | null>(null);
  if (q.isLoading) return <p>Memuat…</p>;
  if (q.isError) return <p role="alert" className="text-destructive">{(q.error as Error).message}</p>;
  const current = q.data?.find((r) => r.feature === editing);
  return <div className="space-y-6">
    <section className="rounded-2xl border bg-card shadow-card"><Table>
      <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Feature key</TableHead><TableHead>Model</TableHead><TableHead>Terakhir diubah</TableHead><TableHead /></TableRow></TableHeader>
      <TableBody>{q.data?.map((r) => <TableRow key={r.feature}>
        <TableCell className="font-semibold">{r.name}{r.is_default && <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-normal">bawaan</span>}</TableCell>
        <TableCell className="font-mono text-xs">{r.feature}</TableCell>
        <TableCell className="text-sm">{r.model ?? "Default global"}</TableCell>
        <TableCell className="text-sm">{r.updated_at ? formatDate(r.updated_at) : "—"}</TableCell>
        <TableCell><Button size="sm" variant="outline" onClick={() => setEditing(r.feature)}>Edit</Button></TableCell>
      </TableRow>)}</TableBody>
    </Table></section>
    {current && <PromptEditor key={current.feature + current.updated_at} row={current} onDone={() => setEditing(null)} />}
  </div>;
}

function PromptEditor({ row, onDone }: { row: Row; onDone: () => void }) {
  const qc = useQueryClient();
  const save = useServerFn(saveAioPrompt), reset = useServerFn(resetAioPrompt);
  const [prompt, setPrompt] = useState(row.system_prompt), [temp, setTemp] = useState(row.temperature), [model, setModel] = useState(row.model ?? "__default");
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>, msg: string) => {
    setBusy(true);
    try { await fn(); toast.success(msg); await qc.invalidateQueries({ queryKey: ["aio-prompts"] }); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Gagal"); } finally { setBusy(false); }
  };
  return <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
    <h2 className="font-extrabold text-navy">Edit prompt — {row.name}</h2>
    <label className="block space-y-2 text-sm font-semibold">System prompt<Textarea aria-label="System prompt" rows={22} className="font-mono text-xs" value={prompt} onChange={(e) => setPrompt(e.target.value)} /></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block space-y-2 text-sm font-semibold">Temperature<Input type="number" step={0.1} min={0} max={2} value={temp} onChange={(e) => setTemp(Number(e.target.value))} /></label>
      <label className="block space-y-2 text-sm font-semibold">Model
        <Select value={model} onValueChange={setModel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__default">Default global</SelectItem>{AIO_MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
      </label>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button disabled={busy} onClick={() => run(() => save({ data: { feature: row.feature, system_prompt: prompt, temperature: temp, model: model === "__default" ? null : model } }), "Prompt disimpan")}>{busy ? <Loader2 className="animate-spin" /> : <Save />} Simpan</Button>
      <Button variant="outline" disabled={busy} onClick={() => { if (confirm("Kembalikan prompt ke bawaan?")) run(() => reset({ data: { feature: row.feature } }), "Prompt dikembalikan ke default"); }}><RotateCcw /> Reset ke default</Button>
      <Button variant="ghost" onClick={onDone}>Tutup</Button>
    </div>
  </section>;
}
