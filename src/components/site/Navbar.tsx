import { Link, useLoaderData, useNavigate } from "@tanstack/react-router";
import { ChevronDown, LayoutDashboard, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { CategoryIcon } from "./CategoryIcon";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { layout } = useLoaderData({ from: "__root__" });
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const cats = layout.categories;

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Logo className="h-7" />
        <nav className="hidden items-center gap-1 text-sm font-semibold text-navy lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-lg px-3 py-2 hover:bg-muted">
              Kategori <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              {cats.map((c) => (
                <DropdownMenuItem key={c.id} asChild>
                  <Link to="/kategori/$slug" params={{ slug: c.slug }} className="flex items-center gap-2">
                    <CategoryIcon icon={c.icon} className="h-4 w-4 text-primary" /> {c.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/blog" className="rounded-lg px-3 py-2 hover:bg-muted" activeProps={{ className: "text-primary-strong" }}>Blog</Link>
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl"><User /> Akun</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdmin && (
                  <DropdownMenuItem asChild><Link to="/admin"><LayoutDashboard className="h-4 w-4" /> Dashboard Admin</Link></DropdownMenuItem>
                )}
                <DropdownMenuItem asChild><Link to="/akun"><User className="h-4 w-4" /> Riwayat Order</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}><LogOut className="h-4 w-4" /> Keluar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="font-semibold text-navy"><Link to="/auth/sign-in">Masuk</Link></Button>
              <Button asChild className="rounded-xl font-semibold shadow-cta"><Link to="/auth/sign-up">Daftar</Link></Button>
            </>
          )}
        </div>
        <button className="ml-auto rounded-lg p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-background px-4 py-4 lg:hidden">
          <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Kategori</p>
          <div className="grid grid-cols-2 gap-2">
            {cats.map((c) => (
              <Link key={c.id} to="/kategori/$slug" params={{ slug: c.slug }} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium">
                <CategoryIcon icon={c.icon} className="h-4 w-4 text-primary" /> {c.name}
              </Link>
            ))}
          </div>
          <Link to="/blog" onClick={() => setOpen(false)} className="mt-3 block py-2 font-semibold">Blog</Link>
          <div className="mt-3 flex gap-2">
            {user ? (
              <>
                {isAdmin && <Button asChild variant="outline" className="flex-1"><Link to="/admin">Admin</Link></Button>}
                <Button asChild variant="outline" className="flex-1"><Link to="/akun">Akun</Link></Button>
                <Button onClick={signOut} variant="ghost">Keluar</Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="flex-1"><Link to="/auth/sign-in">Masuk</Link></Button>
                <Button asChild className="flex-1"><Link to="/auth/sign-up">Daftar</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
