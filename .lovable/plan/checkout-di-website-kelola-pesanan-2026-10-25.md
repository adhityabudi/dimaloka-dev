# Checkout di Website + Kelola Pesanan

## Alur yang dibangun

```text
Member buka detail layanan -> pilih paket -> "Pesan Sekarang"
  -> (belum login? diarahkan masuk/daftar, lalu kembali ke checkout)
  -> Halaman Checkout: ringkasan paket, data pemesan (nama, WA, email), catatan/brief, pilihan Full Payment atau DP
  -> "Buat Pesanan" -> pesanan tercatat + invoice otomatis dibuat (status Belum Dibayar)
  -> Halaman Pesanan Berhasil: nomor pesanan, invoice, rekening tujuan,
     tombol "Konfirmasi Pembayaran via WhatsApp" (pesan otomatis berisi no. invoice & nominal)
Admin cek transfer -> tandai invoice Lunas / DP Dibayar -> update progres pesanan
Member melihat status & riwayat progres di Akun Saya
```

## Sisi member

- Detail layanan: tombol utama berubah jadi **Pesan Sekarang** (paket terpilih ikut terbawa); tombol "Tanya via Chat" tetap ada sebagai opsi kedua.
- Halaman **Checkout** baru (khusus member yang login), data pemesan terisi otomatis dari akun.
- Halaman **Pesanan Berhasil** dengan instruksi transfer dan tombol konfirmasi WhatsApp ke admin.
- **Akun Saya** dirapikan: daftar pesanan dengan status berbahasa Indonesia, halaman detail pesanan berisi timeline progres, invoice terkait, dan tombol konfirmasi pembayaran.

## Sisi admin (menu Order -> "Pesanan")

- Daftar pesanan dengan filter status, pencarian, dan penanda "Menunggu Pembayaran" / "Sudah Dibayar".
- Halaman detail pesanan: data client, brief, invoice terkait (tandai lunas langsung dari sini), ubah status, dan **tambah update progres** (judul, catatan, persentase opsional) yang tampil di akun member.
- Tombol "Kabari via WhatsApp" untuk mengirim update progres ke client.
- Pencatatan order manual dari chat tetap tersedia.

## Status pesanan

Menunggu Pembayaran -> Dibayar -> Dikerjakan -> Revisi -> Selesai (atau Dibatalkan). Status pembayaran tersinkron otomatis saat admin menandai invoice lunas.

## Detail teknis

- Migrasi: tambah status order baru (`awaiting_payment`, `paid`, `revision`), kolom `order_number`, `brief`, `payment_stage`; tabel `order_updates` (order_id, title, note, progress, created_by) dengan RLS: member baca update pesanannya sendiri, admin kelola.
- Server function `createCheckout` (requireSupabaseAuth): validasi produk publish + paket, harga diambil dari database (bukan dari browser), insert order + invoice (full atau DP via `splitPayment`) dengan service role setelah verifikasi user; nomor invoice tetap dari trigger.
- Trigger: saat invoice berstatus paid -> order pindah ke `paid` jika masih menunggu.
- Rute baru: `/_authenticated/checkout/$slug`, `/_authenticated/pesanan/$id`, `/_authenticated/admin/order/$id`; login meneruskan `redirect` kembali ke checkout.
- Tes: harga checkout dari paket, DP < total, sinkron status lunas.

Tambahan :   
- dibagian detail Lihat portfolio tambahkan button Cek live atau akses live yang berfungsi untuk melihat portfolio secara langsung jika ada.  
-di sisi admin sediakan juga tambahan kelola yombol ini disable atau enable dan edit isi URL nya nanti, 