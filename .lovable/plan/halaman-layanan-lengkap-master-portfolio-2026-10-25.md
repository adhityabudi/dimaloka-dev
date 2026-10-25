# Halaman layanan lengkap + Master Portfolio

## Yang dibangun

### 1. Lima halaman layanan baru (gaya sama dengan halaman Website)
Desain Grafis, Digital Marketing, SEO, Aplikasi Mobile, Video & Animasi — masing-masing memakai alur yang sama dengan halaman Jasa Pembuatan Website:
- Hero: teks kiri + gambar proporsional kanan
- Pengantar layanan
- 3 bagian keunggulan (gambar + poin) dengan isi khusus tiap layanan
- Bagian dasar/fondasi (4 poin)
- Cuplikan portfolio layanan itu + tombol ke portfolio khususnya
- Daftar paket layanan (dari data yang ada)
- FAQ 4 pertanyaan
- Ajakan konsultasi WhatsApp

Copywriting asli Dimaloka, bahasa konkret dan alami (menghindari kalimat yang sudah ditolak). Gambar dummy baru dibuat per layanan (hero + 2 gambar pendukung + 3 contoh portfolio), total sekitar 30 gambar.

### 2. Master Portfolio (menu Portfolio)
- Halaman `/portfolio` berubah menjadi halaman induk berisi 6 CARD: Website, Desain Grafis, Digital Marketing, SEO, Aplikasi Mobile, Video & Animasi. Tiap card: gambar sampul, judul, deskripsi singkat, jumlah karya, tombol "Lihat portfolio".
- Halaman portfolio khusus per layanan di `/portfolio/<layanan>` (mis. `/portfolio/desain-grafis`) dengan tampilan referensi Etinion yang sudah ada (filter kategori, pencarian, grid karya, CTA). Portfolio Website saat ini dipindah ke `/portfolio/website` tanpa kehilangan data.
- Menu tetap bernama "Portfolio", sebelum Blog.

### 3. Dashboard admin
- Admin Portfolio: tab untuk halaman Master (judul, deskripsi, SEO) dan tiap layanan (gambar sampul card, teks, kategori filter, SEO, daftar karya beserta gambar).
- Admin baru "Halaman Layanan": edit teks dan gambar tiap bagian di 5 halaman layanan baru (hero, keunggulan, FAQ, CTA).
- SEO wajib terisi sebelum disimpan, seperti aturan yang berlaku.

## Detail teknis
- Konten disimpan sebagai dokumen di `site_settings` (kunci per layanan), dibaca via public server functions untuk SSR; default dummy di kode sebagai fallback.
- Satu komponen `ServiceLandingPage` dipakai oleh 5 layanan, dipilih berdasarkan slug kategori; halaman Website tetap dengan komponennya sendiri.
- Rute baru `portfolio.index.tsx` (master) dan `portfolio.$service.tsx`; `portfolio.tsx` jadi layout; sitemap diperbarui; head() unik per halaman.
- Validasi SEO di UI dan trigger DB diperluas ke dokumen baru.
- Tes: normalisasi data portfolio per layanan dan filter; verifikasi browser semua halaman desktop + mobile.
