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
import { AI_MIN_TOKENS, AI_MAX_TOKENS } from "@/lib/ai-seo";

export const Route = createFileRoute("/_authenticated/admin/aio/settings")({ component: Page, head: () => ({ meta: [{ title: "Pengaturan AI | Admin Dimaloka" }, { name: "description", content: "Kelola model dan batas token AI Dimaloka." }, { property: "og:title", content: "Pengaturan AI | Admin Dimaloka" }, { property: "og:description", content: "Kelola model dan batas token AI Dimaloka." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }) });

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
  const validTokens = Number.isInteger(maxTokens) && maxTokens >= AI_MIN_TOKENS && maxTokens <= AI_MAX_TOKENS;
  return <section className="max-w-2xl space-y-5 rounded-2xl border bg-card p-6 shadow-card">
    <div className="flex items-center gap-2 text-sm font-semibold">Status API key: {config.data?.configured ? <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-4 w-4" /> Sudah di-set</span> : <span className="flex items-center gap-1 text-destructive"><XCircle className="h-4 w-4" /> Belum</span>}</div>
    <p className="text-xs text-muted-foreground">Gateway: {config.data?.baseUrl}. Kunci tersimpan aman di server dan tidak pernah ditampilkan.</p>
    <label className="block space-y-2 text-sm font-semibold">Model default global
      <Select value={model} onValueChange={setModel}><SelectTrigger aria-label="Model default"><SelectValue placeholder="Pilih model" /></SelectTrigger><SelectContent>{options.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
    </label>
    <label className="block space-y-2 text-sm font-semibold">Max tokens<Input aria-label="Max tokens" type="number" min={AI_MIN_TOKENS} max={AI_MAX_TOKENS} step={1} value={Number.isNaN(maxTokens) ? "" : maxTokens} onChange={(e) => setMaxTokens(e.target.valueAsNumber)} /></label>
    <p className="text-xs text-muted-foreground">256–65.536 token. Batas akhir mengikuti model DollarDesa yang dipilih; nilai lebih besar dapat meningkatkan biaya.</p>
    {!validTokens && <p role="alert" className="text-sm text-destructive">Masukkan bilangan bulat antara 256 dan 65.536 token.</p>}
    <label className="flex items-center gap-2 text-sm"><Switch checked={enabled} onCheckedChange={setEnabled} /> AI aktif</label>
    <Button disabled={busy || !config.data || !model || !validTokens} onClick={async () => {
      setBusy(true);
      try { await save({ data: { enabled, model, max_tokens: maxTokens } }); toast.success("Pengaturan AI disimpan"); await qc.invalidateQueries({ queryKey: ["ai-seo-config"] }); }
      catch (e) { toast.error(e instanceof Error ? e.message : "Gagal menyimpan"); } finally { setBusy(false); }
    }}>{busy && <Loader2 className="animate-spin" />} Simpan</Button>
  </section>;
}
