# Supabase RLS checklist (literary site)

Client keys moved to `VITE_SUPABASE_*` env vars. The anon/publishable key is still public in the browser — **Row Level Security must be enabled** on every table/storage the site uses.

## Tables typically used
- `comments` (content_type, content_id, author_name, body, created_at)
- submissions / works table used by `SubmitWork.jsx`
- Storage bucket for uploaded images

## Example policies (adjust names to your schema)

```sql
-- comments: anyone can read
alter table comments enable row level security;

create policy "comments_select_public"
  on comments for select
  using (true);

-- comments: insert only with non-empty trimmed fields (basic)
create policy "comments_insert_public"
  on comments for insert
  with check (
    char_length(trim(author_name)) between 1 and 80
    and char_length(trim(body)) between 1 and 2000
  );

-- deny update/delete from anon
-- (no update/delete policies for anon role)
```

Storage: prefer authenticated uploads, or a bucket with MIME/size limits and no public write without checks.

## After deploy
1. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host (Vercel/Netlify/etc.).
2. Confirm RLS policies in Supabase Dashboard → Authentication → Policies.
3. Never put the **service_role** key in the frontend.

## contact_messages (فرم تماس)

تمام جدول‌ها (comments، contact_messages، submissions) و سیاست‌های RLS
یک‌جا و هماهنگ با کد پروژه در فایل `supabase-setup.sql` (ریشه‌ی پروژه)
قرار دارند — همان را در Supabase SQL Editor اجرا کن.

View messages: Supabase → Table Editor → `contact_messages`.
View submissions: Supabase → Table Editor → `submissions`.
