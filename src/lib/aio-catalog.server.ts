import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { catalogVisible } from "./catalog-visibility";
import { articleLinkCatalog } from "./aio-article";

export async function loadArticleLinks(client: SupabaseClient<Database>) {
  const [products, services] = await Promise.all([
    client.from("products").select("title,slug,status,is_active,category_id").eq("status", "published"),
    client.from("categories").select("id,name,slug").eq("is_active", true),
  ]);
  if (products.error || services.error) throw new Error("Daftar tautan website tidak dapat dimuat");
  const ids = new Set((services.data ?? []).map(s => s.id));
  return articleLinkCatalog((products.data ?? []).filter(p => catalogVisible(p, ids)), services.data ?? []);
}