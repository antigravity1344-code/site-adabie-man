-- این فایل را در SQL Editor پروژه Supabase اجرا کنید.
-- روی پروژه خالی امن است و دوباره اجرا کردنش سیاست‌ها را از نو می‌سازد.
-- نام جدول‌ها و ستون‌ها با Comments.jsx، DailyNotes.jsx، PoemsPage.jsx،
-- ContactPage.jsx و SubmitWork.jsx یکی است.
--
-- سقف نرخ هر IP در انتهای فایل است و فقط روی insert اعمال می‌شود.
-- تأیید نظر با جدول admins و صفحهٔ /moderate است، نه از منوی عمومی.

-- ===== نظرات =====
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_id text not null,
  author_name text not null,
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.comments add column if not exists approved boolean not null default false;

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

-- anon فقط نظر تأییدشده را می‌بیند. تأیید از Table Editor با ستون approved است.
create policy comments_select_anon
  on public.comments for select
  to anon
  using (approved = true);

create policy comments_insert_anon
  on public.comments for insert
  to anon
  with check (
    approved = false
    and content_type in ('poem', 'story', 'note')
    and char_length(trim(content_id)) between 1 and 200
    and char_length(trim(author_name)) between 1 and 100
    and char_length(trim(body)) between 1 and 2000
  );

-- مدیر: کاربر واردشده‌ای که ردیفش در admins است.
-- anon عوض نمی‌شود. تأیید و حذف insert نیستند و سقف نرخ را رد نمی‌کنند.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.admins enable row level security;
revoke all on table public.admins from anon, authenticated;
grant select on table public.admins to authenticated;

drop policy if exists admins_select_self on public.admins;
create policy admins_select_self
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

grant select, update, delete on table public.comments to authenticated;

drop policy if exists comments_auth_select_approved on public.comments;
create policy comments_auth_select_approved
  on public.comments for select
  to authenticated
  using (approved = true);

drop policy if exists comments_admin_select on public.comments;
create policy comments_admin_select
  on public.comments for select
  to authenticated
  using (exists (
    select 1 from public.admins where user_id = auth.uid()
  ));

drop policy if exists comments_admin_update on public.comments;
create policy comments_admin_update
  on public.comments for update
  to authenticated
  using (exists (
    select 1 from public.admins where user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.admins where user_id = auth.uid()
  ));

drop policy if exists comments_admin_delete on public.comments;
create policy comments_admin_delete
  on public.comments for delete
  to authenticated
  using (exists (
    select 1 from public.admins where user_id = auth.uid()
  ));

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

-- RLS روی storage.objects از قبل در Supabase روشن است؛ این نقش مالک جدول نیست.

drop policy if exists submission_objects_insert_anon on storage.objects;

create policy submission_objects_insert_anon
  on storage.objects for insert
  to anon
  with check (bucket_id in ('submission-images', 'submission-audio'));

-- ===== سقف نرخ بر اساس IP =====
-- نظر: ۵ تا در ۱۰ دقیقه. تماس: ۳ تا در ۱۰ دقیقه. اثر: ۳ تا در ۱ ساعت.
-- اگر IP در هدر نباشد (مثلاً SQL Editor)، سقف اعمال نمی‌شود.
-- تریگر فقط BEFORE INSERT است؛ تأیید و حذف مدیر از آن رد نمی‌شوند.
create table if not exists public.rate_limit_events (
  ip text not null,
  table_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_lookup_idx
  on public.rate_limit_events (ip, table_name, created_at);

alter table public.rate_limit_events enable row level security;

revoke all on table public.rate_limit_events from anon, authenticated;

create or replace function public.enforce_insert_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_headers text;
  headers json;
  client_ip text;
  window_start timestamptz;
  max_count integer;
  recent_count integer;
begin
  raw_headers := current_setting('request.headers', true);
  if raw_headers is null or btrim(raw_headers) = '' then
    return new;
  end if;

  begin
    headers := raw_headers::json;
  exception
    when others then
      return new;
  end;

  client_ip := nullif(btrim(headers->>'cf-connecting-ip'), '');
  if client_ip is null then
    client_ip := nullif(btrim(split_part(headers->>'x-forwarded-for', ',', 1)), '');
  end if;
  if client_ip is null then
    return new;
  end if;

  if tg_table_name = 'comments' then
    window_start := now() - interval '10 minutes';
    max_count := 5;
  elsif tg_table_name = 'contact_messages' then
    window_start := now() - interval '10 minutes';
    max_count := 3;
  elsif tg_table_name = 'submissions' then
    window_start := now() - interval '1 hour';
    max_count := 3;
  else
    return new;
  end if;

  delete from public.rate_limit_events
  where created_at < now() - interval '1 day';

  select count(*) into recent_count
  from public.rate_limit_events
  where ip = client_ip
    and table_name = tg_table_name
    and created_at >= window_start;

  if recent_count >= max_count then
    raise exception 'تعداد ارسال بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.';
  end if;

  insert into public.rate_limit_events (ip, table_name)
  values (client_ip, tg_table_name);

  return new;
end;
$$;

revoke all on function public.enforce_insert_rate_limit() from public;
grant execute on function public.enforce_insert_rate_limit() to anon, authenticated, service_role;

drop trigger if exists comments_rate_limit on public.comments;
create trigger comments_rate_limit
  before insert on public.comments
  for each row
  execute function public.enforce_insert_rate_limit();

drop trigger if exists contact_messages_rate_limit on public.contact_messages;
create trigger contact_messages_rate_limit
  before insert on public.contact_messages
  for each row
  execute function public.enforce_insert_rate_limit();

drop trigger if exists submissions_rate_limit on public.submissions;
create trigger submissions_rate_limit
  before insert on public.submissions
  for each row
  execute function public.enforce_insert_rate_limit();
