import { describe, expect, it } from "vitest";
import { catalogVisible, PRIORITY_SERVICE_SLUGS } from "@/lib/catalog-visibility";

describe("service and product activation", () => {
  const active = new Set(["website"]);
  it("focuses on the six requested services", () => {
    expect([...PRIORITY_SERVICE_SLUGS]).toEqual(["website-custom", "website-company-profile", "web-toko-online", "seo", "facebook-ads", "google-ads"]);
  });
  it("hides disabled products without unpublishing them", () => {
    expect(catalogVisible({ status: "published", is_active: false, category_id: "website" }, active)).toBe(false);
  });
  it("hides products of disabled services", () => {
    expect(catalogVisible({ status: "published", is_active: true, category_id: "design" }, active)).toBe(false);
  });
  it("restores published products when both switches are enabled", () => {
    expect(catalogVisible({ status: "published", is_active: true, category_id: "website" }, active)).toBe(true);
  });
  it("does not publish drafts by enabling them", () => {
    expect(catalogVisible({ status: "draft", is_active: true, category_id: "website" }, active)).toBe(false);
  });
});