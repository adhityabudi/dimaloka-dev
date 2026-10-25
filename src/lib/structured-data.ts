import { jsonLd, pageMeta } from "./site";
import { stripHtml } from "./format";
import { homepageContent, HOMEPAGE_KEY } from "./homepage";
import { LANDING_SLUGS, SERVICE_SLUGS, serviceContent, servicePortfolio, masterPage } from "./services";
import websiteHero from "@/assets/website-profile-mockups.png";

type Entity = Record<string, unknown>;
type Kind = "home" | "directory" | "service" | "product" | "blog" | "article" | "store" | "portfolio" | "servicePortfolio";
type RootData = { origin?: string; layout?: { settings?: Record<string, any> } };

/** Resolve only crawlable HTTP(S) images/links; never serialize unsafe URL schemes. */
export function absoluteUrl(value: unknown, origin: string): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value, origin || undefined);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}
export function keywordList(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((v): v is string => typeof v === "string").map(v => v.trim()).filter(Boolean))] : [];
}
export function serviceOffers(product: any, origin: string): Entity[] {
  const url = absoluteUrl(`/p/${product.slug}`, origin) ?? `/p/${product.slug}`;
  const packages = Array.isArray(product.packages) ? product.packages.filter((p: any) => p && typeof p.name === "string" && Number.isFinite(Number(p.price)) && Number(p.price) > 0) : [];
  const offers = packages.length ? packages : [{ name: product.title, price: product.price }];
  return offers.filter((p: any) => Number.isFinite(Number(p.price)) && Number(p.price) > 0).map((p: any) => ({
    "@type": "Offer", name: p.name, price: Number(p.price), priceCurrency: "IDR", url,
    ...(product.sellers?.name ? { seller: { "@type": "Organization", name: product.sellers.name, url: absoluteUrl(`/store/${product.sellers.slug}`, origin) } } : {}),
  }));
}
export function breadcrumbs(items: { name: string; url: string }[], id: string): Entity {
  return { "@type": "BreadcrumbList", "@id": id, itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })) };
}
function itemList(items: Entity[], id: string): Entity {
  return { "@type": "ItemList", "@id": id, numberOfItems: items.length, itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })) };
}

/** All schema is derived during SSR/navigation from the same records used to render the page. */
export function publicPageHead(kind: Kind, data: any, root: RootData = {}) {
  const origin = root.origin ?? "";
  const settings = root.layout?.settings ?? {};
  const link = (path: string) => absoluteUrl(path, origin) ?? path;
  const orgId = link("/#organization");
  const websiteId = link("/#website");
  const organization: Entity = { "@type": "Organization", "@id": orgId, name: settings.site_name || "Dimaloka", url: link("/") };
  const social = Object.values(settings.social_links ?? {}).map(value => absoluteUrl(value, origin)).filter(Boolean);
  if (social.length) organization.sameAs = [...new Set(social)];
  // Use only identity already visible on the site; no invented reviews or business claims.
  if (settings.footer_about) organization.description = stripHtml(settings.footer_about);
  const graph: Entity[] = [organization, { "@type": "WebSite", "@id": websiteId, url: link("/"), name: settings.site_name || "Dimaloka", inLanguage: "id-ID", publisher: { "@id": orgId } }];
  let path = "/", name = "Dimaloka", title = "Dimaloka", description = "", image: string | undefined;
  let keywords: string[] = [], pageType = "WebPage", entity: Entity | undefined, items: Entity[] = [];
  let crumbs: { name: string; url: string }[] = [{ name: "Beranda", url: link("/") }];
  let dates: Entity = {};
  const cards = (products: any[] = []) => products.map(p => ({ "@type": "Service", name: p.title, description: p.short_description || undefined, url: link(`/p/${p.slug}`), image: absoluteUrl(p.cover_image, origin) }));

  if (kind === "home") {
    const c = homepageContent(settings[HOMEPAGE_KEY]);
    name = `${c.title} ${c.title_accent}`.trim(); title = settings.global_seo_title || "Dimaloka — Marketplace Jasa Digital";
    description = settings.global_seo_description || c.description; keywords = keywordList(settings.global_keywords); image = c.hero_image;
    if (c.visible.services) items.push(...(data?.categories ?? []).map((c: any) => ({ "@type": "Service", name: c.name, description: c.description, url: link(`/layanan/${c.slug}`) })));
    if (c.visible.products) items.push(...cards(data?.products));
  } else if (kind === "directory") {
    path = "/layanan"; name = "Layanan Digital"; title = "Cari Layanan Digital | Dimaloka";
    description = "Temukan layanan website, desain grafis, digital marketing, SEO, aplikasi mobile, dan video sesuai kebutuhan bisnis Anda di Dimaloka.";
    pageType = "CollectionPage"; items = cards(data);
  } else if (kind === "service") {
    const c = data.category;
    const content = LANDING_SLUGS.find(s => s === c.slug);
    const landing = content ? serviceContent(content, data.landing?.content) : undefined;
    path = `/layanan/${c.slug}`; name = landing?.title || (c.slug === "website" ? "Jasa Pembuatan Website Company Profile" : c.name);
    title = c.seo_title || `${c.name} | Dimaloka`; description = c.seo_description || landing?.description || c.description || "";
    keywords = keywordList(c.keywords); image = landing?.hero_image || (c.slug === "website" ? websiteHero : undefined);
    pageType = "CollectionPage"; items = cards(data.products);
    entity = { "@type": "Service", name, description: landing?.description || c.description || description, serviceType: c.name, provider: { "@id": orgId }, offers: (data.products ?? []).flatMap((p: any) => serviceOffers(p, origin)) };
  } else if (kind === "product") {
    const p = data.product;
    path = `/p/${p.slug}`; name = p.title; title = p.seo_title || p.title; description = p.seo_description || p.short_description || stripHtml(p.description || "");
    keywords = keywordList(p.keywords); image = p.gallery?.length ? p.gallery[0] : p.cover_image;
    const images = (p.gallery?.length ? p.gallery : [p.cover_image]).map((value: unknown) => absoluteUrl(value, origin)).filter(Boolean);
    entity = { "@type": "Service", name: p.title, description: p.short_description || description, serviceType: p.categories?.name, image: images.length ? images : undefined, offers: serviceOffers(p, origin), provider: p.sellers?.name ? { "@type": "Organization", name: p.sellers.name, url: link(`/store/${p.sellers.slug}`), logo: absoluteUrl(p.sellers.logo_url, origin) } : { "@id": orgId } };
    if (p.categories) crumbs.push({ name: p.categories.name, url: link(`/layanan/${p.categories.slug}`) });
  } else if (kind === "blog") {
    path = "/blog"; name = "Wawasan untuk bisnis digital Anda"; title = "Blog Dimaloka — Tips Bisnis & Digital Marketing";
    description = "Kumpulan artikel seputar pembuatan website, SEO, desain, dan digital marketing untuk membantu bisnis Anda tumbuh di era digital bersama Dimaloka.";
    pageType = "CollectionPage"; items = (data ?? []).map((a: any) => ({ "@type": "BlogPosting", headline: a.title, description: a.excerpt, url: link(`/blog/${a.slug}`), image: absoluteUrl(a.cover_image, origin), datePublished: a.published_at || undefined }));
  } else if (kind === "article") {
    const a = data.article;
    path = `/blog/${a.slug}`; name = a.title; title = a.seo_title || a.title; description = a.seo_description || a.excerpt || "";
    keywords = keywordList([a.focus_keyword, ...(a.keywords ?? [])]); image = a.cover_image;
    dates = { datePublished: a.published_at || undefined, dateModified: a.updated_at || undefined };
    entity = { "@type": "BlogPosting", headline: a.title, description, image: absoluteUrl(a.cover_image, origin), author: { "@type": a.author && a.author !== "Dimaloka" && a.author !== "Tim Dimaloka" ? "Person" : "Organization", name: a.author || "Tim Dimaloka" }, publisher: { "@id": orgId }, ...dates };
    crumbs.push({ name: "Blog", url: link("/blog") });
  } else if (kind === "store") {
    const s = data.seller;
    path = `/store/${s.slug}`; name = s.name; title = `${s.name} — Toko Jasa di Dimaloka`; description = s.description || `Lihat layanan ${s.name} di Dimaloka.`;
    pageType = "CollectionPage"; image = s.logo_url; items = cards(data.products);
    entity = { "@type": "Organization", name: s.name, description: s.description || undefined, logo: absoluteUrl(s.logo_url, origin), url: link(path) };
  } else if (kind === "portfolio") {
    const m = masterPage(data?.master);
    path = "/portfolio"; name = m.title; title = m.seo_title; description = m.seo_description; keywords = keywordList(m.keywords); pageType = "CollectionPage";
    items = SERVICE_SLUGS.map(slug => { const p = servicePortfolio(slug, data?.services?.[slug]); return { "@type": "CollectionPage", name: p.card_title, description: p.card_description, image: absoluteUrl(p.card_image, origin), url: link(`/portfolio/${slug}`) }; });
  } else {
    const p = servicePortfolio(data.slug, data.value);
    path = `/portfolio/${data.slug}`; name = p.title; title = p.seo_title; description = p.seo_description; keywords = keywordList(p.keywords); image = p.cover_image; pageType = "CollectionPage";
    // Only the first six published works are rendered initially, never unpublished admin records.
    items = p.projects.filter(p => p.published).slice(0, 6).map(p => ({ "@type": "CreativeWork", name: p.title, description: p.description, image: absoluteUrl(p.image, origin), genre: p.category, ...(p.is_demo ? { creativeWorkStatus: "Concept" } : {}) }));
    crumbs.push({ name: "Portfolio", url: link("/portfolio") });
  }
  const url = link(path), pageId = `${url}#webpage`;
  const page: Entity = { "@type": pageType, "@id": pageId, url, name, description, inLanguage: "id-ID", isPartOf: { "@id": websiteId }, publisher: { "@id": orgId }, keywords: keywords.length ? keywords.join(", ") : undefined, ...dates };
  const fullImage = absoluteUrl(image, origin);
  if (fullImage) { page.primaryImageOfPage = { "@type": "ImageObject", url: fullImage }; page.image = fullImage; }
  if (entity) {
    entity["@id"] = `${url}#entity`; entity.url = url; entity.mainEntityOfPage = { "@id": pageId };
    if (keywords.length) entity.keywords = keywords.join(", ");
    if (fullImage && !entity.image) entity.image = fullImage;
    graph.push(entity); page.mainEntity = { "@id": entity["@id"] };
  }
  if (items.length) {
    const list = itemList(items, `${url}#items`); graph.push(list);
    if (!entity) page.mainEntity = { "@id": list["@id"] }; else page.hasPart = { "@id": list["@id"] };
  }
  if (path !== "/") {
    crumbs.push({ name, url }); const breadcrumb = breadcrumbs(crumbs, `${url}#breadcrumb`);
    graph.push(breadcrumb); page.breadcrumb = { "@id": breadcrumb["@id"] };
  }
  graph.push(page);
  return {
    meta: [...pageMeta({ title, description, image, type: kind === "article" ? "article" : "website", path: url }),
      ...(keywords.length ? [{ name: "keywords", content: keywords.join(", ") }] : []),
      { name: "robots", content: "index, follow, max-image-preview:large" },
      ...(kind === "article" && dates.datePublished ? [{ property: "article:published_time", content: String(dates.datePublished) }, { property: "article:modified_time", content: String(dates.dateModified ?? dates.datePublished) }] : [])],
    links: [{ rel: "canonical", href: url }],
    scripts: [jsonLd({ "@context": "https://schema.org", "@graph": graph })],
  };
}