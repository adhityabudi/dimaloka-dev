import { describe, expect, it } from "vitest";
import { aiSeoInputSchema, parseAiSeoResult } from "../lib/ai-seo";
import { assertSeoAdmin, readSeoStream } from "../lib/ai-seo.server";

describe("AI SEO recommendations", () => {
  const recommendation = { titles: ["Jasa Website Bisnis | Dimaloka"], descriptions: ["a".repeat(150)], improvements: [{ priority: "tinggi", issue: "Subjudul kurang", suggestion: "Tambahkan subjudul sesuai layanan." }], revised_content: "Konten revisi sesuai fakta awal." };
  it("parses gateway JSON into title, description and content improvements", () => {
    expect(parseAiSeoResult(JSON.stringify(recommendation))).toEqual(recommendation);
  });
  it("rejects recommendations with SEO titles above 60 characters", () => {
    expect(() => parseAiSeoResult(JSON.stringify({ ...recommendation, titles: ["a".repeat(61)] }))).toThrow();
  });
  it("rejects meta descriptions outside 140–160 characters", () => {
    for (const n of [139, 161]) expect(() => parseAiSeoResult(JSON.stringify({ ...recommendation, descriptions: ["a".repeat(n)] }))).toThrow();
  });
  it("requires target keywords alongside page content", () => {
    expect(aiSeoInputSchema.safeParse({ title: "Website", content: "a".repeat(50), keywords: "" }).success).toBe(false);
  });
  it("blocks nonadmin members even when signed in", async () => {
    const client = { rpc: async () => ({ data: false, error: null }) };
    await expect(assertSeoAdmin(client as unknown as Parameters<typeof assertSeoAdmin>[0], "member")).rejects.toThrow("Hanya administrator");
  });
  it("allows verified administrators", async () => {
    const client = { rpc: async () => ({ data: true, error: null }) };
    await expect(assertSeoAdmin(client as unknown as Parameters<typeof assertSeoAdmin>[0], "admin")).resolves.toBeUndefined();
  });
  it("consumes split SSE frames and ignores reasoning", async () => {
    const frames = ['data: {"choices":[{"delta":{"reasoning_content":"thinking"}}]}\n\n', 'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n', 'data: [DONE]\n\n'];
    const bytes = new TextEncoder().encode(frames.join(""));
    const stream = new ReadableStream({ start(controller) { for (let i = 0; i < bytes.length; i += 7) controller.enqueue(bytes.slice(i, i + 7)); controller.close(); } });
    expect(await readSeoStream(new Response(stream))).toBe("Hello");
  });
});