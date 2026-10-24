import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const Route = createFileRoute("/_authenticated/admin/artikel/$id/edit")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({ queryKey: ["adm-article", id], queryFn: async () => (await supabase.from("articles").select("*").eq("id", id).single()).data });
  if (isLoading) return <p>Memuat…</p>;
  if (!data) return <p>Artikel tidak ditemukan.</p>;
  return <ArticleForm initial={data} />;
}
