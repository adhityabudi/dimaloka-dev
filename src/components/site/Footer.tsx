import { Link, useLoaderData } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/dimaloka-logo.png.asset.json";

export function Footer() {
  const { layout } = useLoaderData({ from: "__root__" });
  const s = layout.settings;
  const social = (s.social_links ?? {}) as Record<string, string>;
  const [email, setEmail] = useState("");
  return (
    <footer className="bg-gradient-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="inline-block rounded-xl bg-background px-3 py-2"><img src={logo.url} alt="Dimaloka" loading="lazy" decoding="async" className="h-7 w-auto" /></div>
          <p className="mt-4 max-w-sm text-sm text-navy-foreground/70">{s.footer_about}</p>
          <div className="mt-5 flex gap-3">
            {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-lg bg-navy-foreground/10 p-2 hover:bg-primary"><Instagram className="h-4 w-4" /></a>}
            {social.telegram && <a href={social.telegram} target="_blank" rel="noreferrer" aria-label="Telegram" className="rounded-lg bg-navy-foreground/10 p-2 hover:bg-primary"><Send className="h-4 w-4" /></a>}
            {social.whatsapp && <a href={social.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-lg bg-navy-foreground/10 p-2 hover:bg-primary"><MessageCircle className="h-4 w-4" /></a>}
          </div>
        </div>
        <div>
          <h3 className="mb-4 font-bold">Layanan</h3>
          <ul className="space-y-2 text-sm text-navy-foreground/70">
            {layout.categories.slice(0, 6).map((c) => (
              <li key={c.id}><Link to="/layanan/$slug" params={{ slug: c.slug }} className="hover:text-primary">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-bold">Perusahaan & Bantuan</h3>
          <ul className="space-y-2 text-sm text-navy-foreground/70">
            <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
            <li><Link to="/auth/sign-up" className="hover:text-primary">Daftar Akun</Link></li>
            <li><a href={`https://wa.me/${s.contact_whatsapp ?? ""}`} className="hover:text-primary">Hubungi Admin</a></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> {s.contact_email}</li>
            <li>{s.contact_address}</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-bold">Newsletter</h3>
          <p className="mb-3 text-sm text-navy-foreground/70">Dapatkan promo & tips digital setiap minggu.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Terima kasih! Anda sudah berlangganan.");
              setEmail("");
            }}
            className="flex overflow-hidden rounded-xl bg-navy-foreground/10"
          >
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Anda" aria-label="Email" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-navy-foreground/50" />
            <button className="bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary-strong">Kirim</button>
          </form>
          <p className="mt-5 text-xs font-bold uppercase text-navy-foreground/60">Metode Pembayaran</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
            {["BCA", "Mandiri", "BRI", "QRIS", "GoPay", "OVO"].map((m) => (
              <span key={m} className="rounded-md bg-background px-2 py-1 text-navy">{m}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-navy-foreground/10 py-5 text-center text-xs text-navy-foreground/60">
        © {new Date().getFullYear()} {s.site_name ?? "Dimaloka"}. Semua hak dilindungi.
      </div>
    </footer>
  );
}
