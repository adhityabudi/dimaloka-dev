import { describe, expect, it } from "vitest";
import { filterServices } from "@/lib/service-search";
const services = [{ title: "Website Company Profile", short_description: "Website perusahaan", categories: { name: "Website" }, tags: ["bisnis"] }, { title: "Logo Bisnis", categories: { name: "Desain Grafis" }, tags: [] }];
describe("service search", () => {
  it("finds services by title regardless of casing", () => { expect(filterServices(services, "COMPANY")).toEqual([services[0]]); });
  it("finds services by their service group", () => { expect(filterServices(services, "desain grafis")).toEqual([services[1]]); });
  it("returns no services when all query terms do not match", () => { expect(filterServices(services, "website logo")).toEqual([]); });
  it("returns all services for an empty query", () => { expect(filterServices(services, "  ")).toEqual(services); });
});