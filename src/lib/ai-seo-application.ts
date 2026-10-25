import { z } from "zod";

export const seoDraftSchema = z.object({
  seo_title: z.string().trim().min(1).max(60),
  seo_description: z.string().trim().min(140).max(160),
  content: z.string().trim().min(1).max(20000),
});
export type SeoDraft = z.infer<typeof seoDraftSchema>;
/** Only HTML revisions replace the editorial intro; legacy plain summaries keep their layout. */
export function serviceRevision(description?: string | null) {
  return description && /<(?:p|h2|h3)[\s>]/i.test(description) ? description : undefined;
}
export function contentToHtml(text: string) {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return text.split(/\n\s*\n/).filter((s) => s.trim()).map((block) => {
    const heading = block.trim().match(/^#{1,3}\s+(.+)$/);
    return heading ? `<h2>${escape(heading[1])}</h2>` : `<p>${escape(block.trim()).replace(/\n/g, "<br>")}</p>`;
  }).join("");
}
export function seoApplication(draft: SeoDraft, kind: "article" | "product" | "category", includeContent: boolean) {
  const valid = seoDraftSchema.parse(draft);
  return {
    seo_title: valid.seo_title, seo_description: valid.seo_description,
    ...(includeContent ? kind === "article" ? { content: contentToHtml(valid.content) } : { description: contentToHtml(valid.content) } : {}),
  };
}