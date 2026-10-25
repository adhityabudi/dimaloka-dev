import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/fields";
import { pageMeta } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/aio")({
  head: () => ({ meta: [...pageMeta({ title: "AIO — AI Optimization | Dimaloka Admin", description: "Generate artikel, SEO, copywriting website, dan deskripsi produk dengan AI DollarDesa." }), { name: "robots", content: "noindex" }] }),
  component: Layout,
});

function Layout() {
  const tab = "rounded-lg px-4 py-2 text-sm font-semibold hover:bg-muted";
  const active = { className: "bg-navy text-primary-foreground hover:bg-navy" };
  return <div className="max-w-6xl space-y-6">
    <PageHeader title="AIO — AI Optimization" desc="Generate & optimasi konten dengan prompt keahlian SEO dan copywriting yang bisa Anda atur sendiri." />
    <nav className="flex flex-wrap gap-2 rounded-xl border bg-card p-1.5">
      <Link to="/admin/aio" activeOptions={{ exact: true }} className={tab} activeProps={active}>AI Generator</Link>
      <Link to="/admin/aio/prompts" className={tab} activeProps={active}>Prompt Library</Link>
      <Link to="/admin/aio/settings" className={tab} activeProps={active}>AI Settings</Link>
    </nav>
    <Outlet />
  </div>;
}
