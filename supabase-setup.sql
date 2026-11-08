-- این فایل را در SQL Editor پروژه Supabase اجرا کنید.
-- روی پروژه خالی امن است و دوباره اجرا کردنش سیاست‌ها را از نو می‌سازد.
-- نام جدول‌ها و ستون‌ها با Comments.jsx، DailyNotes.jsx، PoemsPage.jsx،
-- ContactPage.jsx و SubmitWork.jsx یکی است.
--
-- نیاز به تصمیم: سقف نرخ (هرزنامه) با RLS ساده ساخته نمی‌شود و اینجا نیست.
-- نیاز به تصمیم: نظرها بلافاصله برای همه خوانده می‌شوند. اگر پیش از نمایش
-- باید بررسی شوند، سیاست select و یک ستون وضعیت در کد لازم است.

-- ===== نظرات =====
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_id text not null,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- poem / story / note همان مقدارهایی است که صفحات شعر، داستان و یادداشت می‌فرستند.
alter table public.comments drop constraint if exists comments_fields_check;
alter table public.comments add constraint comments_fields_check check (
  content_type in ('poem', 'story', 'note')
  and char_length(trim(content_id)) between 1 and 200
  and char_length(trim(author_name)) between 1 and 100
  and char_length(trim(body)) between 1 and 2000
);

alter table public.comments enable row level security;

revoke all on table public.comments from anon;
grant select, insert on table public.comments to anon;

drop policy if exists "هرکسی می‌تواند نظرات را بخواند" on public.comments;
drop policy if exists "هرکسی می‌تواند نظر ثبت کند" on public.comments;
drop policy if exists comments_select_anon on public.comments;
drop policy if exists comments_insert_anon on public.comments;

create policy comments_select_anon
  on public.comments for select
  to anon
  using (true);

create policy comments_insert_anon
  on public.comments for insert
  to anon
  with check (
    content_type in ('poem', 'story', 'note')
    and char_length(trim(content_id)) between 1 and 200
    and char_length(trim(author_name)) between 1 and 100
    and char_length(trim(body)) between 1 and 2000
  );

-- ===== پیام تماس =====
create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  author_name text,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages drop constraint if exists contact_messages_fields_check;
alter table public.contact_messages add constraint contact_messages_fields_check check (
  char_length(trim(body)) between 1 and 5000
  and (author_name is null or char_length(trim(author_name)) between 1 and 100)
);

alter table public.contact_messages enable row level security;

revoke all on table public.contact_messages from anon;
grant insert on table public.contact_messages to anon;
grant usage on sequence public.contact_messages_id_seq to anon;

drop policy if exists "contact_insert_anon" on public.contact_messages;
drop policy if exists contact_messages_insert_anon on public.contact_messages;

-- سیاست select عمداً نیست: anon پیام‌ها را نمی‌خواند.
create policy contact_messages_insert_anon
  on public.contact_messages for insert
  to anon
  with check (
    char_length(trim(body)) between 1 and 5000
    and (author_name is null or char_length(trim(author_name)) between 1 and 100)
  );

-- ===== آثار ارسالی =====
-- فرم فقط poem و story می‌فرستد، نه note.
create table if not exists public.submissions (
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

alter table public.submissions add column if not exists audio_url text;

alter table public.submissions drop constraint if exists submissions_fields_check;
alter table public.submissions add constraint submissions_fields_check check (
  content_type in ('poem', 'story')
  and char_length(trim(title)) between 1 and 200
  and char_length(trim(body)) between 1 and 20000
  and char_length(trim(author_name)) between 1 and 100
  and (
    author_email is null
    or (
      char_length(trim(author_email)) between 5 and 254
      and trim(author_email) ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
  )
  and (image_url is null or char_length(trim(image_url)) between 1 and 1000)
  and (audio_url is null or char_length(trim(audio_url)) between 1 and 1000)
);

alter table public.submissions enable row level security;

revoke all on table public.submissions from anon;
grant insert on table public.submissions to anon;

drop policy if exists "هرکسی می‌تواند اثر ارسال کند" on public.submissions;
drop policy if exists submissions_insert_anon on public.submissions;

-- سیاست select عمداً نیست: anon اثر ارسالی را نمی‌خواند.
create policy submissions_insert_anon
  on public.submissions for insert
  to anon
  with check (
    content_type in ('poem', 'story')
    and char_length(trim(title)) between 1 and 200
    and char_length(trim(body)) between 1 and 20000
    and char_length(trim(author_name)) between 1 and 100
    and (
      author_email is null
      or (
        char_length(trim(author_email)) between 5 and 254
        and trim(author_email) ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      )
    )
    and (image_url is null or char_length(trim(image_url)) between 1 and 1000)
    and (audio_url is null or char_length(trim(audio_url)) between 1 and 1000)
  );

-- ===== باکت‌های فایل =====
-- عمومی‌اند تا getPublicUrl در SubmitWork.jsx بدون تغییر کد فایل را باز کند.
-- هر کس آدرس را داشته باشد فایل را می‌بیند. فهرست و حذف برای anon بسته است.
-- نیاز به تصمیم: باکت خصوصی امن‌تر است، ولی آن وقت باید کد به‌جای getPublicUrl
-- لینک امضاشده بسازد.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'submission-images',
    'submission-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'submission-audio',
    'submission-audio',
    true,
    15728640,
    array['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav']
  )
on conflict (id) do nothing;

alter table storage.objects enable row level security;

drop policy if exists submission_objects_insert_anon on storage.objects;

create policy submission_objects_insert_anon
  on storage.objects for insert
  to anon
  with check (bucket_id in ('submission-images', 'submission-audio'));
