import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";

function pub() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type Settings = Record<string, any>;
async function settings(sb: ReturnType<typeof pub>): Promise<Settings> {
  const { data } = await sb.from("site_settings").select("key,value");
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
}

const productCard = "id,slug,title,short_description,cover_image,price,is_featured,tags,sellers(name,slug),categories(name,slug)";

export const getServiceDirectory = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await pub().from("products").select(productCard).eq("status", "published").order("title");
  if (error) throw new Error("Layanan belum dapat dimuat. Silakan coba kembali.");
  return data ?? [];
});

export const getLayoutData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = pub();
  const [s, cats] = await Promise.all([
    settings(sb),
    sb.from("categories").select("id,slug,name,icon").order("sort_order"),
  ]);
  return { settings: s, categories: cats.data ?? [] };
});

export const getHome = createServerFn({ method: "GET" }).handler(async () => {
  const sb = pub();
  const [cats, products, testi, sellers, articles, prodCounts] = await Promise.all([
    sb.from("categories").select("id,slug,name,icon,description").order("sort_order"),
    sb.from("products").select(productCard).eq("status", "published").order("is_featured", { ascending: false }).order("created_at", { ascending: false }).limit(8),
    sb.from("testimonials").select("*").order("sort_order"),
    sb.from("sellers").select("id,name,slug,logo_url"),
    sb.from("articles").select("slug,title,excerpt,cover_image,published_at").eq("status", "published").order("published_at", { ascending: false }).limit(3),
    sb.from("products").select("category_id,is_featured").eq("status", "published"),
  ]);
  const hot = new Set((prodCounts.data ?? []).filter((p) => p.is_featured).map((p) => p.category_id));
  const count: Record<string, number> = {};
  (prodCounts.data ?? []).forEach((p) => p.category_id && (count[p.category_id] = (count[p.category_id] ?? 0) + 1));
  return {
    categories: (cats.data ?? []).map((c) => ({ ...c, hot: hot.has(c.id), count: count[c.id] ?? 0 })),
    products: products.data ?? [],
    testimonials: testi.data ?? [],
    sellers: sellers.data ?? [],
    articles: articles.data ?? [],
  };
});

export const getCategory = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = pub();
    const { data: cat } = await sb.from("categories").select("*").eq("slug", data.slug).maybeSingle();
    if (!cat) return null;
    const { data: products } = await sb.from("products").select(productCard).eq("category_id", cat.id).eq("status", "published").order("is_featured", { ascending: false });
    return { category: cat, products: products ?? [] };
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = pub();
    const { data: p } = await sb.from("products").select("*, sellers(name,slug,logo_url,whatsapp,description), categories(name,slug)").eq("slug", data.slug).eq("status", "published").maybeSingle();
    if (!p) return null;
    const [{ data: related }, { data: reviews }] = await Promise.all([
      sb.from("products").select(productCard).eq("status", "published").eq("category_id", p.category_id!).neq("id", p.id).limit(4),
      sb.from("testimonials").select("*").order("sort_order").limit(3),
    ]);
    return { product: p, related: related ?? [], reviews: reviews ?? [] };
  });

export const getStore = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = pub();
    const { data: s } = await sb.from("sellers").select("*").eq("slug", data.slug).maybeSingle();
    if (!s) return null;
    const { data: products } = await sb.from("products").select(productCard).eq("seller_id", s.id).eq("status", "published");
    return { seller: s, products: products ?? [] };
  });

export const listArticles = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await pub().from("articles").select("slug,title,excerpt,cover_image,published_at,author,categories(name)").eq("status", "published").order("published_at", { ascending: false });
  return data ?? [];
});

export const getPortfolio = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await pub().from("site_settings").select("value").eq("key", "portfolio_page").maybeSingle();
  if (error) throw new Error("Portfolio belum dapat dimuat. Silakan coba kembali.");
  return data?.value ?? null;
});

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = pub();
    const { data: a } = await sb.from("articles").select("*, categories(name,slug)").eq("slug", data.slug).eq("status", "published").maybeSingle();
    if (!a) return null;
    const { data: related } = await sb.from("articles").select("slug,title,cover_image,published_at").eq("status", "published").neq("id", a.id).limit(3);
    return { article: a, related: related ?? [] };
  });

export const getInvoice = createServerFn({ method: "GET" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.token)) return null;
    const sb = pub();
    const [{ data: rows }, s] = await Promise.all([sb.rpc("get_invoice_by_token_v2", { _token: data.token }), settings(sb)]);
    const inv = rows?.[0];
    if (!inv) return null;
    return { invoice: inv, settings: s };
  });

export const getSitemapData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = pub();
  const [c, p, s, a, st] = await Promise.all([
    sb.from("categories").select("slug,created_at"),
    sb.from("products").select("slug,updated_at").eq("status", "published"),
    sb.from("sellers").select("slug,created_at"),
    sb.from("articles").select("slug,updated_at").eq("status", "published"),
    settings(sb),
  ]);
  return { categories: c.data ?? [], products: p.data ?? [], sellers: s.data ?? [], articles: a.data ?? [], settings: st };
});

const SERVICE_KEYS = ["website", "desain-grafis", "digital-marketing", "seo", "aplikasi", "video"];
const pfKey = (slug: string) => slug === "website" ? "portfolio_page" : `portfolio_${slug}`;

export const getServicePortfolio = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => {
    if (!SERVICE_KEYS.includes(d.slug)) throw new Error("Layanan tidak ditemukan");
    return d;
  })
  .handler(async ({ data }) => {
    const { data: row, error } = await pub().from("site_settings").select("value").eq("key", pfKey(data.slug)).maybeSingle();
    if (error) throw new Error("Portfolio belum dapat dimuat. Silakan coba kembali.");
    return row?.value ?? null;
  });

export const getPortfolioOverview = createServerFn({ method: "GET" }).handler(async () => {
  const keys = ["portfolio_master", ...SERVICE_KEYS.map(pfKey)];
  const { data, error } = await pub().from("site_settings").select("key,value").in("key", keys);
  if (error) throw new Error("Portfolio belum dapat dimuat. Silakan coba kembali.");
  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value])) as Record<string, Json>;
  return { master: map.portfolio_master ?? null, services: Object.fromEntries(SERVICE_KEYS.map(s => [s, map[pfKey(s)] ?? null])) as Record<string, Json> };
});

export const getServiceContent = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => {
    if (!SERVICE_KEYS.includes(d.slug)) throw new Error("Layanan tidak ditemukan");
    return d;
  })
  .handler(async ({ data }) => {
    const { data: rows, error } = await pub().from("site_settings").select("key,value").in("key", [`service_${data.slug}`, pfKey(data.slug)]);
    if (error) throw new Error("Halaman layanan belum dapat dimuat.");
    const map = Object.fromEntries((rows ?? []).map(r => [r.key, r.value])) as Record<string, Json>;
    return { content: map[`service_${data.slug}`] ?? null, portfolio: map[pfKey(data.slug)] ?? null };
  });
