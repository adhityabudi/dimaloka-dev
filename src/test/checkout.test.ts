import { describe, expect, it } from "vitest";
import { checkoutQuote } from "@/lib/checkout";
import { liveUrl } from "@/lib/portfolio";

const product = { title: "Website", price: 1000000, packages: [{ name: "Basic", price: 2000000 }, { name: "Pro", price: 5000000 }] };

describe("Checkout", () => {
  it("uses the stored package price", () => {
    expect(checkoutQuote(product, "Pro", "full")).toMatchObject({ total: 5000000, amount: 5000000, dp: 0 });
  });
  it("DP is half of the package total", () => {
    expect(checkoutQuote(product, "Pro", "dp")).toMatchObject({ total: 5000000, amount: 2500000, dp: 2500000 });
  });
  it("rejects unknown or missing packages", () => {
    expect(() => checkoutQuote(product, "Hacker", "full")).toThrow();
    expect(() => checkoutQuote(product, null, "full")).toThrow();
  });
  it("products without packages use the base price", () => {
    expect(checkoutQuote({ title: "Logo", price: 750000 }, null, "full").amount).toBe(750000);
  });
});

describe("Cek Live", () => {
  const base = { id: "a", title: "A", category: "c", description: "", image: "", image_alt: "", gallery: [], is_demo: false, published: true, featured: false };
  it("hidden when disabled or url invalid", () => {
    expect(liveUrl({ ...base, url: "https://a.com", live_enabled: false })).toBeNull();
    expect(liveUrl({ ...base, url: "abc" })).toBeNull();
    expect(liveUrl({ ...base, url: "https://a.com", live_enabled: true })).toBe("https://a.com");
  });
});
