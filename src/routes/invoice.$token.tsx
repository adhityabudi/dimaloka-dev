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

const statusLabel: Record<string, string> = { sent: "UNPAID", paid: "PAID", cancelled: "CANCELLED", draft: "DRAFT" };

function banks(info: string) {
  return info.split(/\n\s*\n/).map((b) => b.split("\n").map((l) => l.trim()).filter(Boolean)).filter((b) => b.length);
}

function InvoicePage() {
  const { invoice: inv, settings: s } = Route.useLoaderData();
  const items = (inv.items as { name: string; qty: number; price: number }[]) ?? [];
  const wa = s.contact_whatsapp as string;
  const paid = inv.status === "paid";
  const site = (s.site_name as string) || "Dimaloka";
  const badge = paid ? "bg-success/15 text-success" : inv.status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary-strong";
  const bankList = s.payment_info ? banks(s.payment_info as string) : [];
  return (
    <div className="min-h-screen bg-muted py-10 print:bg-background print:py-0">
      <div className="mx-auto max-w-4xl px-4 print:max-w-none print:px-0">
        <div className="no-print mb-4 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => window.print()} className="rounded-xl"><Download /> Download PDF</Button>
          {!paid && inv.status !== "cancelled" && (
            <Button asChild className="rounded-xl font-bold shadow-cta">
              <a href={waLink(wa, `Halo admin Dimaloka, saya ingin konfirmasi pembayaran invoice ${inv.invoice_number} sebesar ${rupiah(inv.amount)}.`)} target="_blank" rel="noreferrer"><MessageCircle /> Konfirmasi Pembayaran via WA</a>
            </Button>
          )}
        </div>
        <div className="bg-card p-8 text-navy shadow-card sm:p-12 print:p-8 print:shadow-none">
          <header className="flex flex-wrap items-start justify-between gap-6 border-b pb-6">
            <div>
              <img src={logo.url} alt={site} className="h-10 w-auto" />
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-3">
                <h1 className="text-4xl font-extrabold tracking-tight text-destructive">INVOICE</h1>
                <span className={`rounded-md px-3 py-1 text-xs font-bold ${badge}`}>{statusLabel[inv.status]}</span>
              </div>
              <p className="mt-3 text-xl font-semibold">{inv.invoice_number}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                <b>Tanggal:</b> {tanggal(inv.created_at)} <span className="ml-4"><b>Jatuh Tempo:</b> {tanggal(inv.due_date)}</span>
              </p>
            </div>
          </header>

          <section className="grid gap-8 py-8 sm:grid-cols-2">
            <div className="space-y-1 text-sm">
              <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">Dari:</p>
              <p className="font-bold">{site}</p>
              <p>{s.contact_email} <span className="ml-3">{s.contact_whatsapp}</span></p>
              <p className="whitespace-pre-line">{s.contact_address}</p>
            </div>
            <div className="space-y-1 text-sm">
              <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">Kepada:</p>
              <p className="font-bold">{inv.buyer_name}</p>
              <p>{inv.buyer_email} <span className="ml-3">{inv.buyer_wa}</span></p>
            </div>
          </section>

          {items[0] && <div className="mb-6 rounded-lg bg-muted px-5 py-4 text-lg font-semibold">{items[0].name}</div>}

          <table className="w-full border text-sm">
            <thead className="bg-navy text-navy-foreground">
              <tr className="text-left text-xs font-bold uppercase">
                <th className="border-r border-navy-foreground/20 p-4">Item</th>
                <th className="border-r border-navy-foreground/20 p-4">Harga</th>
                <th className="border-r border-navy-foreground/20 p-4">Qty</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b">
                  <td className="border-r p-4 font-semibold">{it.name}</td>
                  <td className="border-r p-4">{rupiah(it.price)}</td>
                  <td className="border-r p-4">{it.qty}</td>
                  <td className="p-4 text-right">{rupiah(it.qty * it.price)}</td>
                </tr>
              ))}
              <tr className="border-b-2 border-navy">
                <td colSpan={3} className="border-r p-4 text-right font-bold">Subtotal</td>
                <td className="p-4 text-right">{rupiah(inv.amount)}</td>
              </tr>
              <tr className="border-b-2 border-navy bg-muted">
                <td colSpan={3} className="border-r p-5 text-right text-xl font-extrabold">TOTAL</td>
                <td className="p-5 text-right text-xl font-extrabold">{rupiah(inv.amount)}</td>
              </tr>
            </tbody>
          </table>
          {paid && <div className="mt-6 flex justify-end"><span className="rounded-full bg-success/15 px-5 py-2 text-sm font-bold tracking-wide text-success">FULL PAYMENT</span></div>}

          {bankList.length > 0 && (
            <section className="mt-8 border-t-2 border-dashed pt-8">
              <h2 className="mb-4 font-bold">Pembayaran dapat dilakukan ke:</h2>
              <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
                {bankList.map((b, i) => (
                  <div key={i} className="rounded-lg border bg-muted p-5">
                    <p className="font-bold uppercase">{b[0]}</p>
                    {b[1] && <p className="mt-2 font-mono text-lg tracking-wider">{b[1]}</p>}
                    {b.slice(2).map((l, j) => <p key={j} className="mt-2 text-sm text-muted-foreground">{l}</p>)}
                  </div>
                ))}
              </div>
              {!paid && inv.status !== "cancelled" && (
                <div className="mt-5 rounded-lg border-l-4 border-primary bg-primary/10 p-4 text-sm">
                  Lakukan pembayaran senilai <b className="text-base">{rupiah(inv.amount)}</b> ke salah satu nomor rekening di atas. Batas pembayaran: <b>{tanggal(inv.due_date)}</b>
                </div>
              )}
            </section>
          )}

          <footer className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
            <p>Terima kasih atas kepercayaan Anda.</p>
            <p className="mt-2 text-destructive">{site}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
