# Optimasi kecepatan Dimaloka sebelum publish

## Tujuan
Halaman terbuka cepat untuk pengunjung baru, terutama di HP, tanpa mengubah tampilan atau isi.

## Yang dikerjakan
1. **Gambar lebih ringan** — ubah gambar besar (hero 1,2 MB, mockup website 1,2 MB, avatar Annisa 400 KB, dan gambar layanan/portfolio ~200 KB) ke format WebP/AVIF dengan ukuran sesuai tampilan. Target: total gambar per halaman turun 60–80%.
2. **Gambar dimuat sesuai kebutuhan** — gambar di bawah layar dimuat belakangan (lazy), gambar pembuka dimuat paling awal (prioritas tinggi + preload), ukuran gambar ditetapkan agar halaman tidak "loncat".
3. **Data halaman di-cache** — data publik (layanan, produk, artikel, pengaturan situs) disimpan sementara di browser dan di server CDN beberapa menit, jadi kunjungan berikutnya dan pindah halaman terasa instan. Perubahan dari admin tetap muncul (cache dibersihkan saat admin menyimpan).
4. **Kode lebih ramping** — bagian berat (editor artikel, dashboard admin, chat AI, lightbox portfolio) hanya dimuat saat halaman itu dibuka, tidak membebani beranda.
5. **Font & skrip pihak ketiga** — font Plus Jakarta Sans dimuat dengan `display=swap` dan hanya ketebalan yang dipakai; Google Analytics dimuat tanpa menahan tampilan.
6. **Prefetch navigasi** — saat kursor/jari mendekati menu, halaman tujuan sudah disiapkan.
7. **Ukur sebelum & sesudah** — cek ukuran halaman dan waktu muat beranda, layanan, blog, dan portfolio di mode desktop dan mobile, lalu laporkan hasilnya.

## Detail teknis
- Tambah `vite-imagetools`; impor aset dengan `?format=webp&w=...` dan `srcset`; konversi PNG besar.
- `loading="lazy" decoding="async"` untuk gambar non-hero; `fetchpriority="high"` + `head().links` preload pada route pemilik LCP.
- Router `defaultPreload: "intent"`, `defaultStaleTime`; queryClient `staleTime` untuk data publik; header `Cache-Control: public, s-maxage=300, stale-while-revalidate` pada sitemap/robots dan respons SSR publik (bukan halaman admin/akun/checkout/invoice).
- Lazy import Tiptap, AI Elements, komponen admin berat.
- Tidak ada perubahan database atau logika bisnis.
