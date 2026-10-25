import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/aio-image")({ server: { handlers: { POST: async ({ request }) => {
  const { articleImage } = await import("@/lib/article-image.server");
  return articleImage(request);
} } } });