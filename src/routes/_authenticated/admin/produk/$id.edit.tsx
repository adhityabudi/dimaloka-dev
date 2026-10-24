import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/_authenticated/admin/produk/$id/edit")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({ queryKey: ["adm-product", id], queryFn: async () => (await supabase.from("products").select("*").eq("id", id).single()).data });
  if (isLoading) return <p>Memuat…</p>;
  if (!data) return <p>Produk tidak ditemukan.</p>;
  return <ProductForm initial={data} />;
}
