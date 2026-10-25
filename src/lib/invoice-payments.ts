export type PaymentInvoice = { amount: number | string; status: string; payment_stage?: string; contract_total?: number | string | null; dp_amount?: number | string | null };

export function paymentSummary(inv: PaymentInvoice) {
  const stage = inv.payment_stage ?? "full";
  const total = Number(inv.contract_total ?? inv.amount);
  const dp = Number(inv.dp_amount ?? 0);
  const current = Number(inv.amount);
  const received = inv.status === "cancelled" ? 0 : stage === "settlement" ? dp + (inv.status === "paid" ? current : 0) : inv.status === "paid" ? current : 0;
  return { stage, total, dp, current, received, remaining: Math.max(0, total - received), percent: total > 0 ? received / total * 100 : 0, dpPercent: total > 0 ? dp / total * 100 : 0 };
}

export function splitPayment(total: number, dp: number) {
  if (!Number.isFinite(total) || !Number.isFinite(dp) || total <= 0 || dp <= 0 || dp >= total) throw new Error("DP harus lebih dari nol dan kurang dari total kontrak");
  return { dp, settlement: total - dp };
}

export function paymentKind(stage?: string) {
  return stage === "dp" ? "DP 1/2" : stage === "settlement" ? "Pelunasan 2/2" : "Full Payment";
}