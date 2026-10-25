import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/annisa")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleAnnisaQuota } = await import("@/lib/annisa.server");
        return handleAnnisaQuota(request);
      },
      POST: async ({ request }) => {
        const { handleAnnisa } = await import("@/lib/annisa.server");
        return handleAnnisa(request);
      },
    },
  },
});
