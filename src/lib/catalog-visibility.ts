export type CatalogProduct = { status: string; is_active: boolean; category_id?: string | null };

/** Parent services gate new visibility, never historical orders. */
export function catalogVisible(product: CatalogProduct, activeServiceIds: ReadonlySet<string>) {
  return product.status === "published" && product.is_active && (!product.category_id || activeServiceIds.has(product.category_id));
}

export const PRIORITY_SERVICE_SLUGS = ["website-custom", "website-company-profile", "web-toko-online", "seo", "facebook-ads", "google-ads"] as const;