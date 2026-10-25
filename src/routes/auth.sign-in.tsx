import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/site/AuthForm";

export const Route = createFileRoute("/auth/sign-in")({
  head: () => ({
    meta: [
      { title: "Masuk | Dimaloka" },
      { name: "description", content: "Masuk ke akun Dimaloka untuk melihat riwayat order dan invoice." },
      { property: "og:title", content: "Masuk | Dimaloka" },
      { property: "og:description", content: "Masuk ke akun Dimaloka." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" && s.redirect.startsWith("/") && !s.redirect.startsWith("//") ? s.redirect : undefined }),
  component: function AuthPage() { const { redirect } = Route.useSearch(); return <AuthForm mode="in" redirect={redirect} />; },
});
