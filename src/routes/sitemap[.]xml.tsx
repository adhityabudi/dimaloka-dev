import { createFileRoute } from "@tanstack/react-router";
import { getSitemapData } from "@/lib/public.functions";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const d = await getSitemapData();
        const origin = (d.settings.canonical_domain as string) || new URL(request.url).origin;
        const urls: { loc: string; lastmod?: string }[] = [
          { loc: "/" },
          { loc: "/blog" },
          { loc: "/portfolio" },
          ...["website", "desain-grafis", "digital-marketing", "seo", "aplikasi", "video"].map((s) => ({ loc: `/portfolio/${s}` })),
          ...d.categories.map((c) => ({ loc: `/layanan/${c.slug}`, lastmod: c.created_at })),
          ...d.products.map((p) => ({ loc: `/p/${p.slug}`, lastmod: p.updated_at })),
          ...d.sellers.map((s) => ({ loc: `/store/${s.slug}`, lastmod: s.created_at })),
          ...d.articles.map((a) => ({ loc: `/blog/${a.slug}`, lastmod: a.updated_at })),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u) => `  <url><loc>${origin.replace(/\/$/, "")}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ""}</url>`)
          .join("\n")}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
