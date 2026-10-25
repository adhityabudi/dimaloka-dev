import aruna from "@/assets/portfolio-aruna.jpg";
import lumiere from "@/assets/portfolio-lumiere.jpg";
import nusa from "@/assets/portfolio-nusa.jpg";

export type PortfolioProject = {
  id: string; title: string; category: string; description: string;
  image: string; image_alt: string; gallery: string[]; url: string; live_enabled?: boolean;
  is_demo: boolean; published: boolean; featured: boolean;
};
export type PortfolioPage = {
  eyebrow: string; title: string; description: string; cover_image: string;
  seo_title: string; seo_description: string; keywords: string[];
  section_title: string; section_description: string; section_button: string;
  cta_title: string; cta_description: string; cta_button: string;
  categories: string[]; projects: PortfolioProject[];
  card_title: string; card_description: string; card_image: string;
};
export const defaultPortfolio: PortfolioPage = {
  card_title: "Pembuatan Website",
  card_description: "Company profile, toko online, dan website travel yang tertata dan mudah dihubungi.",
  card_image: aruna,
  eyebrow: "Dimaloka · Portfolio Website",
  title: "Portfolio",
  description: "Jelajahi inspirasi desain website company profile, toko online, dan bisnis travel. Temukan tampilan yang sesuai dengan karakter dan kebutuhan bisnis Anda.",
  cover_image: "",
  seo_title: "Portfolio Website Company Profile & Toko Online | Dimaloka",
  seo_description: "Jelajahi portfolio desain website company profile, toko online, dan travel di Dimaloka. Temukan inspirasi website profesional yang sesuai kebutuhan bisnis Anda.",
  keywords: ["portfolio website", "desain website company profile", "website toko online", "jasa pembuatan website"],
  section_title: "Inspirasi website untuk bisnis Anda.",
  section_description: "Lihat pilihan desain company profile, toko online, dan travel sebagai referensi tampilan website perusahaan Anda.",
  section_button: "Lihat semua portfolio",
  cta_title: "Website berikutnya, sesuai karakter bisnis Anda.",
  cta_description: "Diskusikan kebutuhan halaman, fitur, dan tampilan website Anda bersama Dimaloka.",
  cta_button: "Konsultasi Website",
  categories: ["Company Profile", "E-Commerce", "E-Learning", "Travel", "Web App"],
  projects: [
    { id: "aruna", title: "Aruna Studio", category: "Company Profile", description: "Konsep website studio arsitektur dengan galeri proyek, profil perusahaan, dan halaman layanan yang tertata.", image: aruna, image_alt: "Desain website company profile studio arsitektur Aruna pada desktop dan ponsel", gallery: [], url: "", is_demo: true, published: true, featured: true },
    { id: "lumiere", title: "Lumiere Skincare", category: "E-Commerce", description: "Konsep toko online skincare dengan katalog produk dan tampilan editorial yang memperkuat identitas brand.", image: lumiere, image_alt: "Desain toko online skincare Lumiere dengan katalog produk pada desktop dan ponsel", gallery: [], url: "", is_demo: true, published: true, featured: true },
    { id: "nusa", title: "Nusa Journeys", category: "Travel", description: "Konsep website travel dengan pilihan destinasi, informasi perjalanan, dan akses konsultasi yang mudah ditemukan.", image: nusa, image_alt: "Desain website travel Nusa Journeys dengan destinasi wisata dan tampilan ponsel", gallery: [], url: "", is_demo: true, published: true, featured: true },
  ],
};
export function normalizePortfolio(defaults: PortfolioPage, value: unknown): PortfolioPage {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;
  const input = value as Record<string, unknown>;
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof PortfolioPage)[]) {
    if (key === "projects" || key === "categories" || key === "keywords") continue;
    if (typeof input[key] === "string") (result as Record<string, unknown>)[key] = input[key];
  }
  for (const key of ["categories", "keywords"] as const) {
    if (Array.isArray(input[key])) result[key] = input[key].filter((item): item is string => typeof item === "string");
  }
  if (Array.isArray(input.projects)) {
    result.projects = input.projects.filter((item): item is PortfolioProject => !!item && typeof item === "object" && typeof item.id === "string" && typeof item.title === "string" && typeof item.category === "string")
      .map(p => ({ ...p, gallery: Array.isArray(p.gallery) ? p.gallery.filter(image => typeof image === "string") : [] }));
  }
  if (!result.card_image) result.card_image = result.projects.find(p => p.published && p.image)?.image ?? "";
  return result;
}
export function portfolioPage(value: unknown): PortfolioPage { return normalizePortfolio(defaultPortfolio, value); }
export function liveUrl(p: PortfolioProject) {
  return p.live_enabled !== false && validProjectUrl(p.url) ? p.url : null;
}
export function filterPortfolio(projects: PortfolioProject[], category: string, search: string) {
  const query = search.trim().toLocaleLowerCase("id");
  return projects.filter(p => p.published && (category === "Semua" || p.category === category) && `${p.title} ${p.category} ${p.description}`.toLocaleLowerCase("id").includes(query));
}
export function validProjectUrl(url: string) {
  try { return ["https:", "http:"].includes(new URL(url).protocol); } catch { return false; }
}