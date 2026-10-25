import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { articleLinkCatalog } from "./aio-article";

export async function loadArticleLinks(client: SupabaseClient<Database>) {
  const [products, services] = await Promise.all([
    client.from("products").select("title,slug").eq("status", "published"),
    client.from("categories").select("name,slug").eq("is_active", true),
  ]);
  if (products.error || services.error) throw new Error("Daftar tautan website tidak dapat dimuat");
  return articleLinkCatalog(products.data ?? [], services.data ?? []);
}