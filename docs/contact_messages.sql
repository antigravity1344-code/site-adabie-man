-- literary site: contact form inbox
-- Run once in Supabase → SQL Editor → New query → Run

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  author_name text,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "contact_insert_anon" on public.contact_messages;

create policy "contact_insert_anon"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (
    char_length(trim(body)) between 1 and 4000
    and (author_name is null or char_length(trim(author_name)) <= 80)
  );

-- No public SELECT: you read messages only in Dashboard → Table Editor
