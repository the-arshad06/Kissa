-- =========================================================
-- KISSA — optional addition: contact messages
-- Run this once if you want the Contact page to actually save
-- messages into Supabase (recommended). If you skip this, the
-- Contact page automatically falls back to a mailto: link instead
-- — no code changes needed either way.
-- =========================================================

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null check (char_length(message) between 1 and 4000),
  created_at  timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Anyone (including logged-out visitors) can submit the contact form.
drop policy if exists "Anyone can send a message" on public.messages;
create policy "Anyone can send a message"
on public.messages for insert
to anon, authenticated
with check (true);

-- Nobody can read messages through the API — view them in the
-- Supabase Table Editor (which uses the service role and bypasses RLS).
