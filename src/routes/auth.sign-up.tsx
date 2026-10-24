import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/site/AuthForm";

export const Route = createFileRoute("/auth/sign-up")({
  head: () => ({
    meta: [
      { title: "Daftar Akun | Dimaloka" },
      { name: "description", content: "Daftar akun Dimaloka gratis untuk melacak order dan invoice layanan digital Anda." },
      { property: "og:title", content: "Daftar Akun | Dimaloka" },
      { property: "og:description", content: "Daftar akun Dimaloka gratis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm mode="up" />,
});
