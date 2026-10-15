-- این کد رو داخل پنل Supabase اجرا کن:
-- از منوی سمت چپ برو به بخش SQL Editor، یک New query بساز،
-- این متن رو کامل پیست کن، و دکمه‌ی Run رو بزن.
--
-- این فایل منبع واحد و هماهنگ با کد پروژه است (نام جدول‌ها و ستون‌ها
-- دقیقاً همان چیزی است که src/components/Comments.jsx،
-- src/pages/ContactPage.jsx و src/pages/SubmitWork.jsx استفاده می‌کنند).
-- جزئیات بیشتر و سیاست‌های دقیق‌تر: docs/supabase-rls.md

-- ===== جدول کامنت‌ها (Comments.jsx) =====
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_id text not null,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table comments enable row level security;

drop policy if exists "هرکسی می‌تواند نظرات را بخواند" on comments;
create policy "هرکسی می‌تواند نظرات را بخواند"
  on comments for select
  using (true);

drop policy if exists "هرکسی می‌تواند نظر ثبت کند" on comments;
create policy "هرکسی می‌تواند نظر ثبت کند"
  on comments for insert
  with check (
    char_length(trim(author_name)) between 1 and 80
    and char_length(trim(body)) between 1 and 2000
  );

-- ===== جدول پیام‌های تماس (ContactPage.jsx) =====
create table if not exists contact_messages (
  id bigint generated always as identity primary key,
  author_name text,
  body text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

drop policy if exists "contact_insert_anon" on contact_messages;
create policy "contact_insert_anon"
  on contact_messages for insert
  to anon, authenticated
  with check (
    char_length(trim(body)) between 1 and 4000
    and (author_name is null or char_length(trim(author_name)) <= 80)
  );
-- عمداً هیچ سیاست select برای anon ساخته نشده: پیام‌ها فقط از
-- Supabase Dashboard → Table Editor → contact_messages قابل مشاهده‌اند.

-- ===== جدول آثار ارسالی (SubmitWork.jsx) =====
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  title text not null,
  body text not null,
  author_name text not null,
  author_email text,
  image_url text,
  audio_url text,
  created_at timestamptz not null default now()
);

-- اگر این جدول را قبلاً ساخته‌اید، فقط همین خط را اجرا کنید تا ستون جدید اضافه شود:
alter table submissions add column if not exists audio_url text;

alter table submissions enable row level security;

drop policy if exists "هرکسی می‌تواند اثر ارسال کند" on submissions;
create policy "هرکسی می‌تواند اثر ارسال کند"
  on submissions for insert
  with check (
    char_length(trim(title)) between 1 and 200
    and char_length(trim(body)) between 1 and 20000
    and char_length(trim(author_name)) between 1 and 80
  );
-- عمداً هیچ سیاست select ساخته نشده: آثار ارسالی فقط از
-- Supabase Dashboard → Table Editor → submissions قابل بررسی‌اند.

-- ===== Storage bucket برای عکس آثار ارسالی =====
-- این بخش را به‌جای SQL، از Supabase Dashboard انجام بده:
-- 1. Storage → New bucket → نام: submission-images → Public: خیر (private)
-- 2. محدودیت حجم فایل را در تنظیمات bucket مثلاً روی 5MB بگذار
-- 3. Policies → یک policy برای INSERT با to anon/authenticated و
--    (اختیاری) محدودیت نوع فایل (image/*) اضافه کن

-- ===== Storage bucket برای فایل صوتی خوانش‌های ارسالی =====
-- همین کار را برای فایل‌های صوتی هم تکرار کن:
-- 1. Storage → New bucket → نام: submission-audio → Public: خیر (private)
-- 2. محدودیت حجم فایل را در تنظیمات bucket مثلاً روی 15MB بگذار
-- 3. Policies → یک policy برای INSERT با to anon/authenticated و
--    (اختیاری) محدودیت نوع فایل (audio/*) اضافه کن
