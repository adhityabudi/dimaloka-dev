export function rupiah(n: number | string | null | undefined) {
  const v = Number(n ?? 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function tanggal(d: string | Date | null | undefined) {
  if (!d) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(d));
}

export function waLink(phone: string | null | undefined, text: string) {
  const p = (phone ?? "").replace(/\D/g, "").replace(/^0/, "62");
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}

export function invoiceNumber(date: Date, seq: number) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `INV-${y}${m}-${String(seq).padStart(4, "0")}`;
}

export function stripHtml(html: string | null | undefined) {
  return (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
