import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { reportArticles } from "./seo-report";

export const getSeoReport = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (roleError || admin !== true) throw new Error("Laporan SEO hanya dapat diakses administrator.");
  const [articles, products, services] = await Promise.all([
    context.supabase.from("articles").select("id,title,slug,status,published_at").eq("status", "published").order("published_at", { ascending: false }),
    context.supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published"),
    context.supabase.from("categories").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);
  if (articles.error || products.error || services.error) throw new Error("Laporan belum dapat dimuat. Silakan coba kembali.");
  return { articles: reportArticles(articles.data ?? []), products: products.count ?? 0, services: services.count ?? 0 };
});