import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AIO_FEATURES, aioPromptSchema, aioRequestSchema, aioUserMessage, parseAioOutput } from "./aio";
import { groundArticleLinks, validateArticleLinks } from "./aio-article";

async function admin(context: { supabase: any; userId: string }) {
  const { assertSeoAdmin } = await import("./ai-seo.server");
  await assertSeoAdmin(context.supabase, context.userId);
}

/** ai-generate: { feature, input, model? } → { content } (validated JSON). */
export const aiGenerate = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => aioRequestSchema.parse(d)).handler(async ({ context, data }) => {
  await admin(context);
  const { loadAiSettings, loadPrompt, callGateway } = await import("./aio.server");
  const settings = await loadAiSettings(context.supabase);
  if (!settings.enabled) throw new Error("AI dinonaktifkan oleh admin");
  const prompt = await loadPrompt(context.supabase, data.feature);
  const model = data.model || prompt.model || settings.model;
  const { loadArticleLinks } = await import("./aio-catalog.server");
  const links = data.feature === "article_generate" ? await loadArticleLinks(context.supabase) : [];
  const system = data.feature === "article_generate" ? `${prompt.system_prompt}\n\nAturan tautan wajib: gunakan hanya URL persis dari katalog berikut untuk link Markdown. Pilih 1–3 tautan relevan secara alami, jangan membuat URL sendiri, jangan menambahkan gambar Markdown atau link eksternal. Katalog: ${JSON.stringify(links)}` : prompt.system_prompt;
  const text = await callGateway({ model, system, user: aioUserMessage(data.feature, data.input), temperature: prompt.temperature, max_tokens: settings.max_tokens });
  try {
    const output = parseAioOutput(data.feature, text);
    if (data.feature === "article_generate") {
      const article = parseAioOutput("article_generate", text);
      article.content_markdown = groundArticleLinks(article.content_markdown, links);
      article.cta = groundArticleLinks(article.cta, links);
      article.faq = article.faq.map(f => ({ q: groundArticleLinks(f.q, links), a: groundArticleLinks(f.a, links) }));
      return { content: JSON.stringify(article), model, links };
    }
    return { content: JSON.stringify(output), model, links };
  }
  catch { throw new Error("Jawaban AI bukan JSON yang sesuai format. Coba generate ulang atau naikkan max tokens."); }
});

export const checkAioArticleLinks = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => z.object({ content: z.string().max(100000) }).parse(d)).handler(async ({ context, data }) => {
  await admin(context);
  const { loadArticleLinks } = await import("./aio-catalog.server");
  const links = await loadArticleLinks(context.supabase);
  validateArticleLinks(parseAioOutput("article_generate", data.content), links);
  return { ok: true };
});

export const listAioPrompts = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await admin(context);
  const { AIO_DEFAULT_PROMPTS } = await import("./aio-prompts.server");
  const { data, error } = await context.supabase.from("ai_prompts").select("feature,name,system_prompt,temperature,model,updated_at");
  if (error) throw new Error("Prompt library tidak dapat dimuat");
  return AIO_FEATURES.map((f) => {
    const row = data?.find((r) => r.feature === f);
    return { feature: f, name: row?.name ?? AIO_DEFAULT_PROMPTS[f].name, system_prompt: row?.system_prompt ?? AIO_DEFAULT_PROMPTS[f].system_prompt, temperature: row ? Number(row.temperature) : 0.7, model: row?.model ?? null, updated_at: row?.updated_at ?? null, is_default: !row || row.system_prompt === AIO_DEFAULT_PROMPTS[f].system_prompt };
  });
});

export const saveAioPrompt = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => aioPromptSchema.parse(d)).handler(async ({ context, data }) => {
  await admin(context);
  const { AIO_DEFAULT_PROMPTS } = await import("./aio-prompts.server");
  const { error } = await context.supabase.from("ai_prompts").upsert({ ...data, name: AIO_DEFAULT_PROMPTS[data.feature].name, updated_at: new Date().toISOString() }, { onConflict: "feature" });
  if (error) throw new Error("Prompt gagal disimpan");
  return { ok: true };
});

export const resetAioPrompt = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => z.object({ feature: z.enum(AIO_FEATURES) }).parse(d)).handler(async ({ context, data }) => {
  await admin(context);
  const { AIO_DEFAULT_PROMPTS } = await import("./aio-prompts.server");
  const d = AIO_DEFAULT_PROMPTS[data.feature];
  const { error } = await context.supabase.from("ai_prompts").upsert({ feature: data.feature, name: d.name, system_prompt: d.system_prompt, temperature: 0.7, model: null, updated_at: new Date().toISOString() }, { onConflict: "feature" });
  if (error) throw new Error("Prompt gagal direset");
  return { ok: true };
});
