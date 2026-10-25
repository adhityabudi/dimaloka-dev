import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/kategori/$slug")({
  beforeLoad: ({ params, location }) => {
    throw redirect({ to: "/layanan/$slug", params: { slug: params.slug }, search: location.search, hash: location.hash, statusCode: 301, replace: true });
  },
});