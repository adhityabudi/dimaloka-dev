import { createFileRoute } from "@tanstack/react-router";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const Route = createFileRoute("/_authenticated/admin/artikel/new")({
  head: () => ({ meta: [{ title: "Tulis Artikel | Dimaloka Admin" }, { name: "description", content: "Tulis artikel blog Dimaloka dan siapkan rekomendasi SEO sebelum publikasi." }, { property: "og:title", content: "Tulis Artikel | Dimaloka Admin" }, { property: "og:description", content: "Siapkan konten dan SEO artikel baru Dimaloka." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <ArticleForm />,
});
