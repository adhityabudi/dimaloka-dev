# Rencana Pembangunan Dimaloka

Marketplace jasa digital sesuai PRD, dibangun bertahap. Semua listing dikelola Admin; buyer punya akun untuk riwayat order dan invoice.

## Tampilan

- Warna: putih dominan, navy `#0F172A`/`#1E3A8A` untuk header/footer/heading, oranye `#F97316` untuk tombol & highlight, aksen biru/merah.
- Font Plus Jakarta Sans, kartu rounded 12–16px, badge "HOT", navbar sticky, marquee logo, carousel testimoni. Mode terang default.

## Tahap 1 — Fondasi (Lovable Cloud)

- Aktifkan Lovable Cloud: database, login email+password, penyimpanan gambar.
- Tabel sesuai PRD: profiles, sellers, categories, products, orders, invoices, testimonials, articles, site_settings. Role admin disimpan di tabel role terpisah (lebih aman dari kolom role di profil).
- Data contoh: 6 kategori, beberapa brand, produk, testimoni, artikel, supaya halaman langsung terisi.
- Halaman `/auth/sign-in` dan `/auth/sign-up`. Admin pertama ditetapkan untuk akun yang Anda daftarkan.

## Tahap 2 — Halaman Publik

- `/` landing: hero, social proof, grid kategori, 4 langkah order, testimoni, CTA WhatsApp, footer 4 kolom.
- `/kategori/<slug>`, `/p/<slug>` (galeri, paket, tombol WA, produk terkait), `/store/<slug>`, `/blog`, `/blog/<slug>`, `/invoice/<token>` (tanpa login, cetak/unduh PDF, bayar via WA).
- Setiap halaman: meta title/description, OG, canonical, JSON-LD sesuai tipe. Render di server agar mudah dibaca Google.
- `sitemap.xml` dan `robots.txt` otomatis dari konten yang dipublikasi.

## Tahap 3 — Dashboard Admin `/admin`

- Overview: kartu statistik, grafik order/pendapatan 7/30 hari, order & invoice terbaru, aksi cepat.
- CRUD Kategori (urutan), Produk (paket dinamis, galeri upload, fitur/manfaat/tags, SEO + preview Google), Brand, Testimoni.
- Order: filter, ubah status, tombol "Buat Invoice".
- Invoice: dari order atau mandiri, nomor otomatis `INV-YYYYMM-####`, salin link, tandai lunas, PDF.
- Artikel: editor rich text, SEO checker skor 0–100 + rekomendasi, jadwal publish.
- SEO: setting global, editor robots.txt, tabel status SEO semua konten + filter "belum dioptimasi", GA ID & verifikasi Search Console.
- Setting: identitas, kontak, sosial, footer, info rekening.

## Aturan Bisnis

- Produk/kategori/artikel tidak bisa dipublish bila SEO title, description, keywords/focus keyword kosong (diblokir di form dan database).
- Hanya admin yang bisa menandai invoice lunas; pendapatan = invoice lunas.
- Slug otomatis dari judul, bisa diedit, wajib unik.
- Pembayaran manual (tanpa payment gateway), tanpa komisi otomatis.

## Detail Teknis

- Stack proyek ini TanStack Start (bukan React Router/react-helmet); SEO memakai `head()` per route dengan SSR, data publik via server function.
- RLS di semua tabel; admin dicek lewat fungsi `has_role`; invoice publik dibaca lewat server function berdasarkan token UUID.
- Rich text: editor Tiptap; PDF: cetak ke PDF dari halaman invoice.
- Tes kecil untuk aturan: validasi panjang SEO, blokir publish, format nomor invoice, skor SEO artikel.

Style website mengikuti : [https://roketmarket.com/](https://roketmarket.com/)  tapi jangan mirip  
style warna ikuti : Untuk website Dimaloka, gunakan komposisi berikut:

60% White — background utama  
25% Navy Blue — header, footer, heading, section  
10% Orange — CTA, tombol, highlight  
5% Blue / Red — aksen visual dan ilustrasi  
  
Logo di ambil disini : [https://ibb.co.com/WNSmPFKz](https://ibb.co.com/WNSmPFKz)