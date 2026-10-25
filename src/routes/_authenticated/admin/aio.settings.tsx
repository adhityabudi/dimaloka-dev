import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAiSeoConfig, listAiSeoModels, saveAiSeoConfig } from "@/lib/ai-seo.functions";
import { AIO_DEFAULT_MAX_TOKENS, AIO_MODELS } from "@/lib/aio";

export const Route = createFileRoute("/_authenticated/admin/aio/settings")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const getConfig = useServerFn(getAiSeoConfig), save = useServerFn(saveAiSeoConfig), getModels = useServerFn(listAiSeoModels);
  const config = useQuery({ queryKey: ["ai-seo-config"], queryFn: () => getConfig(), retry: false });
  const models = useQuery({ queryKey: ["ai-models"], queryFn: () => getModels(), retry: false, enabled: !!config.data?.configured });
  const [model, setModel] = useState(""), [maxTokens, setMaxTokens] = useState(AIO_DEFAULT_MAX_TOKENS), [enabled, setEnabled] = useState(true), [busy, setBusy] = useState(false);
  useEffect(() => { if (config.data) { setModel(config.data.settings.model); setMaxTokens(config.data.settings.max_tokens ?? AIO_DEFAULT_MAX_TOKENS); setEnabled(config.data.settings.enabled); } }, [config.data]);
  if (config.isLoading) return <p>Memuat…</p>;
  if (config.isError) return <p role="alert" className="text-destructive">{(config.error as Error).message}</p>;
  const options = Array.from(new Set([...AIO_MODELS, ...(models.data ?? []), model].filter(Boolean)));
  return <section className="max-w-2xl space-y-5 rounded-2xl border bg-card p-6 shadow-card">
    <div className="flex items-center gap-2 text-sm font-semibold">Status API key: {config.data?.configured ? <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-4 w-4" /> Sudah di-set</span> : <span className="flex items-center gap-1 text-destructive"><XCircle className="h-4 w-4" /> Belum</span>}</div>
    <p className="text-xs text-muted-foreground">Gateway: {config.data?.baseUrl}. Kunci tersimpan aman di server dan tidak pernah ditampilkan.</p>
    <label className="block space-y-2 text-sm font-semibold">Model default global
      <Select value={model} onValueChange={setModel}><SelectTrigger aria-label="Model default"><SelectValue placeholder="Pilih model" /></SelectTrigger><SelectContent>{options.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
    </label>
    <label className="block space-y-2 text-sm font-semibold">Max tokens<Input type="number" min={256} max={16000} value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} /></label>
    <label className="flex items-center gap-2 text-sm"><Switch checked={enabled} onCheckedChange={setEnabled} /> AI aktif</label>
    <Button disabled={busy || !model || maxTokens < 256 || maxTokens > 16000} onClick={async () => {
      setBusy(true);
      try { await save({ data: { enabled, model, max_tokens: Math.round(maxTokens) } }); toast.success("Pengaturan AI disimpan"); await qc.invalidateQueries({ queryKey: ["ai-seo-config"] }); }
      catch (e) { toast.error(e instanceof Error ? e.message : "Gagal menyimpan"); } finally { setBusy(false); }
    }}>{busy && <Loader2 className="animate-spin" />} Simpan</Button>
  </section>;
}
