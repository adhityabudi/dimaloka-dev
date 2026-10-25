import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AI_SEO_BASE, AI_SEO_PROMPT, aiSeoInputSchema, aiSeoSettingsSchema, parseAiSeoResult } from "./ai-seo";

export const getAiSeoConfig = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { assertSeoAdmin } = await import("./ai-seo.server");
  await assertSeoAdmin(context.supabase, context.userId);
  const { data, error } = await context.supabase.from("site_settings").select("value").eq("key", "ai_seo_settings").maybeSingle();
  if (error) throw new Error("Pengaturan AI tidak dapat dimuat");
  const parsed = aiSeoSettingsSchema.safeParse(data?.value);
  return { baseUrl: AI_SEO_BASE, configured: Boolean(process.env["DOLLARDESA_API_KEY"]), settings: parsed.success ? parsed.data : { enabled: true, model: "deepseek-v4.1-flash" } };
});

export const listAiSeoModels = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { assertSeoAdmin } = await import("./ai-seo.server");
  await assertSeoAdmin(context.supabase, context.userId);
  const key = process.env["DOLLARDESA_API_KEY"];
  if (!key) throw new Error("Kunci API DollarDesa belum diatur");
  const response = await fetch(`${AI_SEO_BASE}/models`, { headers: { Authorization: `Bearer ${key}` } });
  if (!response.ok) throw new Error(`Daftar model DollarDesa tidak tersedia (${response.status}). Periksa akses akun.`);
  const body = await response.json() as { data?: { id?: string }[] };
  return (body.data ?? []).map((m) => m.id).filter((id): id is string => typeof id === "string" && id.length > 0).sort();
});

export const saveAiSeoConfig = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: unknown) => aiSeoSettingsSchema.parse(data)).handler(async ({ context, data }) => {
  const { assertSeoAdmin } = await import("./ai-seo.server");
  await assertSeoAdmin(context.supabase, context.userId);
  const { error } = await context.supabase.from("site_settings").upsert({ key: "ai_seo_settings", value: data, updated_at: new Date().toISOString() });
  if (error) throw new Error("Pengaturan AI gagal disimpan");
  return { ok: true };
});

export const generateAiSeo = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: unknown) => aiSeoInputSchema.parse(data)).handler(async ({ context, data }) => {
  const { assertSeoAdmin } = await import("./ai-seo.server");
  await assertSeoAdmin(context.supabase, context.userId);
  const { loadAiSettings, loadPrompt, callGateway } = await import("./aio.server");
  const settings = await loadAiSettings(context.supabase);
  if (!settings.enabled) throw new Error("AI SEO dinonaktifkan oleh admin");
  // Skill = the article_seo prompt from the Prompt Library; the output contract stays the editor's format.
  const skill = await loadPrompt(context.supabase, "article_seo");
  const system = `${skill.system_prompt}\n\n---\nUNTUK PERMINTAAN INI, gunakan seluruh keahlian SEO dan copywriting SEO di atas, tetapi ABAIKAN format output di atas dan ikuti aturan berikut:\n${AI_SEO_PROMPT}`;
  const text = await callGateway({ model: skill.model || settings.model, system, user: JSON.stringify(data), temperature: skill.temperature, max_tokens: Math.max(settings.max_tokens, 4096) });
  try { return { result: parseAiSeoResult(text), model: settings.model }; }
  catch { throw new Error("Format rekomendasi AI tidak sesuai batas SEO. Tidak ada konten yang diubah."); }
});