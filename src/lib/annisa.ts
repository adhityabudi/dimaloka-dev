import { z } from "zod";

export const ANNISA_INPUT_LIMIT = 2000;
export const ANNISA_RATE_LIMIT = 20;
export const ANNISA_WINDOW_SECONDS = 900;
export const ANNISA_REFUSAL = "Maaf, saya hanya bisa membantu seputar SEO, optimasi digital, dan layanan Dimaloka. Ada yang bisa saya bantu soal itu?";
export const ANNISA_WELCOME = "Halo! 👋 Saya Annisa AI, asisten Dimaloka.\n\nSaya bisa bantu kamu seputar:\n🚀 SEO & optimasi digital marketing\n📈 Iklan Google Ads & Meta Ads\n🛠 Produk & layanan Dimaloka\n\nMau tanya apa hari ini?";
export const annisaTextSchema = z.string().max(ANNISA_INPUT_LIMIT).refine(s => !!s.trim(), "Pesan tidak boleh kosong").refine(s => !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(s), "Pesan mengandung karakter yang tidak diizinkan");
export const annisaRequestSchema = z.object({
  messages: z.array(z.object({ id: z.string().max(200), role: z.enum(["user", "assistant"]), parts: z.array(z.object({ type: z.literal("text"), text: z.string().max(16000) }).strict()).min(1).max(1) }).strict()).min(1).max(100),
});
export function annisaGuard(text: string): "block" | "refuse" | "allow" {
  if (/<\s*\/?(?:script|iframe|object|embed|svg)\b|javascript\s*:|on(?:error|load)\s*=|(?:ignore|abaikan|lupakan).{0,45}(?:previous|sebelumnya|instruksi|aturan)|(?:reveal|bocorkan|tampilkan|ungkap).{0,45}(?:system prompt|prompt sistem|instruksi internal)|(?:you are now|kamu sekarang adalah)/i.test(text)) return "block";
  if (/\b(?:pornografi|porn|narkoba|senjata|bom|ransomware|malware|phishing|politik|sara|diagnosis|nasihat hukum)\b/i.test(text)) return "refuse";
  return "allow";
}
export function safeAnnisaOutput(text: string) {
  if (annisaGuard(text) !== "allow") return ANNISA_REFUSAL;
  return text.replace(/<[^>]*>/g, "").replace(/!?\[([^\]]*)\]\((?!\/[^/]|https:\/\/)[^)]*\)/gi, "$1");
}