import { createFileRoute } from "@tanstack/react-router";
import { getSitemapData } from "@/lib/public.functions";
import { siteOrigin } from "@/lib/sitemap-utils";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const d = await getSitemapData();
        const origin = siteOrigin(d.settings.canonical_domain, request.url);
        const saved = (d.settings.robots_txt as string) || "User-agent: *\nAllow: /\n";
        const body = /^Sitemap:/im.test(saved) ? saved : `${saved}\nSitemap: ${origin}/sitemap.xml\n`;
        return new Response(body, { headers: { "Content-Type": "text/plain" } });
      },
    },
  },
});
