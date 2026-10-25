import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { getServiceDirectory } from "@/lib/public.functions";
import { filterServices } from "@/lib/service-search";
import { publicPageHead } from "@/lib/structured-data";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const directory = queryOptions({ queryKey: ["public-service-directory"], queryFn: () => getServiceDirectory() });
export const Route = createFileRoute("/layanan/")({
  validateSearch: (search: Record<string, unknown>) => ({ q: typeof search.q === "string" ? search.q.slice(0, 200) : "" }),
  loader: ({ context }) => context.queryClient.ensureQueryData(directory),
  head: ({ loaderData, matches }) => publicPageHead("directory", loaderData, matches[0]?.loaderData as any),
  component: ServiceDirectory,
});
function ServiceDirectory() {
  const { data } = useSuspenseQuery(directory);
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q);
  useEffect(() => setQuery(q), [q]);
  const services = filterServices(data, query);
  return <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
    <h1 className="text-3xl font-bold text-navy sm:text-4xl">Layanan Digital</h1>
    <div className="relative mt-7 max-w-2xl"><Search className="absolute left-4 top-3 size-5 text-muted-foreground" /><Input type="search" aria-label="Pencarian layanan" placeholder="Cari website, SEO, Facebook Ads…" value={query} onChange={event => setQuery(event.target.value)} className="h-12 pl-12" /></div>
    <p role="status" className="mt-5 text-sm text-muted-foreground">{services.length} layanan{query.trim() ? ` untuk “${query.trim()}”` : " tersedia"}</p>
    {services.length ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{services.map(service => <ProductCard key={service.id} p={service} />)}</div> : <div className="py-16"><h2 className="text-xl font-semibold">Layanan tidak ditemukan</h2><p className="mt-3 text-muted-foreground">Coba kata kunci lain.</p><Button variant="outline" className="mt-5" onClick={() => setQuery("")}>Lihat semua layanan</Button></div>}
    <Button asChild variant="link" className="mt-8 px-0"><Link to="/">Kembali ke Home</Link></Button>
  </div>;
}