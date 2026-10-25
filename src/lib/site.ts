export const SITE_NAME = "Dimaloka";
export const DEFAULT_WA = "6281234567890";

/**
 * Returns the bare Search Console token. Admins often paste the whole <meta>
 * tag into the settings field, so pull its content value out instead of
 * emitting a verification tag Google cannot read.
 */
export function searchConsoleToken(raw: unknown): string {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return "";
  if (s.includes("<")) {
    const m = s.match(/content\s*=\s*(["'])(.*?)\1/i);
    return m?.[2]?.trim() ?? "";
  }
  return s;
}

/** Builds head meta for a public page. */
export function pageMeta(o: { title: string; description: string; image?: string | null; type?: string; path?: string }) {
  const meta: any[] = [
    { title: o.title },
    { name: "description", content: o.description },
    { property: "og:title", content: o.title },
    { property: "og:description", content: o.description },
    { property: "og:type", content: o.type ?? "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: o.title },
    { name: "twitter:description", content: o.description },
  ];
  if (o.path) meta.push({ property: "og:url", content: o.path });
  if (o.image && o.image.startsWith("https://")) {
    meta.push({ property: "og:image", content: o.image }, { name: "twitter:image", content: o.image });
  }
  return meta;
}

export function jsonLd(obj: unknown) {
  return { type: "application/ld+json", children: JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") };
}
