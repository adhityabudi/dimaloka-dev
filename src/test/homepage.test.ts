import { describe, expect, it } from "vitest";
import { homepageContent } from "@/lib/homepage";
describe("homepage settings normalization", () => {
  it("handles absent and malformed saved content", () => {
    expect(homepageContent(null).steps).toHaveLength(4);
    expect(homepageContent({ clients: [null, {}], steps: [null] }).clients).toEqual([]);
    expect(homepageContent({ steps: [null] }).steps).toHaveLength(4);
  });
  it("preserves saved client order and images", () => {
    const clients = [{ id: "b", name: "B", image: "https://example.com/b.png" }, { id: "a", name: "A", image: "" }];
    expect(homepageContent({ clients }).clients).toEqual(clients);
  });
  it("preserves deliberately hidden sections", () => {
    expect(homepageContent({ visible: { clients: false, blog: false } }).visible.clients).toBe(false);
    expect(homepageContent({ visible: { clients: false, blog: false } }).visible.blog).toBe(false);
    expect(homepageContent({ visible: { clients: false } }).visible.services).toBe(true);
  });
});