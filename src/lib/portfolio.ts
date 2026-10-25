import aruna from "@/assets/portfolio-aruna.jpg";
import lumiere from "@/assets/portfolio-lumiere.jpg";
import nusa from "@/assets/portfolio-nusa.jpg";

export type PortfolioProject = {
  id: string; title: string; category: string; description: string;
  image: string; image_alt: string; gallery: string[]; url: string;
  is_demo: boolean; published: boolean; featured: boolean;
};
export type PortfolioPage = {
  eyebrow: string; title: string; description: string; cover_image: string;
  seo_title: string; seo_description: string; keywords: string[];
  section_title: string; section_description: string; section_button: string;
  cta_title: string; cta_description: string; cta_button: string;
  categories: string[]; projects: PortfolioProject[];
};
export const defaultPortfolio: PortfolioPage = {
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
export function portfolioPage(value: unknown): PortfolioPage {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaultPortfolio;
  return { ...defaultPortfolio, ...(value as Partial<PortfolioPage>) };
}
export function filterPortfolio(projects: PortfolioProject[], category: string, search: string) {
  const query = search.trim().toLocaleLowerCase("id");
  return projects.filter(p => p.published && (category === "Semua" || p.category === category) && `${p.title} ${p.category} ${p.description}`.toLocaleLowerCase("id").includes(query));
}
export function validProjectUrl(url: string) {
  try { return ["https:", "http:"].includes(new URL(url).protocol); } catch { return false; }
}