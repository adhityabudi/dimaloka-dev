export function xmlEscape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
export function siteOrigin(configured: unknown, fallback: string) {
  if (typeof configured === "string" && configured.trim()) {
    try { const url = new URL(configured); if (["http:", "https:"].includes(url.protocol)) return url.origin; } catch { /* Fall back to the request origin. */ }
  }
  return new URL(fallback).origin;
}