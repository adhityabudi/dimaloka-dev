import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "./Logo";

export function AuthForm({ mode, redirect }: { mode: "in" | "up"; redirect?: string }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + (redirect ?? ""), data: { full_name: name } } });
        if (error) throw error;
        if (!data.session) setSent(true);
        else if (redirect) navigate({ href: redirect }); else navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data: u } = await supabase.auth.getUser();
        const { data: admin } = await supabase.rpc("has_role", { _user_id: u.user!.id, _role: "admin" });
        if (redirect) navigate({ href: redirect }); else navigate({ to: admin ? "/admin" : "/akun" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Gagal");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    if (redirect) sessionStorage.setItem("after-login", redirect);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Gagal masuk dengan Google");
    else if (!r.redirected) { sessionStorage.removeItem("after-login"); if (redirect) navigate({ href: redirect }); else navigate({ to: "/akun" }); }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-card">
        <Logo className="h-7" />
        <h1 className="mt-6 text-2xl font-extrabold text-navy">{mode === "in" ? "Masuk ke akun Anda" : "Buat akun baru"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{mode === "in" ? "Lihat riwayat order dan invoice Anda." : "Daftar gratis untuk melacak order & invoice."}</p>
        {sent ? (
          <div className="mt-6 rounded-xl bg-accent p-4 text-sm text-accent-foreground">Cek email Anda untuk konfirmasi pendaftaran, lalu masuk.</div>
        ) : (
          <>
            <Button type="button" variant="outline" className="mt-6 h-11 w-full rounded-xl" onClick={google}>Lanjutkan dengan Google</Button>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />atau<div className="h-px flex-1 bg-border" /></div>
            <form onSubmit={submit} className="space-y-4">
              {mode === "up" && (
                <div><Label htmlFor="name">Nama lengkap</Label><Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11" /></div>
              )}
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-11" /></div>
              <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 h-11" /></div>
              <Button disabled={busy} className="h-11 w-full rounded-xl font-bold shadow-cta">{busy ? "Memproses..." : mode === "in" ? "Masuk" : "Daftar"}</Button>
            </form>
          </>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "in" ? <>Belum punya akun? <Link to="/auth/sign-up" search={{ redirect }} className="font-bold text-primary-strong">Daftar</Link></> : <>Sudah punya akun? <Link to="/auth/sign-in" search={{ redirect }} className="font-bold text-primary-strong">Masuk</Link></>}
        </p>
      </div>
    </div>
  );
}
