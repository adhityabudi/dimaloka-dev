
create type public.app_role as enum ('admin','buyer');
create type public.content_status as enum ('draft','published');
create type public.order_status as enum ('new','contacted','in_progress','completed','cancelled');
create type public.invoice_status as enum ('draft','sent','paid','cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text, avatar_url text,
  created_at timestamptz not null default now()
);
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null, unique(user_id, role)
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,email,full_name) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'));
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id,role) values (new.id,'admin');
  end if;
  insert into public.user_roles(user_id,role) values (new.id,'buyer') on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end $$;

create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, logo_url text, description text, whatsapp text,
  is_active boolean not null default true, created_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, icon text, description text,
  sort_order int not null default 0, is_active boolean not null default true,
  seo_title text, seo_description text, keywords text[] not null default '{}',
  created_at timestamptz not null default now()
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.sellers(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  slug text unique not null, title text not null, short_description text, description text,
  features jsonb not null default '[]', benefits jsonb not null default '[]', tags text[] not null default '{}',
  cover_image text, gallery jsonb not null default '[]', price numeric not null default 0,
  packages jsonb not null default '[]', status content_status not null default 'draft',
  is_featured boolean not null default false, whatsapp_cta text,
  seo_title text, seo_description text, keywords text[] not null default '{}', slug_path text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.profiles(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  seller_id uuid references public.sellers(id) on delete set null,
  package_name text, amount numeric not null default 0,
  buyer_name text, buyer_wa text, buyer_email text,
  status order_status not null default 'new', notes text,
  created_at timestamptz not null default now()
);
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique,
  order_id uuid references public.orders(id) on delete set null,
  buyer_id uuid references public.profiles(id) on delete set null,
  buyer_name text, buyer_wa text, buyer_email text,
  amount numeric not null default 0, items jsonb not null default '[]',
  status invoice_status not null default 'draft',
  public_token uuid unique not null default gen_random_uuid(),
  due_date date, paid_at timestamptz, created_at timestamptz not null default now()
);
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null, title text, photo_url text, rating int not null default 5 check (rating between 1 and 5),
  content text not null, is_active boolean not null default true, sort_order int not null default 0
);
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null, excerpt text, content text, cover_image text,
  category_id uuid references public.categories(id) on delete set null, author text,
  status content_status not null default 'draft',
  seo_title text, seo_description text, focus_keyword text, keywords text[] not null default '{}',
  og_image text, published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger articles_touch before update on public.articles for each row execute function public.touch_updated_at();
create table public.site_settings (
  key text primary key, value jsonb, updated_at timestamptz not null default now()
);

grant select on public.sellers, public.categories, public.products, public.testimonials, public.articles, public.site_settings to anon;
grant select, insert, update, delete on public.sellers, public.categories, public.products, public.testimonials, public.articles, public.site_settings, public.orders, public.invoices to authenticated;
grant all on public.sellers, public.categories, public.products, public.testimonials, public.articles, public.site_settings, public.orders, public.invoices to service_role;

alter table public.sellers enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.invoices enable row level security;
alter table public.testimonials enable row level security;
alter table public.articles enable row level security;
alter table public.site_settings enable row level security;

create policy "public sellers" on public.sellers for select to anon, authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "public categories" on public.categories for select to anon, authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "public products" on public.products for select to anon, authenticated using (status='published' or public.has_role(auth.uid(),'admin'));
create policy "public testimonials" on public.testimonials for select to anon, authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "public articles" on public.articles for select to anon, authenticated using ((status='published' and (published_at is null or published_at <= now())) or public.has_role(auth.uid(),'admin'));
create policy "public settings" on public.site_settings for select to anon, authenticated using (true);
create policy "buyer own orders" on public.orders for select to authenticated using (buyer_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "buyer own invoices" on public.invoices for select to authenticated using (buyer_id = auth.uid() or public.has_role(auth.uid(),'admin'));

do $$ declare t text; begin
  foreach t in array array['sellers','categories','products','orders','invoices','testimonials','articles','site_settings'] loop
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.has_role(auth.uid(),''admin''))', t);
  end loop;
end $$;

create or replace function public.enforce_seo_products() returns trigger language plpgsql set search_path = public as $$
begin
  if new.status='published' and (coalesce(trim(new.seo_title),'')='' or coalesce(trim(new.seo_description),'')='' or coalesce(array_length(new.keywords,1),0)=0) then
    raise exception 'SEO wajib diisi (judul, deskripsi, keywords) sebelum publish';
  end if;
  return new;
end $$;
create or replace function public.enforce_seo_categories() returns trigger language plpgsql set search_path = public as $$
begin
  if new.is_active and (coalesce(trim(new.seo_title),'')='' or coalesce(trim(new.seo_description),'')='' or coalesce(array_length(new.keywords,1),0)=0) then
    raise exception 'SEO wajib diisi (judul, deskripsi, keywords) sebelum kategori aktif';
  end if;
  return new;
end $$;
create or replace function public.enforce_seo_articles() returns trigger language plpgsql set search_path = public as $$
begin
  if new.status='published' then
    if coalesce(trim(new.seo_title),'')='' or coalesce(trim(new.seo_description),'')='' or coalesce(trim(new.focus_keyword),'')='' then
      raise exception 'SEO wajib diisi (judul, deskripsi, focus keyword) sebelum publish';
    end if;
    if new.published_at is null then new.published_at = now(); end if;
  end if;
  return new;
end $$;
create trigger products_seo before insert or update on public.products for each row execute function public.enforce_seo_products();
create trigger categories_seo before insert or update on public.categories for each row execute function public.enforce_seo_categories();
create trigger articles_seo before insert or update on public.articles for each row execute function public.enforce_seo_articles();

create or replace function public.invoice_defaults() returns trigger language plpgsql security definer set search_path = public as $$
declare prefix text; n int;
begin
  if new.invoice_number is null then
    prefix := 'INV-' || to_char(now(),'YYYYMM') || '-';
    select coalesce(max(substring(invoice_number from 12)::int),0)+1 into n from public.invoices where invoice_number like prefix || '%';
    new.invoice_number := prefix || lpad(n::text,4,'0');
  end if;
  if new.status='paid' and new.paid_at is null then new.paid_at := now(); end if;
  if new.status<>'paid' then new.paid_at := null; end if;
  return new;
end $$;
create trigger invoices_defaults before insert or update on public.invoices for each row execute function public.invoice_defaults();

create or replace function public.get_invoice_by_token(_token uuid)
returns table(invoice_number text, buyer_name text, buyer_wa text, buyer_email text, amount numeric, items jsonb, status invoice_status, due_date date, paid_at timestamptz, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select invoice_number, buyer_name, buyer_wa, buyer_email, amount, items, status, due_date, paid_at, created_at
  from public.invoices where public_token = _token and status <> 'draft'
$$;
grant execute on function public.get_invoice_by_token(uuid) to anon, authenticated;

create policy "media admin read" on storage.objects for select to authenticated using (bucket_id='media' and public.has_role(auth.uid(),'admin'));
create policy "media admin write" on storage.objects for insert to authenticated with check (bucket_id='media' and public.has_role(auth.uid(),'admin'));
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id='media' and public.has_role(auth.uid(),'admin'));
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id='media' and public.has_role(auth.uid(),'admin'));

insert into public.sellers (slug,name,description,whatsapp,logo_url) values
('kreasi-digital','Kreasi Digital','Studio kreatif untuk desain dan branding.','6281234567890','https://api.dicebear.com/9.x/initials/svg?seed=KD&backgroundColor=1e3a8a'),
('webpro-studio','WebPro Studio','Spesialis pembuatan website & aplikasi.','6281234567891','https://api.dicebear.com/9.x/initials/svg?seed=WP&backgroundColor=f97316'),
('growth-lab','Growth Lab','Agensi digital marketing berbasis data.','6281234567892','https://api.dicebear.com/9.x/initials/svg?seed=GL&backgroundColor=0f172a');

insert into public.categories (slug,name,icon,description,sort_order,seo_title,seo_description,keywords) values
('website','Pembuatan Website','Globe','Website company profile, toko online, dan landing page profesional.',1,'Jasa Pembuatan Website Profesional | Dimaloka','Temukan jasa pembuatan website profesional untuk bisnis Anda: company profile, toko online, dan landing page cepat, responsif, dan SEO friendly di Dimaloka.',array['jasa pembuatan website','website bisnis']),
('desain-grafis','Desain Grafis','Palette','Logo, branding, feed sosial media, dan materi promosi.',2,'Jasa Desain Grafis & Logo | Dimaloka','Jasa desain grafis profesional untuk logo, identitas brand, konten sosial media, dan materi promosi yang menarik dan konsisten bersama desainer di Dimaloka.',array['jasa desain logo','desain grafis']),
('digital-marketing','Digital Marketing','Megaphone','Iklan Meta & Google Ads, manajemen kampanye berbasis data.',3,'Jasa Digital Marketing & Ads | Dimaloka','Tingkatkan penjualan dengan jasa digital marketing: iklan Meta Ads, Google Ads, dan strategi kampanye berbasis data yang terukur hasilnya bersama Dimaloka.',array['jasa digital marketing','jasa iklan']),
('seo','SEO','Search','Optimasi mesin pencari agar website tampil di halaman satu Google.',4,'Jasa SEO Halaman 1 Google | Dimaloka','Jasa SEO profesional untuk menaikkan peringkat website Anda di Google: riset keyword, optimasi on-page, technical SEO, dan backlink berkualitas di Dimaloka.',array['jasa seo','seo website']),
('aplikasi','Aplikasi Mobile','Smartphone','Aplikasi Android & iOS sesuai kebutuhan bisnis Anda.',5,'Jasa Pembuatan Aplikasi Mobile | Dimaloka','Jasa pembuatan aplikasi mobile Android dan iOS untuk bisnis Anda, dari desain UI/UX hingga rilis ke Play Store dan App Store bersama developer Dimaloka.',array['jasa pembuatan aplikasi','aplikasi android']),
('video','Video & Animasi','Clapperboard','Video promosi, motion graphic, dan editing konten.',6,'Jasa Video Editing & Animasi | Dimaloka','Jasa video editing, motion graphic, dan animasi untuk promosi brand Anda di media sosial, website, dan iklan digital dengan hasil memukau di Dimaloka.',array['jasa video editing','motion graphic']);

insert into public.products (seller_id,category_id,slug,title,short_description,description,features,benefits,tags,cover_image,gallery,price,packages,status,is_featured,seo_title,seo_description,keywords)
select s.id,c.id,v.slug,v.title,v.sd,v.d,v.f::jsonb,v.b::jsonb,v.t,v.img,jsonb_build_array(v.img),v.price,v.pk::jsonb,'published',v.hot,v.title||' | Dimaloka',v.sd||' Pesan mudah lewat WhatsApp dan dapatkan hasil profesional bersama tim berpengalaman di Dimaloka.',v.t
from (values
 ('webpro-studio','website','website-company-profile','Website Company Profile Premium','Website company profile modern, cepat, dan SEO friendly.','<p>Bangun kredibilitas bisnis Anda dengan website company profile yang modern dan responsif.</p><h2>Apa yang Anda dapatkan</h2><p>Desain custom, domain, hosting, dan optimasi kecepatan.</p>','["Desain custom","Gratis domain & hosting 1 tahun","Responsif mobile","SEO dasar"]','["Bisnis lebih dipercaya","Mudah ditemukan di Google","Siap dalam 7 hari"]',array['website','company profile'],'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',1500000,'[{"name":"Basic","price":1500000,"items":["5 halaman","1 revisi"]},{"name":"Standard","price":3000000,"items":["10 halaman","3 revisi","Blog"]},{"name":"Enterprise","price":6000000,"items":["Unlimited halaman","Revisi tanpa batas","Integrasi CRM"]}]',true),
 ('webpro-studio','website','toko-online','Toko Online Siap Jualan','Toko online lengkap dengan katalog dan pembayaran.','<p>Toko online siap pakai untuk mulai berjualan hari ini.</p>','["Katalog produk","Keranjang belanja","Integrasi ongkir"]','["Jualan 24 jam","Kelola stok mudah"]',array['toko online','ecommerce'],'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',3500000,'[{"name":"Basic","price":3500000,"items":["50 produk"]},{"name":"Standard","price":6000000,"items":["500 produk","Payment gateway"]}]',false),
 ('kreasi-digital','desain-grafis','desain-logo-profesional','Desain Logo Profesional','Logo unik yang mencerminkan identitas brand Anda.','<p>Logo profesional dengan konsep matang dan file lengkap.</p>','["3 konsep awal","File vektor","Brand guideline mini"]','["Brand mudah diingat","Siap cetak & digital"]',array['logo','branding'],'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&q=80',500000,'[{"name":"Basic","price":500000,"items":["2 konsep","2 revisi"]},{"name":"Standard","price":1200000,"items":["4 konsep","Revisi tanpa batas"]}]',true),
 ('kreasi-digital','desain-grafis','konten-feed-instagram','Paket Konten Feed Instagram','Desain feed Instagram konsisten dan menarik.','<p>Feed Instagram rapi untuk menaikkan engagement.</p>','["30 desain/bulan","Caption","Template story"]','["Engagement naik","Brand konsisten"]',array['instagram','sosial media'],'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&q=80',900000,'[{"name":"Basic","price":900000,"items":["15 desain"]},{"name":"Standard","price":1600000,"items":["30 desain"]}]',false),
 ('growth-lab','digital-marketing','jasa-meta-ads','Jasa Iklan Meta Ads','Kelola iklan Facebook & Instagram dengan ROAS terukur.','<p>Iklan tertarget untuk mendatangkan pembeli potensial.</p>','["Riset audiens","Copywriting iklan","Laporan mingguan"]','["Penjualan naik","Biaya iklan efisien"]',array['meta ads','iklan'],'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1200&q=80',1500000,'[{"name":"Basic","price":1500000,"items":["1 campaign"]},{"name":"Standard","price":2500000,"items":["3 campaign"]}]',true),
 ('growth-lab','seo','seo-bulanan','Paket SEO Bulanan','Naikkan ranking website di Google secara konsisten.','<p>Strategi SEO menyeluruh: on-page, technical, dan off-page.</p>','["Riset keyword","Optimasi on-page","Backlink berkualitas"]','["Traffic organik naik","Leads gratis jangka panjang"]',array['seo','google'],'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=1200&q=80',2000000,'[{"name":"Basic","price":2000000,"items":["10 keyword"]},{"name":"Standard","price":3500000,"items":["25 keyword"]}]',true),
 ('webpro-studio','aplikasi','aplikasi-android','Aplikasi Android Custom','Aplikasi Android sesuai alur bisnis Anda.','<p>Aplikasi Android dari desain hingga rilis Play Store.</p>','["Desain UI/UX","Backend","Rilis Play Store"]','["Operasional efisien","Pelanggan loyal"]',array['android','aplikasi'],'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80',8000000,'[{"name":"Basic","price":8000000,"items":["5 fitur"]},{"name":"Enterprise","price":20000000,"items":["Fitur custom","Maintenance 6 bulan"]}]',false),
 ('kreasi-digital','video','video-promosi','Video Promosi & Motion Graphic','Video promosi singkat yang memikat.','<p>Video promosi 30–60 detik untuk sosial media dan iklan.</p>','["Naskah","Voice over","Musik berlisensi"]','["Pesan tersampaikan cepat","Cocok untuk iklan"]',array['video','motion graphic'],'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&q=80',1200000,'[{"name":"Basic","price":1200000,"items":["30 detik"]},{"name":"Standard","price":2200000,"items":["60 detik","2 revisi"]}]',true)
) as v(seller,cat,slug,title,sd,d,f,b,t,img,price,pk,hot)
join public.sellers s on s.slug=v.seller join public.categories c on c.slug=v.cat;

insert into public.testimonials (name,title,rating,content,sort_order,photo_url) values
('Rina Pratiwi','Owner Kopi Senja',5,'Website kami jadi dalam seminggu dan pesanan online langsung naik. Prosesnya gampang, cukup chat WhatsApp.',1,'https://i.pravatar.cc/150?img=47'),
('Budi Santoso','Founder Tokoku.id',5,'Iklan Meta Ads-nya rapi dan laporannya jelas. ROAS naik hampir dua kali lipat.',2,'https://i.pravatar.cc/150?img=12'),
('Dewi Lestari','Marketing Manager',4,'Desain logonya sesuai banget dengan karakter brand kami. Revisi cepat.',3,'https://i.pravatar.cc/150?img=32'),
('Andi Wijaya','Komunitas UMKM Bandung',5,'Banyak pilihan jasa dalam satu tempat, invoice jelas, admin responsif.',4,'https://i.pravatar.cc/150?img=68');

insert into public.articles (slug,title,excerpt,content,cover_image,author,status,seo_title,seo_description,focus_keyword,keywords,category_id)
select 'tips-memilih-jasa-pembuatan-website','Tips Memilih Jasa Pembuatan Website untuk Bisnis','Panduan praktis memilih jasa pembuatan website yang tepat agar investasi digital Anda maksimal.',
'<p>Memilih jasa pembuatan website yang tepat adalah langkah awal bisnis go digital. Berikut panduannya.</p><h2>1. Lihat portofolio</h2><p>Pastikan gaya desain sesuai brand Anda. Lihat juga <a href="/kategori/website">layanan website di Dimaloka</a>.</p><h2>2. Pastikan SEO friendly</h2><p>Website harus cepat dan mudah dibaca Google.</p><h3>Kecepatan</h3><p>Gunakan hosting yang andal.</p>',
'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80','Tim Dimaloka','published','Tips Memilih Jasa Pembuatan Website untuk Bisnis','Panduan memilih jasa pembuatan website untuk bisnis: cek portofolio, kecepatan, SEO friendly, dan dukungan setelah rilis agar investasi digital Anda maksimal.','jasa pembuatan website',array['jasa pembuatan website','tips website'], id from public.categories where slug='website';
insert into public.articles (slug,title,excerpt,content,cover_image,author,status,seo_title,seo_description,focus_keyword,keywords,category_id)
select 'strategi-seo-untuk-umkm','Strategi SEO untuk UMKM agar Tampil di Google','Langkah sederhana strategi SEO yang bisa diterapkan UMKM untuk mendatangkan pelanggan gratis.',
'<p>Strategi SEO untuk UMKM tidak harus mahal. Mulailah dari dasar.</p><h2>Riset keyword lokal</h2><p>Gunakan kata kunci yang dicari pelanggan di kota Anda.</p><h2>Konten rutin</h2><p>Tulis artikel bermanfaat. Butuh bantuan? Lihat <a href="/kategori/seo">jasa SEO</a>.</p>',
'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200&q=80','Tim Dimaloka','published','Strategi SEO untuk UMKM agar Tampil di Google','Pelajari strategi SEO untuk UMKM: riset keyword lokal, konten rutin, dan optimasi Google Business agar bisnis Anda tampil di halaman pertama pencarian Google.','strategi seo',array['strategi seo','seo umkm'], id from public.categories where slug='seo';

insert into public.site_settings (key,value) values
('site_name','"Dimaloka"'),('site_tagline','"Marketplace Jasa Digital Terpercaya"'),
('contact_email','"halo@dimaloka.com"'),('contact_whatsapp','"6281234567890"'),('contact_address','"Jakarta, Indonesia"'),
('footer_about','"Dimaloka menghubungkan bisnis Anda dengan penyedia jasa digital terbaik: website, desain, marketing, dan lainnya."'),
('social_links','{"instagram":"https://instagram.com/dimaloka","telegram":"https://t.me/dimaloka","whatsapp":"https://wa.me/6281234567890"}'),
('global_seo_title','"Dimaloka — Marketplace Jasa Digital Terpercaya"'),
('global_seo_description','"Temukan jasa pembuatan website, desain grafis, digital marketing, SEO, aplikasi, dan video terbaik. Order mudah via WhatsApp di Dimaloka."'),
('global_keywords','["marketplace jasa","jasa digital","jasa website"]'),
('google_analytics_id','""'),('search_console_meta','""'),('canonical_domain','""'),
('robots_txt','"User-agent: *\nAllow: /\nDisallow: /admin\n"'),
('payment_info','"BCA 1234567890 a.n. PT Dimaloka Digital"');
