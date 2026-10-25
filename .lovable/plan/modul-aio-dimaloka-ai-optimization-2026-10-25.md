# Modul AIO Dimaloka (AI Optimization)

Satu menu admin baru, "AIO", untuk membuat artikel, mengoptimasi SEO, menulis copywriting halaman, dan membuat deskripsi produk lewat DollarDesa. Keempat prompt keahlian (SEO + Copywriting SEO) dari panduan disimpan di database dan bisa diedit admin. Fitur AI yang sudah ada (Optimasi SEO, AI di form Artikel) juga akan memakai prompt ini.

## Yang akan dibuat

1. **Menu "AIO"** di sidebar, di antara Artikel dan Optimasi SEO, dengan 3 halaman:
   - **AI Generator** (`/admin/aio`): pilih fitur, isi kolom sesuai fitur, klik Generate, lalu hasilnya tampil sebagai pratinjau rapi (bukan teks mentah). Ada tombol Copy JSON, Copy Markdown (untuk artikel), dan Simpan ke draft.
   - **Prompt Library** (`/admin/aio/prompts`): tabel 4 fitur (nama, kunci fitur, model, terakhir diubah). Bisa mengedit prompt, temperature, model, dan memakai Reset ke default.
   - **AI Settings** (`/admin/aio/settings`): model default global, status kunci API (Sudah di-set / Belum, kunci tidak pernah ditampilkan), dan max tokens.

2. **Empat fitur, prompt persis sesuai panduan**
   - Generate Artikel Blog: topik, focus keyword, gaya bahasa. Simpan ke draft membuat artikel draf (judul, slug, isi, SEO, keyword, FAQ, CTA), lalu membuka form editnya.
   - Optimasi SEO Artikel: pilih artikel yang ada atau tempel teks, plus keyword. Menampilkan skor, masalah, dan perbaikan. Simpan ke draft menerapkan meta title, deskripsi, dan keyword ke artikel tanpa mengubah status publikasinya.
   - Generate Konten Website: jenis bagian (hero/about/landing) dan deskripsi singkat. Pratinjau hero dan bagian-bagian halaman, bisa disalin.
   - Generate Deskripsi + SEO Produk: nama produk, Layanan, dan fitur utama. Simpan ke draft membuat produk draf (atau mengisi produk yang dipilih), lalu membuka form editnya.

3. **Model**: default global `deepseek-v4-pro`, dengan pilihan `claude-opus-5`, `gpt-6-astra`, dan `glm-5.3` (ID tanpa prefix). Model per fitur boleh menimpa default.

4. **Integrasi fitur lama**: tombol "Temukan Peluang SEO" dan "Rekomendasi SEO dari AI" di form Artikel akan memakai prompt `article_seo` / `article_generate` dari Prompt Library dan model default yang sama, jadi semua fitur AI memakai satu sumber prompt.

## Aturan yang tetap berlaku
- Konten hasil AI selalu tersimpan sebagai draf. Publikasi tetap wajib punya SEO title, deskripsi, dan keyword.
- Teks yang dilihat pengguna memakai istilah "Layanan". Prompt bawaan tetap disimpan persis sesuai panduan, dan contoh link internal `/kategori/` akan diarahkan otomatis ke `/layanan/`.
- Kunci API tidak pernah dikirim ke browser.

## Detail teknis
- Panduan meminta Supabase Edge Function. Proyek ini memakai server function TanStack (aturan proyek dan template). Jadi `ai-generate` dibuat sebagai server function khusus admin (`src/lib/aio.functions.ts`) dengan kontrak yang sama: `{ feature, input, model? }` menjadi `{ content }` yang sudah divalidasi. Kunci yang ada, `DOLLARDESA_API_KEY`, dipakai ulang sehingga tidak perlu kunci baru `DOLLAR_AI_API_KEY`.
- Migrasi: tabel `ai_prompts` (feature unik, name, system_prompt, temperature, model nullable, updated_at) dengan GRANT, RLS khusus admin melalui `has_role`, dan seed 4 baris berisi teks prompt persis. Pengaturan `ai_default_model` dan `ai_max_tokens` disimpan di `site_settings`, digabung ke `ai_seo_settings` yang sudah ada.
- Gateway: POST `/chat/completions` dengan streaming (parser SSE yang ada), `temperature`, dan `max_tokens`. Error per status (401/402/403/404/429) sudah ditangani.
- Teks prompt default disimpan di modul server-only `src/lib/aio-prompts.ts` yang dipakai untuk seed/reset (tidak ada di komponen React). Skema Zod per fitur ada di `src/lib/aio.ts` untuk validasi output dan pratinjau. Markdown diubah menjadi HTML saat disimpan ke artikel/produk.
- `generateAiSeo` lama diarahkan untuk membaca prompt dari `ai_prompts`, lalu memetakan output baru ke editor rekomendasi yang ada.
- Tes: validasi fitur dan input, pemetaan output ke draf artikel/produk (status draf, link `/kategori` menjadi `/layanan`), dan prompt dari DB menang atas default.
- Verifikasi dengan Playwright memakai sesi admin: generate keempat fitur, edit prompt lalu pastikan prompt itu dipakai, dan simpan ke draft lalu baca ulang di form.
