import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/artikel/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Artikel | Dimaloka Admin" }, { name: "description", content: "Perbarui isi artikel, gambar, dan metadata SEO blog Dimaloka." }, { property: "og:title", content: "Edit Artikel | Dimaloka Admin" }, { property: "og:description", content: "Perbarui konten dan SEO artikel Dimaloka." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["adm-article", id], queryFn: async () => {
    const { data, error } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  } });
  if (isLoading) return <p>Memuat…</p>;
  if (isError) return <div role="alert" className="space-y-3"><p>Artikel belum dapat dimuat.</p><Button variant="outline" onClick={() => refetch()}>Coba lagi</Button></div>;
  if (!data) return <p>Artikel tidak ditemukan.</p>;
  return <ArticleForm initial={data} />;
}
