import { createFileRoute, notFound } from "@tanstack/react-router";
import { Download, MessageCircle } from "lucide-react";
import logo from "@/assets/dimaloka-logo.png.asset.json";
import { getInvoice } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { rupiah, tanggal, waLink } from "@/lib/format";

export const Route = createFileRoute("/invoice/$token")({
  loader: async ({ params }) => {
    const d = await getInvoice({ data: { token: params.token } });
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Invoice ${loaderData.invoice.invoice_number} | Dimaloka` : "Invoice | Dimaloka" },
      { name: "description", content: "Invoice resmi layanan Dimaloka." },
      { property: "og:title", content: "Invoice Dimaloka" },
      { property: "og:description", content: "Invoice resmi layanan Dimaloka." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InvoicePage,
});

const statusLabel: Record<string, string> = { sent: "Menunggu Pembayaran", paid: "Lunas", cancelled: "Dibatalkan", draft: "Draft" };

function InvoicePage() {
  const { invoice: inv, settings: s } = Route.useLoaderData();
  const items = (inv.items as { name: string; qty: number; price: number }[]) ?? [];
  const wa = s.contact_whatsapp as string;
  const paid = inv.status === "paid";
  return (
    <div className="min-h-screen bg-muted py-10 print:bg-background print:py-0">
      <div className="mx-auto max-w-3xl px-4">
        <div className="no-print mb-4 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => window.print()} className="rounded-xl"><Download /> Download PDF</Button>
          {!paid && inv.status !== "cancelled" && (
            <Button asChild className="rounded-xl font-bold shadow-cta">
              <a href={waLink(wa, `Halo admin Dimaloka, saya ingin konfirmasi pembayaran invoice ${inv.invoice_number} sebesar ${rupiah(inv.amount)}.`)} target="_blank" rel="noreferrer"><MessageCircle /> Konfirmasi Pembayaran via WA</a>
            </Button>
          )}
        </div>
        <div className="overflow-hidden rounded-2xl bg-card shadow-card print:shadow-none">
          <div className="flex items-start justify-between gap-4 bg-gradient-navy p-8 text-navy-foreground">
            <div>
              <div className="inline-block rounded-lg bg-background px-2 py-1"><img src={logo.url} alt="Dimaloka" className="h-6 w-auto" /></div>
              <p className="mt-3 text-xs text-navy-foreground/70">{s.contact_email} · {s.contact_address}</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-extrabold">INVOICE</h1>
              <p className="font-mono text-sm">{inv.invoice_number}</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${paid ? "bg-success text-primary-foreground" : inv.status === "cancelled" ? "bg-coral text-primary-foreground" : "bg-primary text-primary-foreground"}`}>{statusLabel[inv.status]}</span>
            </div>
          </div>
          <div className="grid gap-6 p-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Ditagihkan kepada</p>
              <p className="mt-1 font-bold text-navy">{inv.buyer_name}</p>
              <p className="text-sm text-muted-foreground">{inv.buyer_email}</p>
              <p className="text-sm text-muted-foreground">{inv.buyer_wa}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase text-muted-foreground">Tanggal</p>
              <p className="text-sm">{tanggal(inv.created_at)}</p>
              <p className="mt-2 text-xs font-bold uppercase text-muted-foreground">Jatuh tempo</p>
              <p className="text-sm font-semibold">{tanggal(inv.due_date)}</p>
              {paid && <><p className="mt-2 text-xs font-bold uppercase text-muted-foreground">Dibayar</p><p className="text-sm">{tanggal(inv.paid_at)}</p></>}
            </div>
          </div>
          <div className="px-8">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs uppercase text-muted-foreground"><th className="py-2">Item</th><th className="py-2 text-center">Qty</th><th className="py-2 text-right">Harga</th><th className="py-2 text-right">Subtotal</th></tr></thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-b"><td className="py-3 font-medium">{it.name}</td><td className="py-3 text-center">{it.qty}</td><td className="py-3 text-right">{rupiah(it.price)}</td><td className="py-3 text-right">{rupiah(it.qty * it.price)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end py-6"><div className="text-right"><p className="text-sm text-muted-foreground">Total</p><p className="text-3xl font-extrabold text-primary-strong">{rupiah(inv.amount)}</p></div></div>
          </div>
          {s.payment_info && (
            <div className="m-8 mt-0 rounded-xl bg-accent p-4 text-sm">
              <p className="font-bold text-navy">Informasi Pembayaran</p>
              <p className="mt-1 whitespace-pre-line text-accent-foreground">{s.payment_info}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
