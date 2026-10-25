import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { aiSeoSettingsSchema, AI_SEO_BASE } from "./ai-seo";
import { AIO_DEFAULT_MAX_TOKENS, AIO_DEFAULT_MODEL, type AioFeature } from "./aio";
import { AIO_DEFAULT_PROMPTS } from "./aio-prompts.server";
import { readSeoStream } from "./ai-seo.server";

type Client = SupabaseClient<Database>;

export async function loadAiSettings(supabase: Client) {
  const { data, error } = await supabase.from("site_settings").select("value").eq("key", "ai_seo_settings").maybeSingle();
  if (error) throw new Error("Pengaturan AI tidak dapat dimuat");
  const parsed = aiSeoSettingsSchema.safeParse(data?.value);
  const s = parsed.success ? parsed.data : { enabled: true, model: AIO_DEFAULT_MODEL };
  return { enabled: s.enabled, model: s.model, max_tokens: s.max_tokens ?? AIO_DEFAULT_MAX_TOKENS };
}

/** DB prompt library wins; the guide's default is the fallback. */
export async function loadPrompt(supabase: Client, feature: AioFeature) {
  const { data, error } = await supabase.from("ai_prompts").select("system_prompt,temperature,model").eq("feature", feature).maybeSingle();
  if (error) throw new Error("Prompt AI tidak dapat dimuat");
  return { system_prompt: data?.system_prompt ?? AIO_DEFAULT_PROMPTS[feature].system_prompt, temperature: data ? Number(data.temperature) : 0.7, model: data?.model ?? null };
}

export async function callGateway(opts: { model: string; system: string; user: string; temperature: number; max_tokens: number }) {
  const key = process.env["DOLLARDESA_API_KEY"];
  if (!key) throw new Error("Kunci API DollarDesa belum diatur");
  const response = await fetch(`${AI_SEO_BASE}/chat/completions`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: opts.model, stream: true, temperature: opts.temperature, max_tokens: opts.max_tokens, messages: [{ role: "system", content: opts.system }, { role: "user", content: opts.user }] }),
  });
  if (!response.ok) {
    const messages: Record<number, string> = { 400: "Permintaan ditolak DollarDesa; periksa model dan max tokens.", 401: "Kunci API DollarDesa tidak valid; perbarui kunci melalui pengaturan rahasia proyek.", 402: "Saldo DollarDesa tidak mencukupi; periksa langganan Anda.", 403: "Akses DollarDesa ditolak; periksa izin akun Anda.", 404: `Model "${opts.model}" tidak tersedia di DollarDesa.`, 429: "Batas permintaan DollarDesa tercapai; coba lagi nanti." };
    throw new Error(messages[response.status] ?? `DollarDesa gagal memproses permintaan (${response.status}).`);
  }
  return readSeoStream(response);
}
