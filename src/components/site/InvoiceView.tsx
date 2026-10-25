import { Copy, Download, MessageCircle, Printer } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/dimaloka-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { rupiah, tanggal, waLink } from "@/lib/format";
import { paymentKind, paymentSummary } from "@/lib/invoice-payments";

const statusLabel: Record<string, string> = { sent: "UNPAID", paid: "PAID", cancelled: "CANCELLED", draft: "DRAFT" };

function banks(info: string) {
  return info.split(/\n\s*\n/).map((b) => b.split("\n").map((l) => l.trim()).filter(Boolean)).filter((b) => b.length);
}

export function InvoiceView({ invoice: inv, settings: s, preview = false }: { invoice: any; settings: Record<string, any>; preview?: boolean }) {
  const items = (inv.items as { name: string; qty: number; price: number }[]) ?? [];
  const wa = s.contact_whatsapp as string;
  const paid = inv.status === "paid";
  const site = (s.site_name as string) || "Dimaloka";
  const badge = paid ? "bg-success/15 text-success" : inv.status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary-strong";
  const bankList = s.payment_info ? banks(s.payment_info as string) : [];
  const payment = paymentSummary(inv);
  const staged = payment.stage !== "full";
  const settlement = payment.stage === "settlement";
  const percentage = (n: number) => Number(n.toFixed(1));
  return (
    <div className={preview ? "bg-invoice-paper py-5 print:bg-background print:py-0" : "min-h-screen bg-invoice-paper py-4 sm:py-6 print:bg-background print:py-0"}>
      <div className="mx-auto max-w-[672px] px-3 sm:px-4 print:max-w-none print:px-0">
        <div className="invoice-sheet rounded-md border border-border/40 bg-card px-5 py-7 text-invoice-ink shadow-card sm:px-7 sm:py-8 print:px-6 print:py-4">
          <header className="flex flex-wrap items-start justify-between gap-5 border-b pb-5">
            <div>
              <img src={logo.url} alt={site} className="h-8 max-w-[180px] object-contain object-left" />
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <h1 className="text-2xl font-bold text-invoice-heading">INVOICE</h1>
                <span className={`rounded px-2.5 py-1.5 text-[9px] font-bold ${staged && inv.status !== "cancelled" ? "bg-sky/15 text-navy-2" : badge}`}>{staged && inv.status !== "cancelled" && inv.status !== "draft" ? paymentKind(payment.stage).toUpperCase() : statusLabel[inv.status]}</span>
              </div>
              <p className="mt-2 text-sm font-bold break-all">{inv.invoice_number}</p>
              <div className="mt-2 flex flex-wrap justify-end gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                <p><b>Tanggal:</b> {tanggal(inv.created_at)}</p>
                <p><b>Jatuh Tempo:</b> {tanggal(inv.due_date)}</p>
              </div>
            </div>
          </header>

          <section className="grid gap-6 py-7 sm:grid-cols-2 print:grid-cols-2">
            <div className="min-w-0 space-y-1 text-[11px] leading-relaxed break-words">
              <p className="mb-2 text-[9px] font-bold uppercase text-muted-foreground">Dari:</p>
              <p className="font-bold">{site}</p>
              <div className="flex flex-wrap gap-x-3"><span>{s.contact_email}</span><span>{s.contact_whatsapp}</span></div>
              <p className="whitespace-pre-line">{s.contact_address}</p>
            </div>
            <div className="min-w-0 space-y-1 text-[11px] leading-relaxed break-words">
              <p className="mb-2 text-[9px] font-bold uppercase text-muted-foreground">Kepada:</p>
              <p className="font-bold">{inv.buyer_name}</p>
              <div className="flex flex-wrap gap-x-3"><span>{inv.buyer_email}</span><span>{inv.buyer_wa}</span></div>
              {inv.buyer_address && <p className="whitespace-pre-line">{inv.buyer_address}</p>}
            </div>
          </section>

          {items[0] && <div className="mb-4 rounded bg-muted px-3 py-3 text-sm font-bold break-words">{settlement ? `Pelunasan kontrak #${inv.parent_invoice_number ?? ""} (Termin 1)` : items[0].name}</div>}
          {settlement && <div className="mb-3 rounded bg-muted px-3 py-3 text-[11px]"><p className="font-bold text-navy-2">Rincian Invoice Utama</p><p className="mt-1 text-muted-foreground">Invoice: {inv.parent_invoice_number} — {items[0]?.name}</p></div>}

          <table className="w-full table-fixed border text-[10px] sm:text-[11px]">
            <thead className="bg-invoice-ink text-navy-foreground">
              <tr className="text-left text-[9px] font-bold uppercase">
                <th className="w-[39%] border-r border-navy-foreground/30 px-2 py-3">Item</th>
                <th className="w-[23%] border-r border-navy-foreground/30 px-2 py-3">Harga</th>
                <th className="w-[9%] border-r border-navy-foreground/30 px-1.5 py-3">Qty</th>
                <th className="w-[29%] px-2 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b">
                   <td className="border-r px-2 py-3 font-semibold break-words">{it.name}</td>
                   <td className="border-r px-2 py-3 break-words">{rupiah(it.price)}</td>
                   <td className="border-r px-1.5 py-3">{it.qty}</td>
                   <td className="px-2 py-3 text-right break-words">{rupiah(it.qty * it.price)}</td>
                </tr>
              ))}
               <tr className="border-b border-invoice-ink">
                 <td colSpan={3} className="border-r px-2 py-2.5 text-right font-bold">Subtotal</td>
                 <td className="px-2 py-2.5 text-right break-words">{rupiah(payment.total)}</td>
              </tr>
               <tr className="border-b border-invoice-ink bg-muted">
                 <td colSpan={3} className="border-r px-2 py-3 text-right text-sm font-bold">{staged ? "TOTAL INVOICE UTAMA" : "TOTAL"}</td>
                 <td className="px-2 py-3 text-right text-xs font-bold break-words sm:text-sm">{rupiah(payment.total)}</td>
              </tr>
              {staged && <>
                <tr className="border-b bg-invoice-warning text-invoice-warning-foreground"><td colSpan={3} className="border-r px-2 py-3 text-right font-bold">{settlement ? "DP Dibayarkan" : "DP Termin 1/2"} ({percentage(payment.dpPercent)}%)</td><td className="px-2 py-3 text-right font-bold">{settlement || paid ? "− " : ""}{rupiah(payment.dp)}</td></tr>
                {settlement && <tr className="border-b bg-invoice-warning text-primary-strong"><td colSpan={3} className="border-r px-2 py-3 text-right font-bold">Pembayaran Termin Ini (2/2){!paid ? " — Belum Dibayar" : ""}</td><td className="px-2 py-3 text-right font-bold">{paid ? "− " : ""}{rupiah(payment.current)}</td></tr>}
                <tr className="border-b bg-secondary"><td colSpan={3} className="border-r px-2 py-3 text-right font-bold text-navy-2">{payment.remaining === 0 ? "Status Pembayaran" : "Sisa Pembayaran"}</td><td className={`px-2 py-3 text-right font-bold ${payment.remaining === 0 ? "text-success" : "text-invoice-ink"}`}>{payment.remaining === 0 ? "LUNAS" : rupiah(payment.remaining)}</td></tr>
              </>}
            </tbody>
          </table>
          {(paid || staged) && inv.status !== "cancelled" && <div className="mt-3.5 flex justify-end"><span className={`rounded-full px-3 py-2 text-[9px] font-bold ${staged ? "bg-sky/15 text-navy-2" : "bg-success/15 text-success"}`}>{staged ? `${paymentKind(payment.stage).toUpperCase()} (${percentage(payment.percent)}%)${!paid ? " — BELUM DIBAYAR" : ""}` : "FULL PAYMENT"}</span></div>}

          {bankList.length > 0 && (
            <section className="mt-5 border-t-2 border-dashed pt-5">
              <h2 className="mb-3 text-xs font-bold">Pembayaran dapat dilakukan ke:</h2>
              <div className="grid gap-2.5 sm:grid-cols-2 print:grid-cols-2">
                {bankList.map((b, i) => (
                  <div key={i} className="min-w-0 rounded border bg-muted px-3 py-3">
                    <p className="text-[11px] font-bold uppercase">{b[0]}</p>
                    {b[1] && <div className="mt-1.5 flex items-center gap-2"><span className="font-mono text-[11px] font-semibold break-all">{b[1]}</span><Button size="icon" variant="ghost" className="no-print h-6 w-6 shrink-0 rounded bg-sky text-primary-foreground hover:bg-sky/90 hover:text-primary-foreground" title={`Salin nomor rekening ${b[0]}`} aria-label={`Salin nomor rekening ${b[0]}`} onClick={async () => { try { await navigator.clipboard.writeText(b[1]); toast.success("Nomor rekening disalin"); } catch { toast.error("Nomor rekening tidak dapat disalin"); } }}><Copy className="size-3" /></Button></div>}
                    {b.slice(2).map((l, j) => <p key={j} className="mt-1 text-[10px] text-muted-foreground break-words">{l}</p>)}
                  </div>
                ))}
              </div>
              {!paid && inv.status !== "cancelled" && (
                <div className="mt-2.5 rounded border-l-[3px] border-primary bg-invoice-warning px-3 py-2.5 text-[10px] leading-relaxed text-invoice-warning-foreground">
                  Lakukan pembayaran senilai <b>{rupiah(inv.amount)}</b> ke salah satu nomor rekening di atas. Batas pembayaran: <b>{tanggal(inv.due_date)}</b>
                </div>
              )}
            </section>
          )}

          <footer className="mt-7 border-t pt-5 text-center text-[11px] text-muted-foreground">
            <p>Terima kasih atas kepercayaan Anda.</p>
            <p className="mt-1.5 text-invoice-heading">{site}</p>
          </footer>
        </div>
        <div className="no-print mt-4 flex flex-wrap justify-center gap-2 pb-4">
          {!preview && <Button variant="outline" size="sm" className="rounded" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); toast.success("Link invoice disalin"); } catch { toast.error("Link tidak dapat disalin"); } }}><Copy /> Salin Link</Button>}
          <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded"><Download /> Download PDF</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded"><Printer /> Cetak</Button>
          {!preview && !paid && inv.status !== "cancelled" && wa && <Button asChild size="sm" className="rounded"><a href={waLink(wa, `Halo admin Dimaloka, saya ingin konfirmasi pembayaran invoice ${inv.invoice_number} sebesar ${rupiah(inv.amount)}.`)} target="_blank" rel="noreferrer"><MessageCircle /> Konfirmasi Pembayaran</a></Button>}
        </div>
      </div>
    </div>
  );
}
