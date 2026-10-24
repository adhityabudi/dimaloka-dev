import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { getArticle } from "@/lib/public.functions";
import { jsonLd, pageMeta } from "@/lib/site";
import { tanggal } from "@/lib/format";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const d = await getArticle({ data: { slug: params.slug } });
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData, matches }) => {
    if (!loaderData) return { meta: [{ title: "Artikel tidak tersedia | Dimaloka" }, { name: "robots", content: "noindex" }] };
    const a = loaderData.article;
    const origin = (matches[0]?.loaderData as any)?.origin ?? "";
    const url = `${origin}/blog/${a.slug}`;
    const image = a.og_image || a.cover_image;
    return {
      meta: [
        ...pageMeta({ title: a.seo_title || a.title, description: a.seo_description || a.excerpt || "", image, type: "article" }),
        { name: "keywords", content: [a.focus_keyword, ...a.keywords].filter(Boolean).join(", ") },
        { property: "article:published_time", content: a.published_at ?? "" },
      ],
      links: origin ? [{ rel: "canonical", href: url }] : [],
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.title,
          description: a.seo_description,
          image: image ? [image] : undefined,
          author: { "@type": "Person", name: a.author ?? "Dimaloka" },
          publisher: { "@type": "Organization", name: "Dimaloka" },
          datePublished: a.published_at,
          dateModified: a.updated_at,
          mainEntityOfPage: url,
        }),
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { article: a, related } = Route.useLoaderData();
  const cat = a.categories as any;
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary-strong">Beranda</Link><ChevronRight className="h-4 w-4" />
        <Link to="/blog" className="hover:text-primary-strong">Blog</Link>
      </nav>
      {cat && <Link to="/kategori/$slug" params={{ slug: cat.slug }} className="mt-6 inline-block text-sm font-bold text-sky">{cat.name}</Link>}
      <h1 className="mt-2 text-3xl font-extrabold leading-tight text-navy md:text-5xl">{a.title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">Oleh <span className="font-semibold text-navy">{a.author ?? "Tim Dimaloka"}</span> · {tanggal(a.published_at)}</p>
      {a.cover_image && <img src={a.cover_image} alt={a.title} className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover" />}
      <div className="prose-content mt-8 text-lg text-foreground/90" dangerouslySetInnerHTML={{ __html: a.content ?? "" }} />
      {related.length > 0 && (
        <aside className="mt-14 border-t pt-8">
          <h2 className="text-xl font-extrabold text-navy">Artikel terkait</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} to="/blog/$slug" params={{ slug: r.slug }} className="group">
                {r.cover_image && <img src={r.cover_image} alt={r.title} loading="lazy" className="aspect-[16/10] w-full rounded-xl object-cover" />}
                <p className="mt-2 text-sm font-bold text-navy group-hover:text-primary-strong">{r.title}</p>
              </Link>
            ))}
          </div>
        </aside>
      )}
    </article>
  );
}
