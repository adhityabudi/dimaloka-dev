import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/annisa")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleAnnisa } = await import("@/lib/annisa.server");
        return handleAnnisa(request);
      },
    },
  },
});
