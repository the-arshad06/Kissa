-- =========================================================
-- KISSA DATABASE SETUP
-- (this is the schema you already ran — kept here as the source of truth
-- the frontend in src/lib/api.js is built against)
-- =========================================================

-- UUID generation
create extension if not exists pgcrypto;


-- =========================================================
-- 1. PROFILES
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamptz default now()
);


-- =========================================================
-- 2. STORIES
-- =========================================================

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  location text,
  era text,
  category text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


-- =========================================================
-- 3. LIKES
-- =========================================================

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),

  constraint unique_story_like unique (story_id, user_id)
);


-- =========================================================
-- 4. COMMENTS
-- =========================================================

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);


-- =========================================================
-- 5. FOLLOWS
-- =========================================================

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),

  constraint unique_follow unique (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);


-- =========================================================
-- 6. SHARES
-- =========================================================

create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);


-- =========================================================
-- 7. INDEXES
-- =========================================================

create index if not exists stories_user_id_idx on public.stories(user_id);
create index if not exists stories_created_at_idx on public.stories(created_at desc);
create index if not exists stories_category_idx on public.stories(category);
create index if not exists stories_location_idx on public.stories(location);
create index if not exists likes_story_id_idx on public.likes(story_id);
create index if not exists likes_user_id_idx on public.likes(user_id);
create index if not exists comments_story_id_idx on public.comments(story_id);
create index if not exists comments_user_id_idx on public.comments(user_id);
create index if not exists follows_follower_id_idx on public.follows(follower_id);
create index if not exists follows_following_id_idx on public.follows(following_id);
create index if not exists shares_story_id_idx on public.shares(story_id);


-- =========================================================
-- 8. ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.shares enable row level security;


-- =========================================================
-- 9. PROFILES POLICIES
-- =========================================================

create policy "Profiles are publicly readable"
on public.profiles for select
using (true);

create policy "Users can create their own profile"
on public.profiles for insert to authenticated
with check (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());


-- =========================================================
-- 10. STORIES POLICIES
-- =========================================================

create policy "Stories are publicly readable"
on public.stories for select
using (true);

create policy "Users can create their own stories"
on public.stories for insert to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own stories"
on public.stories for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own stories"
on public.stories for delete to authenticated
using (user_id = auth.uid());


-- =========================================================
-- 11. LIKES POLICIES
-- =========================================================

create policy "Likes are publicly readable"
on public.likes for select
using (true);

create policy "Users can create their own likes"
on public.likes for insert to authenticated
with check (user_id = auth.uid());

create policy "Users can delete their own likes"
on public.likes for delete to authenticated
using (user_id = auth.uid());


-- =========================================================
-- 12. COMMENTS POLICIES
-- =========================================================

create policy "Comments are publicly readable"
on public.comments for select
using (true);

create policy "Users can create their own comments"
on public.comments for insert to authenticated
with check (user_id = auth.uid());

create policy "Users can delete their own comments"
on public.comments for delete to authenticated
using (user_id = auth.uid());


-- =========================================================
-- 13. FOLLOWS POLICIES
-- =========================================================

create policy "Follows are publicly readable"
on public.follows for select
using (true);

create policy "Users can create their own follows"
on public.follows for insert to authenticated
with check (follower_id = auth.uid() and follower_id <> following_id);

create policy "Users can delete their own follows"
on public.follows for delete to authenticated
using (follower_id = auth.uid());


-- =========================================================
-- 14. SHARES POLICIES
-- =========================================================

create policy "Shares are publicly readable"
on public.shares for select
using (true);

create policy "Users can create their own shares"
on public.shares for insert to authenticated
with check (user_id = auth.uid());


-- =========================================================
-- 15. PROFILE CREATION TRIGGER
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
  requested_full_name text;
begin
  requested_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  requested_full_name := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');

  if requested_username is null then
    requested_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 12);
  end if;

  insert into public.profiles (id, username, full_name)
  values (new.id, requested_username, requested_full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();


-- =========================================================
-- 16. STORAGE BUCKETS
-- =========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('story-images', 'story-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;


-- =========================================================
-- 17. STORAGE POLICIES
-- =========================================================

create policy "Public can view avatars"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Users can upload their own avatars"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own avatars"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own avatars"
on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Public can view story images"
on storage.objects for select
using (bucket_id = 'story-images');

create policy "Users can upload their own story images"
on storage.objects for insert to authenticated
with check (bucket_id = 'story-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own story images"
on storage.objects for update to authenticated
using (bucket_id = 'story-images' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'story-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own story images"
on storage.objects for delete to authenticated
using (bucket_id = 'story-images' and (storage.foldername(name))[1] = auth.uid()::text);
