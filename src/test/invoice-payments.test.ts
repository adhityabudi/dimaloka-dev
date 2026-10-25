import { describe, expect, it } from "vitest";
import { paymentSummary, splitPayment } from "@/lib/invoice-payments";

describe("Invoice payments", () => {
  it("full payment receives the entire invoice when paid", () => {
    expect(paymentSummary({ amount: 2500000, status: "paid" })).toMatchObject({ received: 2500000, remaining: 0, percent: 100 });
  });
  it("two stages split 5 million into DP and settlement", () => {
    expect(splitPayment(5000000, 2500000)).toEqual({ dp: 2500000, settlement: 2500000 });
  });
  it("paid DP is not a fully paid contract", () => {
    expect(paymentSummary({ amount: 2500000, contract_total: 5000000, dp_amount: 2500000, payment_stage: "dp", status: "paid" })).toMatchObject({ received: 2500000, remaining: 2500000, percent: 50 });
  });
  it("unpaid settlement only counts the paid DP", () => {
    expect(paymentSummary({ amount: 2500000, contract_total: 5000000, dp_amount: 2500000, payment_stage: "settlement", status: "sent" })).toMatchObject({ received: 2500000, remaining: 2500000 });
  });
  it("paid settlement completes the contract", () => {
    expect(paymentSummary({ amount: 2500000, contract_total: 5000000, dp_amount: 2500000, payment_stage: "settlement", status: "paid" })).toMatchObject({ received: 5000000, remaining: 0, percent: 100 });
  });
  it("DP can use a different amount than the example", () => {
    expect(splitPayment(5000000, 1500000).settlement).toBe(3500000);
    expect(() => splitPayment(5000000, 5000000)).toThrow();
  });
});