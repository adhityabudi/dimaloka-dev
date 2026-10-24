import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { BarChart3, FileText, FolderTree, Home, LogOut, Menu, MessageSquareQuote, Package, Receipt, Search, Settings, ShoppingBag, Store, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/dimaloka-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.rpc("has_role", { _user_id: (context as any).user.id, _role: "admin" });
    if (!data) throw redirect({ to: "/akun" });
  },
  head: () => ({ meta: [{ title: "Dashboard Admin | Dimaloka" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { to: "/admin/kategori", label: "Kategori", icon: FolderTree },
  { to: "/admin/produk", label: "Produk", icon: Package },
  { to: "/admin/seller", label: "Brand / Seller", icon: Store },
  { to: "/admin/order", label: "Order", icon: ShoppingBag },
  { to: "/admin/invoice", label: "Invoice", icon: Receipt },
  { to: "/admin/testimoni", label: "Testimoni", icon: MessageSquareQuote },
  { to: "/admin/artikel", label: "Artikel", icon: FileText },
  { to: "/admin/seo", label: "Optimasi SEO", icon: Search },
  { to: "/admin/setting", label: "Setting", icon: Settings },
] as const;

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const Side = (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-5"><div className="inline-block rounded-lg bg-background px-2 py-1"><img src={logo.url} alt="Dimaloka" className="h-6 w-auto" /></div><p className="mt-2 text-xs text-sidebar-foreground/60">Panel Admin</p></div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: "exact" in n }} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-sidebar-accent" activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary" }}>
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-sidebar-border p-3">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"><Home className="h-4 w-4" /> Lihat situs</Link>
        <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth/sign-in", replace: true }); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"><LogOut className="h-4 w-4" /> Keluar</button>
      </div>
    </aside>
  );
  return (
    <div className="flex min-h-screen bg-muted">
      <div className="sticky top-0 hidden h-screen lg:block">{Side}</div>
      {open && <div className="fixed inset-0 z-50 flex lg:hidden"><div>{Side}</div><button className="flex-1 bg-navy/50" onClick={() => setOpen(false)} aria-label="Tutup" /></div>}
      <div className="min-w-0 flex-1">
        <header className="flex h-14 items-center gap-3 border-b bg-background px-4 lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
          <span className="font-bold text-navy">Admin Dimaloka</span>
        </header>
        <div className="p-4 md:p-8"><Outlet /></div>
      </div>
    </div>
  );
}
