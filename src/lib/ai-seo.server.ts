import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export async function assertSeoAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || data !== true) throw new Error("Hanya administrator yang dapat menggunakan AI SEO");
}

export async function readSeoStream(response: Response): Promise<string> {
  if (!response.body) throw new Error("DollarDesa tidak mengirim jawaban");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "", text = "", done = false;
  const processLine = (line: string) => {
    if (!line.startsWith("data:")) return;
    const raw = line.slice(5).trim();
    if (!raw) return;
    if (raw === "[DONE]") { done = true; return; }
    const item = JSON.parse(raw);
    if (item.error) throw new Error("DollarDesa menghentikan rekomendasi; periksa akun dan model Anda.");
    for (const choice of item.choices ?? []) {
      if (choice.finish_reason === "length") throw new Error("Jawaban AI terpotong karena batas max tokens; naikkan Max tokens di AI Settings.");
      if (choice.delta?.refusal || choice.finish_reason === "content_filter") throw new Error("DollarDesa menolak permintaan ini.");
      if (typeof choice.delta?.content === "string") text += choice.delta.content;
      if (text.length > 50000) throw new Error("Jawaban AI terlalu panjang");
    }
  };
  try {
    while (!done) {
      const chunk = await reader.read();
      buffer += decoder.decode(chunk.value, { stream: !chunk.done });
      const lines = buffer.split("\n"); buffer = lines.pop() ?? "";
      for (const line of lines) processLine(line.trimEnd());
      if (chunk.done) { processLine(buffer); break; }
    }
  } finally { await reader.cancel(); }
  if (!text.trim()) throw new Error("DollarDesa tidak memberikan rekomendasi");
  return text;
}