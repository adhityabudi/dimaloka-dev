import { createFileRoute } from "@tanstack/react-router";
import { getSitemapData } from "@/lib/public.functions";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const d = await getSitemapData();
        const origin = ((d.settings.canonical_domain as string) || new URL(request.url).origin).replace(/\/$/, "");
        const body = `${(d.settings.robots_txt as string) || "User-agent: *\nAllow: /\n"}\nSitemap: ${origin}/sitemap.xml\n`;
        return new Response(body, { headers: { "Content-Type": "text/plain" } });
      },
    },
  },
});
