-- این کد رو داخل پنل Supabase اجرا کن:
-- از منوی سمت چپ برو به بخش SQL Editor، یک New query بساز،
-- این متن رو کامل پیست کن، و دکمه‌ی Run رو بزن.

-- ===== جدول کامنت‌ها =====
create table comments (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_id text not null,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table comments enable row level security;

create policy "هرکسی می‌تواند نظرات را بخواند"
  on comments for select
  using (true);

create policy "هرکسی می‌تواند نظر ثبت کند"
  on comments for insert
  with check (true);

-- ===== جدول پیام‌های تماس =====
create table messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

create policy "فقط ادمین می‌تواند پیام‌ها را بخواند"
  on messages for select
  using (false);

create policy "هرکسی می‌تواند پیام ارسال کند"
  on messages for insert
  with check (true);
