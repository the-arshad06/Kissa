-- =========================================================
-- KISSA — optional additive migrations
-- Both blocks are safe to run against your existing database:
-- they only add things, never touch your existing tables' data.
-- =========================================================

-- ---------------------------------------------------------
-- 1. Multiple photos per story ("Visual Evidence" gallery)
-- `image_url` stays as the cover photo (used on cards); `image_urls`
-- holds the full set shown on the story detail page. Required for the
-- multi-photo upload feature in Create/Edit Story.
-- ---------------------------------------------------------
alter table public.stories
  add column if not exists image_urls text[] not null default '{}';

-- ---------------------------------------------------------
-- 2. Contact form messages
-- Run this if you want the Contact page to save messages into Supabase.
-- If you skip it, Contact automatically falls back to a mailto: link —
-- no code changes needed either way.
-- ---------------------------------------------------------
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

-- ---------------------------------------------------------
-- 3. Rate-limited username changes (2 changes per 14 days)
-- The limit is enforced here in the database via change_username(), not
-- just in the frontend — calling the Supabase API directly can't bypass it.
-- ---------------------------------------------------------
create table if not exists public.username_history (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  old_username text not null,
  new_username text not null,
  changed_at   timestamptz not null default now()
);

create index if not exists username_history_user_id_idx on public.username_history(user_id, changed_at desc);

alter table public.username_history enable row level security;

-- Users can see their own change history (to show "X changes left").
drop policy if exists "Users can view their own username history" on public.username_history;
create policy "Users can view their own username history"
on public.username_history for select to authenticated
using (user_id = auth.uid());

-- No insert/update/delete policy for regular users — every write goes
-- through change_username() below, which runs with the owner's privileges
-- (security definer) so the rate limit can't be skipped by calling
-- `.from('profiles').update({ username })` directly: that path is only
-- allowed to touch username via this function, never RLS alone.
revoke update (username) on public.profiles from authenticated;

create or replace function public.change_username(new_username text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  current_username text;
  recent_changes int;
  cleaned text;
  result public.profiles;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  cleaned := lower(trim(new_username));

  if cleaned !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'Username must be 3-20 characters: lowercase letters, numbers, underscores only';
  end if;

  select username into current_username from public.profiles where id = uid;

  if current_username = cleaned then
    return (select p from public.profiles p where id = uid);
  end if;

  select count(*) into recent_changes
  from public.username_history
  where user_id = uid and changed_at > now() - interval '14 days';

  if recent_changes >= 2 then
    raise exception 'You can only change your username twice every 14 days. Please try again later.';
  end if;

  if exists (select 1 from public.profiles where username = cleaned and id <> uid) then
    raise exception 'That username is already taken';
  end if;

  update public.profiles set username = cleaned where id = uid
  returning * into result;

  insert into public.username_history (user_id, old_username, new_username)
  values (uid, current_username, cleaned);

  return result;
end;
$$;

grant execute on function public.change_username(text) to authenticated;
