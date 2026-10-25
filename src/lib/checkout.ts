import { splitPayment } from "@/lib/invoice-payments";

export type CheckoutProduct = { title: string; price: number | string; packages?: unknown };
export type CheckoutPackage = { name: string; price: number; items?: string[] };

export const ORDER_STATUS = [
  { v: "awaiting_payment", l: "Menunggu Pembayaran" },
  { v: "paid", l: "Dibayar" },
  { v: "in_progress", l: "Dikerjakan" },
  { v: "revision", l: "Revisi" },
  { v: "completed", l: "Selesai" },
  { v: "cancelled", l: "Dibatalkan" },
  { v: "new", l: "Baru (manual)" },
  { v: "contacted", l: "Dihubungi" },
] as const;

export function orderStatusLabel(s: string) {
  return ORDER_STATUS.find((x) => x.v === s)?.l ?? s;
}

export function productPackages(p: CheckoutProduct): CheckoutPackage[] {
  return Array.isArray(p.packages) ? (p.packages as CheckoutPackage[]).filter((k) => k && typeof k.name === "string") : [];
}

/** Price always comes from the stored product, never from the browser. DP is 50% of the total. */
export function checkoutQuote(p: CheckoutProduct, packageName: string | null, stage: "full" | "dp") {
  const pkgs = productPackages(p);
  const pkg = packageName ? pkgs.find((k) => k.name === packageName) : null;
  if (packageName && !pkg) throw new Error("Paket tidak ditemukan");
  if (!packageName && pkgs.length > 0) throw new Error("Pilih paket terlebih dahulu");
  const total = Number(pkg ? pkg.price : p.price);
  if (!Number.isFinite(total) || total <= 0) throw new Error("Harga layanan belum tersedia");
  const name = pkg ? `${p.title} — Paket ${pkg.name}` : p.title;
  const dp = stage === "dp" ? splitPayment(total, Math.round(total / 2)).dp : 0;
  return { total, dp, amount: stage === "dp" ? dp : total, items: [{ name, qty: 1, price: total }], packageName: pkg?.name ?? null };
}
