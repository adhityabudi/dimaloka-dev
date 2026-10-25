import hero from "@/assets/hero.png";

export const HOMEPAGE_KEY = "homepage_page";
export type ClientLogo = { id: string; name: string; image: string };
export type HomepageContent = {
  eyebrow: string; title: string; title_accent: string; description: string; hero_image: string; hero_alt: string;
  primary_button: string; secondary_button: string; wa_message: string; highlights: string[];
  clients_title: string; clients: ClientLogo[];
  services_eyebrow: string; services_title: string; products_eyebrow: string; products_title: string;
  steps_eyebrow: string; steps_title: string; steps: { title: string; text: string }[];
  testimonials_eyebrow: string; testimonials_title: string; blog_title: string; blog_button: string;
  cta_title: string; cta_text: string; cta_button: string; cta_message: string;
  visible: { clients: boolean; services: boolean; products: boolean; steps: boolean; testimonials: boolean; blog: boolean; cta: boolean };
};
export const homepageDefaults: HomepageContent = {
  eyebrow: "Marketplace jasa digital #1 untuk UMKM", title: "Semua jasa digital bisnis Anda,", title_accent: "di satu tempat.",
  description: "Website, desain, iklan, SEO, aplikasi, hingga video — dikerjakan brand terkurasi dengan harga transparan dan invoice resmi.",
  hero_image: hero, hero_alt: "Ilustrasi layanan digital Dimaloka", primary_button: "Konsultasi Disini", secondary_button: "Lihat Layanan", wa_message: "Halo Dimaloka, saya ingin konsultasi.",
  highlights: ["Brand terverifikasi", "Invoice resmi", "Rating 4.9/5"],
  clients_title: "Brand & Mitra", clients: ["Kopi Senja", "Tokoku.id", "Batik Nusa", "Rumah Kreatif", "UMKM Maju", "Laris Store"].map((name, i) => ({ id: `example-${i}`, name, image: "" })),
  services_eyebrow: "Layanan", services_title: "Temukan jasa yang Anda butuhkan", products_eyebrow: "Layanan Populer", products_title: "Paling banyak dipesan minggu ini",
  steps_eyebrow: "Cara Order", steps_title: "Cara order dalam 4 langkah", steps: [
    { title: "Pilih Layanan", text: "Jelajahi layanan sesuai kebutuhan bisnis Anda." },
    { title: "Lihat Detail", text: "Bandingkan paket, fitur, dan harga setiap layanan." },
    { title: "Kontak Seller", text: "Diskusikan kebutuhan langsung via chat WhatsApp." },
    { title: "Bayar & Akses", text: "Terima invoice resmi, bayar, dan proyek dimulai." },
  ], testimonials_eyebrow: "Testimoni", testimonials_title: "Apa kata mereka", blog_title: "Artikel terbaru", blog_button: "Lihat semua",
  cta_title: "Bingung pilih layanan?", cta_text: "Konsultasikan kebutuhan Anda gratis bersama tim Dimaloka via WhatsApp.", cta_button: "Konsultasi via WhatsApp", cta_message: "Halo Dimaloka, saya ingin konsultasi layanan.",
  visible: { clients: true, services: true, products: true, steps: true, testimonials: true, blog: true, cta: true },
};

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
export function homepageContent(value: unknown): HomepageContent {
  const raw = object(value);
  const result = { ...homepageDefaults };
  for (const key of Object.keys(homepageDefaults) as (keyof HomepageContent)[]) {
    if (typeof homepageDefaults[key] === "string" && typeof raw[key] === "string") Object.assign(result, { [key]: raw[key] });
  }
  result.highlights = Array.isArray(raw.highlights) ? raw.highlights.filter((x): x is string => typeof x === "string") : [...homepageDefaults.highlights];
  result.clients = Array.isArray(raw.clients) ? raw.clients.flatMap((x, i) => {
    const row = object(x);
    return typeof row.name === "string" ? [{ id: typeof row.id === "string" ? row.id : `client-${i}`, name: row.name, image: typeof row.image === "string" ? row.image : "" }] : [];
  }) : homepageDefaults.clients.map(x => ({ ...x }));
  result.steps = homepageDefaults.steps.map((fallback, i) => {
    const row = object(Array.isArray(raw.steps) ? raw.steps[i] : null);
    return { title: typeof row.title === "string" ? row.title : fallback.title, text: typeof row.text === "string" ? row.text : fallback.text };
  });
  const visible = object(raw.visible);
  result.visible = { ...homepageDefaults.visible };
  for (const key of Object.keys(result.visible) as (keyof HomepageContent["visible"])[]) if (typeof visible[key] === "boolean") result.visible[key] = visible[key];
  return result;
}