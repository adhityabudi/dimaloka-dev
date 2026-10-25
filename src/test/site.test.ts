import { describe, expect, it } from "vitest";
import { searchConsoleToken } from "@/lib/site";

describe("Search Console token", () => {
  const TOKEN = "GhmEF-TzrvPQLel8NOvbZO0489aUDafTCKRwIAZlSa8";

  it("keeps a bare token as-is", () => {
    expect(searchConsoleToken(TOKEN)).toBe(TOKEN);
    expect(searchConsoleToken(`  ${TOKEN}  `)).toBe(TOKEN);
  });

  it("extracts the content value from a pasted meta tag", () => {
    expect(searchConsoleToken(`<meta name="google-site-verification" content="${TOKEN}" />`)).toBe(TOKEN);
    expect(searchConsoleToken(`<meta content='${TOKEN}' name='google-site-verification'>`)).toBe(TOKEN);
  });

  it("returns empty when nothing usable is stored", () => {
    expect(searchConsoleToken("")).toBe("");
    expect(searchConsoleToken("   ")).toBe("");
    expect(searchConsoleToken(null)).toBe("");
    expect(searchConsoleToken(undefined)).toBe("");
  });
});
