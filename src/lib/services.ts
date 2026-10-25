import dgHero from "@/assets/svc-desain-grafis-hero.jpg";
import dgA from "@/assets/svc-desain-grafis-a.jpg";
import dgB from "@/assets/svc-desain-grafis-b.jpg";
import dg1 from "@/assets/pf-desain-grafis-1.jpg";
import dg2 from "@/assets/pf-desain-grafis-2.jpg";
import dg3 from "@/assets/pf-desain-grafis-3.jpg";
import dmHero from "@/assets/svc-digital-marketing-hero.jpg";
import dmA from "@/assets/svc-digital-marketing-a.jpg";
import dmB from "@/assets/svc-digital-marketing-b.jpg";
import dm1 from "@/assets/pf-digital-marketing-1.jpg";
import dm2 from "@/assets/pf-digital-marketing-2.jpg";
import dm3 from "@/assets/pf-digital-marketing-3.jpg";
import seoHero from "@/assets/svc-seo-hero.jpg";
import seoA from "@/assets/svc-seo-a.jpg";
import seoB from "@/assets/svc-seo-b.jpg";
import seo1 from "@/assets/pf-seo-1.jpg";
import seo2 from "@/assets/pf-seo-2.jpg";
import seo3 from "@/assets/pf-seo-3.jpg";
import apHero from "@/assets/svc-aplikasi-hero.jpg";
import apA from "@/assets/svc-aplikasi-a.jpg";
import apB from "@/assets/svc-aplikasi-b.jpg";
import ap1 from "@/assets/pf-aplikasi-1.jpg";
import ap2 from "@/assets/pf-aplikasi-2.jpg";
import ap3 from "@/assets/pf-aplikasi-3.jpg";
import vdHero from "@/assets/svc-video-hero.jpg";
import vdA from "@/assets/svc-video-a.jpg";
import vdB from "@/assets/svc-video-b.jpg";
import vd1 from "@/assets/pf-video-1.jpg";
import vd2 from "@/assets/pf-video-2.jpg";
import vd3 from "@/assets/pf-video-3.jpg";
import { defaultPortfolio, normalizePortfolio, type PortfolioPage, type PortfolioProject } from "./portfolio";

/** Service slugs match category slugs. "website" keeps its own dedicated page. */
export const SERVICE_SLUGS = ["website", "desain-grafis", "digital-marketing", "seo", "aplikasi", "video"] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];
export const LANDING_SLUGS = SERVICE_SLUGS.filter(s => s !== "website") as Exclude<ServiceSlug, "website">[];
export const SERVICE_NAMES: Record<ServiceSlug, string> = {
  website: "Pembuatan Website", "desain-grafis": "Desain Grafis", "digital-marketing": "Digital Marketing", seo: "SEO", aplikasi: "Aplikasi Mobile", video: "Video & Animasi",
};
export const isServiceSlug = (s: string): s is ServiceSlug => (SERVICE_SLUGS as readonly string[]).includes(s);
export const portfolioKey = (slug: ServiceSlug) => slug === "website" ? "portfolio_page" : `portfolio_${slug}`;
export const serviceKey = (slug: string) => `service_${slug}`;
export const MASTER_KEY = "portfolio_master";

const proj = (id: string, title: string, category: string, description: string, image: string, image_alt: string): PortfolioProject =>
  ({ id, title, category, description, image, image_alt, gallery: [], url: "", is_demo: true, published: true, featured: true });

function pf(p: Partial<PortfolioPage> & Pick<PortfolioPage, "eyebrow" | "description" | "seo_title" | "seo_description" | "keywords" | "section_title" | "section_description" | "cta_title" | "cta_description" | "cta_button" | "categories" | "projects" | "card_title" | "card_description" | "card_image">): PortfolioPage {
  return { ...defaultPortfolio, title: `Portfolio ${p.card_title}`, cover_image: "", section_button: "Lihat semua portfolio", ...p };
}

export const portfolioDefaults: Record<ServiceSlug, PortfolioPage> = {
  website: defaultPortfolio,
  "desain-grafis": pf({
    eyebrow: "Dimaloka · Portfolio Desain Grafis", card_title: "Desain Grafis", card_image: dg1,
    card_description: "Logo, identitas brand, konten media sosial, dan kemasan produk.",
    description: "Kumpulan karya logo, identitas brand, konten media sosial, dan kemasan produk. Lihat bagaimana setiap brand ditampilkan dengan karakter visual yang konsisten.",
    seo_title: "Portfolio Desain Grafis, Logo & Branding | Dimaloka",
    seo_description: "Lihat portfolio desain logo, identitas brand, feed Instagram, dan kemasan produk di Dimaloka. Temukan inspirasi visual untuk bisnis Anda.",
    keywords: ["portfolio desain grafis", "desain logo", "branding", "desain kemasan"],
    section_title: "Visual yang membuat brand mudah dikenali.", section_description: "Contoh logo, materi media sosial, dan kemasan yang dirancang sesuai karakter masing-masing usaha.",
    cta_title: "Brand Anda layak tampil lebih rapi.", cta_description: "Ceritakan bisnis dan target pelanggan Anda. Kami bantu menentukan kebutuhan desain yang paling penting.", cta_button: "Konsultasi Desain",
    categories: ["Logo & Branding", "Media Sosial", "Kemasan", "Materi Promosi"],
    projects: [
      proj("roti-senja", "Roti Senja Bakery", "Logo & Branding", "Konsep identitas toko roti: logo, palet warna, tipografi, hingga kantong dan kotak kemasan.", dg1, "Identitas brand toko roti Roti Senja dengan logo, palet warna, dan kemasan"),
      proj("purebloom", "PureBloom Skincare", "Media Sosial", "Konsep feed Instagram skincare dengan tone hijau lembut dan susunan konten yang seragam.", dg2, "Desain feed Instagram brand skincare PureBloom di layar ponsel"),
      proj("summit-coffee", "Summit Coffee Co.", "Kemasan", "Konsep kemasan kopi premium dengan warna navy dan aksen emas untuk rak toko maupun penjualan online.", dg3, "Desain kemasan kopi premium Summit Coffee berwarna navy dan emas"),
    ],
  }),
  "digital-marketing": pf({
    eyebrow: "Dimaloka · Portfolio Digital Marketing", card_title: "Digital Marketing", card_image: dm1,
    card_description: "Kampanye Meta Ads, Google Ads, dan materi iklan untuk berbagai bidang usaha.",
    description: "Contoh kampanye iklan Meta Ads dan Google Ads beserta materi iklan yang digunakan. Setiap kampanye disusun berdasarkan tujuan dan target pasar yang berbeda.",
    seo_title: "Portfolio Digital Marketing & Iklan Online | Dimaloka",
    seo_description: "Lihat portfolio kampanye Meta Ads, Google Ads, dan materi iklan media sosial di Dimaloka. Inspirasi strategi iklan untuk bisnis Anda.",
    keywords: ["portfolio digital marketing", "meta ads", "google ads", "jasa iklan online"],
    section_title: "Kampanye yang disusun dari tujuan bisnis.", section_description: "Lihat contoh materi iklan dan susunan kampanye untuk toko fashion, klinik, dan restoran.",
    cta_title: "Siap menjangkau pelanggan yang lebih tepat?", cta_description: "Sampaikan produk, area pemasaran, dan anggaran Anda. Kami bantu menyusun rencana kampanye awal.", cta_button: "Konsultasi Iklan",
    categories: ["Meta Ads", "Google Ads", "Konten Iklan"],
    projects: [
      proj("lumiere-ads", "Lumière Fashion", "Meta Ads", "Konsep kampanye Instagram dan Facebook untuk brand fashion, dengan beberapa variasi materi iklan.", dm1, "Studi kasus kampanye Meta Ads untuk brand fashion dengan materi iklan di ponsel"),
      proj("bright-dental", "Klinik Gigi Senyum", "Google Ads", "Konsep iklan pencarian untuk klinik gigi yang menargetkan pasien di sekitar lokasi klinik.", dm2, "Iklan pencarian Google untuk klinik gigi beserta grafik performa"),
      proj("harvest-table", "The Harvest Table", "Konten Iklan", "Rangkaian materi stories dan feed untuk promosi menu restoran.", dm3, "Materi iklan stories dan feed restoran pada beberapa layar ponsel"),
    ],
  }),
  seo: pf({
    eyebrow: "Dimaloka · Portfolio SEO", card_title: "SEO", card_image: seo1,
    card_description: "Optimasi toko online, SEO lokal, dan audit teknis website.",
    description: "Contoh pekerjaan optimasi mesin pencari: riset kata kunci, perbaikan halaman, SEO lokal, dan audit teknis untuk berbagai jenis website.",
    seo_title: "Portfolio Jasa SEO & Optimasi Website | Dimaloka",
    seo_description: "Lihat portfolio SEO Dimaloka: optimasi toko online, SEO lokal Google Maps, dan audit teknis website untuk meningkatkan kunjungan organik.",
    keywords: ["portfolio seo", "jasa seo", "seo lokal", "audit seo"],
    section_title: "Pekerjaan SEO yang bisa diukur.", section_description: "Lihat contoh optimasi untuk toko online, kantor jasa, dan website travel.",
    cta_title: "Ingin website Anda lebih mudah ditemukan?", cta_description: "Kirimkan alamat website Anda. Kami bantu melihat bagian yang perlu diperbaiki lebih dulu.", cta_button: "Konsultasi SEO",
    categories: ["SEO Toko Online", "SEO Lokal", "Audit Teknis"],
    projects: [
      proj("modernhome", "ModernHome Furniture", "SEO Toko Online", "Konsep optimasi halaman kategori dan produk untuk toko furnitur online.", seo1, "Laporan pertumbuhan kunjungan organik dan peringkat kata kunci toko furnitur"),
      proj("anderson-law", "Kantor Hukum Lokal", "SEO Lokal", "Konsep optimasi profil bisnis Google agar kantor hukum muncul di pencarian area sekitar.", seo2, "Hasil pencarian Google Maps yang menampilkan kantor hukum di ponsel"),
      proj("wandermore", "WanderMore Travel", "Audit Teknis", "Konsep audit kecepatan halaman, struktur data, dan kesehatan website travel.", seo3, "Laporan audit SEO teknis website travel di layar tablet"),
    ],
  }),
  aplikasi: pf({
    eyebrow: "Dimaloka · Portfolio Aplikasi Mobile", card_title: "Aplikasi Mobile", card_image: ap1,
    card_description: "Desain dan pengembangan aplikasi Android & iOS untuk layanan, kesehatan, dan pendidikan.",
    description: "Kumpulan desain aplikasi Android dan iOS untuk pemesanan makanan, kebugaran, dan komunikasi sekolah. Setiap alur disusun agar mudah digunakan sejak pertama kali dibuka.",
    seo_title: "Portfolio Aplikasi Mobile Android & iOS | Dimaloka",
    seo_description: "Lihat portfolio desain dan pengembangan aplikasi mobile Android dan iOS di Dimaloka: aplikasi pemesanan, kebugaran, dan pendidikan.",
    keywords: ["portfolio aplikasi mobile", "aplikasi android", "aplikasi ios", "desain ui ux"],
    section_title: "Aplikasi yang mudah dipakai sejak layar pertama.", section_description: "Contoh rancangan aplikasi untuk usaha kuliner, kebugaran, dan sekolah.",
    cta_title: "Punya ide aplikasi untuk bisnis Anda?", cta_description: "Ceritakan pengguna dan fitur utama yang Anda bayangkan. Kami bantu memetakan versi pertama aplikasinya.", cta_button: "Konsultasi Aplikasi",
    categories: ["Layanan & Kuliner", "Kesehatan", "Pendidikan"],
    projects: [
      proj("quickbite", "QuickBite", "Layanan & Kuliner", "Konsep aplikasi pesan antar makanan: katalog menu, keranjang, hingga pelacakan pesanan.", ap1, "Tiga layar aplikasi pesan antar makanan QuickBite"),
      proj("fittrack", "FitTrack", "Kesehatan", "Konsep aplikasi pencatat latihan dengan ringkasan progres mingguan dan target pribadi.", ap2, "Layar aplikasi kebugaran FitTrack dengan grafik progres latihan"),
      proj("schoolconnect", "SchoolConnect", "Pendidikan", "Konsep aplikasi absensi dan pengumuman sekolah untuk orang tua siswa.", ap3, "Layar aplikasi sekolah SchoolConnect berisi absensi dan pengumuman"),
    ],
  }),
  video: pf({
    eyebrow: "Dimaloka · Portfolio Video & Animasi", card_title: "Video & Animasi", card_image: vd1,
    card_description: "Video produk, animasi penjelasan, dan konten reels untuk media sosial.",
    description: "Contoh video produk, animasi penjelasan, dan konten pendek untuk media sosial. Setiap karya dibuat untuk tujuan dan tempat tayang yang berbeda.",
    seo_title: "Portfolio Video Promosi & Animasi | Dimaloka",
    seo_description: "Lihat portfolio video promosi produk, motion graphic, animasi explainer, dan reels media sosial di Dimaloka.",
    keywords: ["portfolio video", "video promosi", "motion graphic", "animasi explainer"],
    section_title: "Cerita brand dalam hitungan detik.", section_description: "Lihat contoh video produk, animasi penjelasan, dan reels untuk hotel.",
    cta_title: "Siap membuat video untuk brand Anda?", cta_description: "Sampaikan tujuan video, durasi, dan tempat tayangnya. Kami bantu menyusun konsep awal.", cta_button: "Konsultasi Video",
    categories: ["Video Produk", "Animasi", "Reels & Konten Pendek"],
    projects: [
      proj("veritas", "Véritas Watch", "Video Produk", "Konsep video iklan jam tangan dengan pencahayaan sinematik untuk peluncuran produk.", vd1, "Cuplikan video produk jam tangan Véritas dengan tombol putar"),
      proj("fintrack", "FinTrack Explainer", "Animasi", "Storyboard animasi penjelasan aplikasi keuangan dalam enam adegan singkat.", vd2, "Storyboard animasi penjelasan aplikasi keuangan FinTrack"),
      proj("serenity", "Serenity Hotel", "Reels & Konten Pendek", "Konsep rangkaian reels vertikal untuk memperkenalkan fasilitas hotel.", vd3, "Tiga reels vertikal hotel Serenity di layar ponsel"),
    ],
  }),
};

export const servicePortfolio = (slug: ServiceSlug, value: unknown) => normalizePortfolio(portfolioDefaults[slug], value);

export type PortfolioMaster = { eyebrow: string; title: string; description: string; seo_title: string; seo_description: string; keywords: string[]; cta_title: string; cta_description: string; cta_button: string };
export const defaultMaster: PortfolioMaster = {
  eyebrow: "Dimaloka · Portfolio",
  title: "Portfolio Layanan Dimaloka",
  description: "Pilih layanan untuk melihat contoh karya website, desain grafis, digital marketing, SEO, aplikasi mobile, serta video dan animasi.",
  seo_title: "Portfolio Website, Desain, Marketing & Aplikasi | Dimaloka",
  seo_description: "Jelajahi portfolio Dimaloka per layanan: website, desain grafis, digital marketing, SEO, aplikasi mobile, dan video animasi untuk bisnis Anda.",
  keywords: ["portfolio dimaloka", "portfolio jasa digital", "portfolio website", "portfolio desain"],
  cta_title: "Belum yakin layanan mana yang dibutuhkan?",
  cta_description: "Ceritakan tujuan bisnis Anda. Kami bantu menentukan layanan yang paling sesuai untuk dimulai.",
  cta_button: "Konsultasi Gratis",
};
export function masterPage(value: unknown): PortfolioMaster {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaultMaster;
  const input = value as Record<string, unknown>;
  const r = { ...defaultMaster };
  for (const k of Object.keys(r) as (keyof PortfolioMaster)[]) {
    if (k === "keywords") { if (Array.isArray(input.keywords)) r.keywords = input.keywords.filter((x): x is string => typeof x === "string"); }
    else if (typeof input[k] === "string") r[k] = input[k] as string;
  }
  return r;
}

export type Feature = { eyebrow: string; title: string; text: string; image: string; image_alt: string; points: string[] };
export type Basic = { title: string; text: string };
export type Faq = { q: string; a: string };
export type ServiceContent = {
  eyebrow: string; title: string; description: string; hero_image: string; hero_alt: string; tags: string[];
  intro_eyebrow: string; intro_title: string; intro_text: string;
  features: Feature[];
  basics_eyebrow: string; basics_title: string; basics_text: string; basics: Basic[];
  services_eyebrow: string; services_title: string;
  faq_title: string; faq: Faq[];
  cta_eyebrow: string; cta_title: string; cta_text: string; cta_button: string; wa_message: string;
};

const content = (c: ServiceContent) => c;
export const serviceDefaults: Record<Exclude<ServiceSlug, "website">, ServiceContent> = {
  "desain-grafis": content({
    eyebrow: "Dimaloka · Desain untuk Brand", title: "Jasa Desain Grafis & Identitas Brand",
    description: "Logo, materi promosi, dan konten media sosial yang tampil konsisten. Pelanggan lebih mudah mengenali usaha Anda di mana pun mereka melihatnya.",
    hero_image: dgHero, hero_alt: "Contoh identitas brand pada kartu nama, kop surat, tas, dan kemasan", tags: ["Logo & Branding", "Konten Media Sosial"],
    intro_eyebrow: "Desain Grafis", intro_title: "Kesan pertama sering datang dari tampilan.",
    intro_text: "Sebelum membaca penjelasan produk, calon pelanggan sudah menilai dari logo, warna, dan kemasan yang mereka lihat. Desain yang rapi dan seragam membuat usaha Anda terlihat lebih siap dan lebih mudah diingat.",
    features: [
      { eyebrow: "Identitas Visual", title: "Satu gaya untuk semua titik temu.", text: "Logo, warna, dan huruf ditentukan sejak awal, lalu dipakai di kemasan, kartu nama, dan media sosial. Hasilnya, brand Anda terasa sama di setiap tempat.", image: dgA, image_alt: "Sketsa logo dan desain feed media sosial brand kopi di meja desainer", points: ["Logo utama beserta variasinya", "Palet warna dan pilihan huruf", "Panduan singkat penggunaan logo"] },
      { eyebrow: "Materi Promosi", title: "Siap cetak, siap unggah.", text: "Brosur, poster, banner, dan flyer dibuat dalam ukuran yang Anda butuhkan. File dikirim sesuai keperluan cetak maupun digital.", image: dgB, image_alt: "Brosur, poster, flyer, dan roll-up banner sebuah klinik", points: ["Brosur, flyer, dan poster", "Banner dan roll-up", "File cetak dan file digital"] },
      { eyebrow: "Konten Media Sosial", title: "Feed yang rapi tanpa terlihat kaku.", text: "Template dan desain konten membantu tim Anda mengunggah secara rutin dengan tampilan yang tetap seragam.", image: dg2, image_alt: "Desain feed Instagram yang seragam di layar ponsel", points: ["Template feed dan stories", "Desain konten promosi", "Ukuran sesuai tiap platform"] },
    ],
    basics_eyebrow: "Cara Kami Bekerja", basics_title: "Dari cerita bisnis menjadi bahasa visual.", basics_text: "Setiap desain dimulai dengan memahami usaha, pelanggan, dan pesaing Anda.",
    basics: [
      { title: "Pahami brand Anda", text: "Kami mendengarkan cerita usaha, nilai yang ingin ditonjolkan, dan pelanggan yang ingin dijangkau." },
      { title: "Susun arah desain", text: "Referensi gaya, warna, dan huruf dirangkum menjadi arah desain sebelum masuk ke pengerjaan." },
      { title: "Revisi yang terarah", text: "Masukan Anda dicatat per poin sehingga perbaikan tetap fokus dan tidak berulang." },
      { title: "File lengkap", text: "Hasil akhir diserahkan dalam format yang siap dipakai untuk cetak maupun digital." },
    ],
    services_eyebrow: "Layanan Desain Grafis", services_title: "Pilih paket desain yang Anda perlukan.",
    faq_title: "Pertanyaan tentang desain grafis.",
    faq: [
      { q: "Berapa kali revisi yang saya dapatkan?", a: "Jumlah revisi mengikuti paket yang dipilih. Rinciannya tercantum di halaman detail layanan." },
      { q: "Apakah saya mendapatkan file mentahnya?", a: "File akhir dan file sumber dapat diserahkan sesuai paket. Pastikan format yang Anda butuhkan saat pemesanan." },
      { q: "Saya belum punya referensi, apakah bisa?", a: "Bisa. Ceritakan usaha dan target pelanggan Anda, lalu kami siapkan beberapa arah desain untuk dipilih." },
      { q: "Berapa lama proses desain logo?", a: "Umumnya beberapa hari kerja, tergantung paket dan kecepatan masukan revisi. Jadwal disepakati di awal." },
    ],
    cta_eyebrow: "Mulai Desain Brand Anda", cta_title: "Punya usaha yang ingin tampil lebih meyakinkan?",
    cta_text: "Ceritakan bidang usaha dan kebutuhan desain Anda. Kami bantu memilih paket yang paling sesuai.", cta_button: "Konsultasi via WhatsApp",
    wa_message: "Halo Dimaloka, saya ingin konsultasi jasa desain grafis.",
  }),
  "digital-marketing": content({
    eyebrow: "Dimaloka · Iklan untuk Penjualan", title: "Jasa Digital Marketing & Iklan Online",
    description: "Kampanye Meta Ads dan Google Ads yang disusun dari tujuan bisnis Anda. Anggaran iklan diarahkan ke calon pelanggan yang paling mungkin membeli.",
    hero_image: dmHero, hero_alt: "Dasbor performa kampanye iklan di laptop dan ponsel", tags: ["Meta Ads", "Google Ads"],
    intro_eyebrow: "Digital Marketing", intro_title: "Iklan yang tepat sasaran, bukan sekadar ramai dilihat.",
    intro_text: "Banyak iklan mendapat ribuan tayangan tetapi sedikit pembeli. Kampanye yang baik dimulai dari target pasar yang jelas, pesan yang relevan, dan pengukuran yang jujur.",
    features: [
      { eyebrow: "Strategi & Target Pasar", title: "Mulai dari siapa pelanggan Anda.", text: "Usia, lokasi, minat, dan kebiasaan calon pelanggan dipetakan lebih dulu agar anggaran tidak terbuang ke orang yang tidak tertarik.", image: dmA, image_alt: "Tim pemasaran meninjau hasil kampanye iklan di layar besar", points: ["Riset target pasar", "Pemilihan platform iklan", "Pembagian anggaran harian"] },
      { eyebrow: "Materi Iklan", title: "Pesan singkat yang membuat orang berhenti menggulir.", text: "Gambar, video pendek, dan teks iklan disiapkan dalam beberapa versi untuk diuji mana yang paling efektif.", image: dmB, image_alt: "Contoh iklan bersponsor fashion dan restoran di ponsel", points: ["Teks iklan dan judul", "Variasi gambar atau video", "Uji beberapa versi iklan"] },
      { eyebrow: "Laporan & Evaluasi", title: "Angka yang mudah Anda pahami.", text: "Laporan rutin menjelaskan biaya, jumlah klik, dan hasil yang didapat, beserta langkah perbaikan untuk periode berikutnya.", image: dm1, image_alt: "Laporan hasil kampanye iklan dengan grafik penjualan", points: ["Laporan berkala", "Evaluasi iklan terbaik", "Rekomendasi perbaikan"] },
    ],
    basics_eyebrow: "Dasar Kampanye", basics_title: "Empat hal yang kami siapkan sebelum iklan tayang.", basics_text: "Persiapan yang matang membuat hasil iklan lebih mudah dibaca dan ditingkatkan.",
    basics: [
      { title: "Tujuan yang jelas", text: "Penjualan, pesan WhatsApp, atau kunjungan toko. Satu tujuan utama untuk setiap kampanye." },
      { title: "Halaman tujuan", text: "Halaman yang dibuka setelah klik harus menjawab iklan, bukan membingungkan pengunjung." },
      { title: "Pelacakan hasil", text: "Pixel dan pengukuran konversi dipasang agar hasil iklan tercatat dengan benar." },
      { title: "Anggaran bertahap", text: "Anggaran dimulai dari batas aman, lalu dinaikkan pada iklan yang terbukti bekerja." },
    ],
    services_eyebrow: "Layanan Digital Marketing", services_title: "Pilih layanan iklan yang sesuai target Anda.",
    faq_title: "Pertanyaan tentang iklan online.",
    faq: [
      { q: "Apakah biaya iklan sudah termasuk harga jasa?", a: "Biasanya belum. Biaya jasa pengelolaan terpisah dari saldo iklan yang dibayarkan langsung ke platform. Rinciannya tercantum di tiap paket." },
      { q: "Berapa anggaran iklan minimal?", a: "Tergantung tujuan dan area pemasaran. Kami bantu menghitung anggaran awal yang masuk akal saat konsultasi." },
      { q: "Kapan hasil iklan mulai terlihat?", a: "Data awal biasanya terlihat dalam beberapa hari. Optimasi membutuhkan beberapa minggu agar hasil lebih stabil." },
      { q: "Apakah saya tetap memegang akun iklan?", a: "Ya. Akun iklan sebaiknya atas nama bisnis Anda, dan kami diberi akses untuk mengelolanya." },
    ],
    cta_eyebrow: "Mulai Kampanye Anda", cta_title: "Ingin iklan Anda menghasilkan pelanggan, bukan hanya tayangan?",
    cta_text: "Sampaikan produk, area pemasaran, dan anggaran Anda. Kami bantu menyusun rencana kampanye awal.", cta_button: "Konsultasi via WhatsApp",
    wa_message: "Halo Dimaloka, saya ingin konsultasi jasa digital marketing.",
  }),
  seo: content({
    eyebrow: "Dimaloka · Optimasi Mesin Pencari", title: "Jasa SEO untuk Website Bisnis",
    description: "Bantu calon pelanggan menemukan website Anda saat mereka mencari layanan di Google. Optimasi dikerjakan bertahap dan dilaporkan dengan jelas.",
    hero_image: seoHero, hero_alt: "Laporan pertumbuhan kunjungan dan peringkat kata kunci di laptop", tags: ["SEO On-Page", "SEO Lokal"],
    intro_eyebrow: "Search Engine Optimization", intro_title: "Muncul saat pelanggan sedang mencari.",
    intro_text: "Orang yang mengetik kebutuhannya di Google sudah siap mencari solusi. SEO membantu website Anda hadir di hasil pencarian tersebut tanpa harus membayar setiap klik.",
    features: [
      { eyebrow: "Riset Kata Kunci", title: "Pahami kata yang dipakai pelanggan.", text: "Kami mencari kata kunci yang benar-benar diketik calon pelanggan, lalu memetakannya ke halaman yang tepat di website Anda.", image: seoA, image_alt: "Spesialis SEO mengerjakan riset kata kunci dan audit website", points: ["Riset kata kunci dan pesaing", "Pemetaan kata kunci per halaman", "Prioritas berdasarkan peluang"] },
      { eyebrow: "Konten & Struktur", title: "Halaman yang jelas untuk pembaca dan Google.", text: "Judul, deskripsi, susunan heading, dan tautan antarhalaman dirapikan agar isi website mudah dipahami.", image: seoB, image_alt: "Halaman artikel website dan diagram struktur situs", points: ["Optimasi judul dan deskripsi", "Struktur heading dan tautan internal", "Rekomendasi topik artikel"] },
      { eyebrow: "Teknis & Lokal", title: "Fondasi teknis yang sehat.", text: "Kecepatan halaman, tampilan di ponsel, dan profil bisnis Google diperiksa agar tidak menghambat peringkat.", image: seo2, image_alt: "Hasil pencarian lokal Google Maps di ponsel", points: ["Audit kecepatan dan error", "Optimasi profil bisnis Google", "Pengecekan tampilan seluler"] },
    ],
    basics_eyebrow: "Prinsip Kerja", basics_title: "SEO yang jujur dan bisa diukur.", basics_text: "Tidak ada janji instan. Yang ada adalah langkah terukur dan laporan rutin.",
    basics: [
      { title: "Audit di awal", text: "Kondisi website diperiksa lebih dulu agar perbaikan dimulai dari masalah yang paling berpengaruh." },
      { title: "Cara yang aman", text: "Tanpa trik yang berisiko membuat website terkena penalti dari Google." },
      { title: "Laporan berkala", text: "Perkembangan peringkat, kunjungan, dan pekerjaan yang sudah dilakukan dilaporkan secara rutin." },
      { title: "Fokus pada bisnis", text: "Kata kunci dipilih berdasarkan potensi pelanggan, bukan sekadar jumlah pencarian." },
    ],
    services_eyebrow: "Layanan SEO", services_title: "Pilih paket SEO sesuai tahap website Anda.",
    faq_title: "Pertanyaan tentang SEO.",
    faq: [
      { q: "Berapa lama hasil SEO terlihat?", a: "Umumnya perubahan mulai terlihat dalam satu hingga tiga bulan, tergantung kondisi website dan persaingan kata kunci." },
      { q: "Apakah ada jaminan halaman satu Google?", a: "Tidak ada pihak yang bisa menjamin posisi tertentu. Kami fokus pada langkah yang terbukti meningkatkan peluang tampil." },
      { q: "Website saya dibuat di platform lain, apakah bisa?", a: "Bisa, selama kami mendapat akses untuk melakukan perubahan atau tim Anda dapat menerapkan rekomendasi kami." },
      { q: "Apa bedanya SEO dengan iklan Google?", a: "Iklan tampil selama dibayar per klik. SEO membangun kehadiran organik yang bertahan lebih lama." },
    ],
    cta_eyebrow: "Mulai Optimasi Website", cta_title: "Ingin tahu kondisi SEO website Anda saat ini?",
    cta_text: "Kirimkan alamat website Anda. Kami bantu melihat bagian yang perlu diperbaiki lebih dulu.", cta_button: "Konsultasi via WhatsApp",
    wa_message: "Halo Dimaloka, saya ingin konsultasi jasa SEO untuk website saya.",
  }),
  aplikasi: content({
    eyebrow: "Dimaloka · Aplikasi untuk Bisnis", title: "Jasa Pembuatan Aplikasi Mobile Android & iOS",
    description: "Wujudkan aplikasi untuk pelanggan maupun tim internal Anda. Dimulai dari alur yang sederhana, desain yang nyaman, hingga rilis di Play Store dan App Store.",
    hero_image: apHero, hero_alt: "Dua ponsel menampilkan aplikasi pemesanan layanan", tags: ["Android & iOS", "Desain UI/UX"],
    intro_eyebrow: "Aplikasi Mobile", intro_title: "Layanan bisnis Anda, dalam genggaman pelanggan.",
    intro_text: "Aplikasi memudahkan pelanggan memesan, membayar, atau berkomunikasi kapan saja. Agar benar-benar dipakai, aplikasi perlu fokus pada kebutuhan utama dan mudah digunakan sejak pertama kali dibuka.",
    features: [
      { eyebrow: "Perencanaan & Desain", title: "Alur dirancang sebelum kode ditulis.", text: "Kebutuhan pengguna dipetakan menjadi alur layar dan prototipe, sehingga Anda bisa mencoba aplikasinya sebelum pengembangan dimulai.", image: apA, image_alt: "Desainer membuat wireframe aplikasi di kertas dan prototipe di laptop", points: ["Pemetaan fitur utama", "Wireframe dan alur pengguna", "Prototipe yang bisa dicoba"] },
      { eyebrow: "Pengembangan", title: "Satu aplikasi untuk Android dan iOS.", text: "Aplikasi dikembangkan agar berjalan baik di kedua sistem, lalu diuji di berbagai perangkat sebelum dirilis.", image: apB, image_alt: "Aplikasi yang sama diuji di ponsel Android dan iPhone", points: ["Android dan iOS", "Pengujian di beberapa perangkat", "Panel admin bila dibutuhkan"] },
      { eyebrow: "Rilis & Pendampingan", title: "Sampai aplikasi tersedia untuk diunduh.", text: "Kami membantu proses unggah ke Play Store dan App Store, serta menyiapkan dukungan perbaikan setelah rilis.", image: ap1, image_alt: "Tampilan aplikasi pesan antar makanan di tiga layar ponsel", points: ["Publikasi ke toko aplikasi", "Perbaikan setelah rilis", "Rencana pengembangan lanjutan"] },
    ],
    basics_eyebrow: "Cara Kami Bekerja", basics_title: "Mulai dari versi yang paling penting.", basics_text: "Versi pertama yang fokus membuat aplikasi lebih cepat dipakai dan lebih mudah dikembangkan.",
    basics: [
      { title: "Fitur prioritas", text: "Kami bantu memilah fitur wajib dan fitur yang bisa menyusul di versi berikutnya." },
      { title: "Tahapan yang jelas", text: "Pekerjaan dibagi per tahap dengan hasil yang bisa Anda periksa di setiap akhir tahap." },
      { title: "Pengujian menyeluruh", text: "Aplikasi diuji pada berbagai ukuran layar dan kondisi jaringan sebelum dirilis." },
      { title: "Kepemilikan jelas", text: "Akun toko aplikasi dan kode sumber diatur sesuai kesepakatan sejak awal." },
    ],
    services_eyebrow: "Layanan Aplikasi Mobile", services_title: "Pilih layanan sesuai skala aplikasi Anda.",
    faq_title: "Pertanyaan tentang pembuatan aplikasi.",
    faq: [
      { q: "Berapa lama membuat aplikasi?", a: "Tergantung jumlah fitur. Aplikasi sederhana bisa beberapa minggu, sedangkan aplikasi kompleks membutuhkan beberapa bulan." },
      { q: "Apakah perlu akun developer sendiri?", a: "Disarankan atas nama bisnis Anda agar aplikasi menjadi milik Anda sepenuhnya. Kami bantu proses pendaftarannya." },
      { q: "Bisakah aplikasi terhubung dengan sistem yang sudah ada?", a: "Bisa, selama sistem tersebut menyediakan akses data. Hal ini dibahas saat perencanaan." },
      { q: "Bagaimana jika ada perbaikan setelah rilis?", a: "Masa dukungan setelah rilis mengikuti paket. Pengembangan lanjutan dapat disepakati terpisah." },
    ],
    cta_eyebrow: "Mulai Aplikasi Anda", cta_title: "Sudah punya gambaran aplikasi yang ingin dibuat?",
    cta_text: "Ceritakan pengguna dan fitur utama yang Anda butuhkan. Kami bantu memetakan versi pertamanya.", cta_button: "Konsultasi via WhatsApp",
    wa_message: "Halo Dimaloka, saya ingin konsultasi pembuatan aplikasi mobile.",
  }),
  video: content({
    eyebrow: "Dimaloka · Video untuk Brand", title: "Jasa Video Promosi, Editing & Animasi",
    description: "Video produk, animasi penjelasan, dan konten pendek untuk media sosial. Sampaikan pesan brand Anda dengan cepat dan mudah diingat.",
    hero_image: vdHero, hero_alt: "Ruang editing video dengan timeline dan color grading iklan produk", tags: ["Video Promosi", "Motion Graphic"],
    intro_eyebrow: "Video & Animasi", intro_title: "Lebih cepat dipahami daripada paragraf panjang.",
    intro_text: "Dalam beberapa detik, video bisa menunjukkan cara kerja produk, suasana tempat usaha, atau manfaat layanan Anda. Karena itu video menjadi format yang paling banyak ditonton di media sosial.",
    features: [
      { eyebrow: "Produksi Video", title: "Dari naskah sampai pengambilan gambar.", text: "Konsep, naskah, dan daftar adegan disiapkan lebih dulu, lalu syuting dilakukan dengan peralatan dan tim yang sesuai kebutuhan.", image: vdA, image_alt: "Tim produksi merekam video promosi di sebuah kafe", points: ["Konsep dan naskah", "Pengambilan gambar", "Editing dan musik latar"] },
      { eyebrow: "Motion Graphic & Animasi", title: "Jelaskan hal rumit dengan cara sederhana.", text: "Animasi cocok untuk menjelaskan aplikasi, layanan, atau proses yang sulit direkam secara langsung.", image: vdB, image_alt: "Storyboard animasi penjelasan di layar komputer", points: ["Storyboard adegan", "Ilustrasi dan animasi", "Pengisi suara dan teks"] },
      { eyebrow: "Konten Pendek", title: "Siap tayang di Reels, TikTok, dan Shorts.", text: "Video vertikal dibuat singkat dengan pembuka yang kuat, teks yang mudah dibaca, dan ukuran sesuai tiap platform.", image: vd3, image_alt: "Reels hotel di tiga layar ponsel", points: ["Format vertikal", "Teks dan subtitle", "Beberapa versi durasi"] },
    ],
    basics_eyebrow: "Alur Produksi", basics_title: "Empat tahap menuju video yang siap tayang.", basics_text: "Setiap tahap disetujui bersama agar hasil akhir sesuai harapan.",
    basics: [
      { title: "Brief & konsep", text: "Tujuan video, penonton, dan tempat tayang ditentukan sejak awal." },
      { title: "Naskah & storyboard", text: "Alur cerita disusun per adegan sebelum produksi agar tidak ada yang terlewat." },
      { title: "Produksi & editing", text: "Pengambilan gambar atau animasi dikerjakan, lalu disunting dengan musik dan teks." },
      { title: "Revisi & file akhir", text: "Masukan Anda diterapkan, lalu video diserahkan dalam ukuran yang dibutuhkan." },
    ],
    services_eyebrow: "Layanan Video & Animasi", services_title: "Pilih jenis video yang Anda butuhkan.",
    faq_title: "Pertanyaan tentang produksi video.",
    faq: [
      { q: "Apakah termasuk pengambilan gambar di lokasi?", a: "Tergantung paket. Ada layanan editing dari materi Anda, ada juga yang termasuk syuting di lokasi." },
      { q: "Berapa durasi video yang ideal?", a: "Untuk media sosial umumnya 15–60 detik. Video profil perusahaan bisa lebih panjang sesuai kebutuhan." },
      { q: "Apakah musik latarnya aman dipakai?", a: "Kami menggunakan musik berlisensi atau bebas royalti yang sesuai untuk penggunaan komersial." },
      { q: "Berapa kali revisi yang tersedia?", a: "Jumlah revisi mengikuti paket dan dicantumkan di halaman detail layanan." },
    ],
    cta_eyebrow: "Mulai Produksi Video", cta_title: "Siap menceritakan brand Anda lewat video?",
    cta_text: "Sampaikan tujuan video, durasi, dan tempat tayangnya. Kami bantu menyusun konsep awal.", cta_button: "Konsultasi via WhatsApp",
    wa_message: "Halo Dimaloka, saya ingin konsultasi jasa video dan animasi.",
  }),
};

export function serviceContent(slug: Exclude<ServiceSlug, "website">, value: unknown): ServiceContent {
  const d = serviceDefaults[slug];
  if (!value || typeof value !== "object" || Array.isArray(value)) return d;
  const input = value as Record<string, unknown>;
  const r: ServiceContent = { ...d };
  for (const k of Object.keys(d) as (keyof ServiceContent)[]) {
    const v = input[k];
    if (typeof d[k] === "string" && typeof v === "string") (r as Record<string, unknown>)[k] = v;
    else if (Array.isArray(d[k]) && Array.isArray(v)) (r as Record<string, unknown>)[k] = v.filter(x => x != null);
  }
  r.features = r.features.map((f, i) => ({ ...d.features[i % d.features.length], ...f, points: Array.isArray(f.points) ? f.points : [] }));
  return r;
}
