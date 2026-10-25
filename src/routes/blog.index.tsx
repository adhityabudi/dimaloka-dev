import { publicPageHead } from "@/lib/structured-data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { listArticles } from "@/lib/public.functions";
import { pageMeta } from "@/lib/site";
import { tanggal } from "@/lib/format";

export const Route = createFileRoute("/blog/")({
  loader: () => listArticles(),
  head: ({ loaderData, matches }) => {
    return publicPageHead("blog", loaderData, matches[0]?.loaderData as any);
  },
  component: BlogList,
});

function BlogList() {
  const articles = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-wider text-primary-strong">Blog</p>
      <h1 className="mt-1 text-4xl font-extrabold text-navy">Wawasan untuk bisnis digital Anda</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((a: any) => (
          <Link key={a.slug} to="/blog/$slug" params={{ slug: a.slug }} className="group overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-1">
            {a.cover_image && <img src={a.cover_image} alt={a.title} loading="lazy" className="aspect-[16/9] w-full object-cover" />}
            <div className="p-5">
              <p className="text-xs text-muted-foreground">{a.categories?.name && <span className="font-semibold text-sky">{a.categories.name} · </span>}{tanggal(a.published_at)}</p>
              <h2 className="mt-2 text-lg font-bold text-navy group-hover:text-primary-strong">{a.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{a.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
      {articles.length === 0 && <p className="mt-10 text-muted-foreground">Belum ada artikel.</p>}
    </div>
  );
}
