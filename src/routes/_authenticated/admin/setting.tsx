import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, PageHeader } from "@/components/admin/fields";
import { useSettings } from "@/components/admin/useSettings";

export const Route = createFileRoute("/_authenticated/admin/setting")({
  head: () => ({ meta: [{ title: "Pengaturan Platform | Dimaloka Admin" }, { name: "description", content: "Kelola identitas, kontak, media sosial, dan informasi pembayaran Dimaloka." }, { property: "og:title", content: "Pengaturan Platform | Dimaloka Admin" }, { property: "og:description", content: "Pengaturan identitas dan pembayaran platform Dimaloka." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});

function Page() {
  const { data, save, isPending, isError, refetch } = useSettings();
  const [v, setV] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { if (data) { setV(data); setReady(true); } }, [data]);
  const s = (k: string) => (e: any) => setV({ ...v, [k]: e.target.value });
  const social = v.social_links ?? {};
  const keys = ["site_name", "site_tagline", "contact_email", "contact_whatsapp", "contact_address", "footer_about", "social_links", "payment_info"];
  return (
    <div className="max-w-3xl">
      <PageHeader title="Setting Platform" action={<Button disabled={!ready || isPending || isError || saving} onClick={async () => {
        if (!ready || isPending || isError || saving) return;
        setSaving(true);
        try { await save(Object.fromEntries(keys.map((k) => [k, v[k] ?? ""]))); }
        finally { setSaving(false); }
      }}>{saving ? "Menyimpan…" : "Simpan"}</Button>} />
      {isPending || !ready && !isError ? <p role="status">Memuat pengaturan…</p> : isError ? <div role="alert" className="space-y-3"><p>Pengaturan belum dapat dimuat. Silakan coba lagi.</p><Button variant="outline" onClick={() => refetch()}>Coba lagi</Button></div> : <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="font-extrabold text-navy">Identitas</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama situs"><Input value={v.site_name ?? ""} onChange={s("site_name")} /></Field>
            <Field label="Tagline"><Input value={v.site_tagline ?? ""} onChange={s("site_tagline")} /></Field>
          </div>
          <Field label="Tentang (footer)"><Textarea value={v.footer_about ?? ""} onChange={s("footer_about")} /></Field>
        </section>
        <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="font-extrabold text-navy">Kontak</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email"><Input value={v.contact_email ?? ""} onChange={s("contact_email")} /></Field>
            <Field label="WhatsApp" hint="Format 628xxx"><Input value={v.contact_whatsapp ?? ""} onChange={s("contact_whatsapp")} /></Field>
          </div>
          <Field label="Alamat"><Input value={v.contact_address ?? ""} onChange={s("contact_address")} /></Field>
        </section>
        <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="font-extrabold text-navy">Sosial Media</h2>
          {["instagram", "telegram", "whatsapp"].map((k) => (
            <Field key={k} label={k[0].toUpperCase() + k.slice(1)}><Input value={social[k] ?? ""} onChange={(e) => setV({ ...v, social_links: { ...social, [k]: e.target.value } })} /></Field>
          ))}
        </section>
        <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="font-extrabold text-navy">Pembayaran</h2>
          <Field label="Info rekening (tampil di invoice)" hint="Satu bank per blok, pisahkan dengan baris kosong. Baris 1: nama bank, baris 2: nomor rekening, baris 3: a.n. pemilik"><Textarea rows={8} value={v.payment_info ?? ""} onChange={s("payment_info")} /></Field>
        </section>
      </div>}
    </div>
  );
}
