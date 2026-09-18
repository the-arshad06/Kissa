# KISSA — a Tale of Untold Stories

A crowd-sourced digital notebook for preserving local histories: sign up, post
a story with a photo, and let others read, like, comment, follow, and share it.

Built with React 19 + Vite + React Router + Tailwind CSS v4, backed entirely by
Supabase (Auth, Postgres, Storage, Row Level Security). No extra UI libraries —
the photo cropper, notifications, and motion are all hand-built against what's
already in `package.json`.

## 1. Project structure

```
src/
  lib/
    supabaseClient.js     # Supabase client (reads env vars)
    api.js                # Every Supabase query: stories, likes, comments,
                           # follows, shares, notifications, categories, uploads
  context/
    AuthContext.jsx       # Session/profile state + signUp/signIn/signOut
  components/
    Navbar.jsx             # Top bar (desktop) + bottom nav (mobile)
    HamburgerMenu.jsx      # Slide-in panel: Profile, Explore, Settings,
                            # Terms, Contact, Logout/Login
    NotificationBell.jsx   # Dropdown preview of recent activity
    NotificationItem.jsx   # One notification row (shared by bell + full page)
    Footer.jsx, MainLayout.jsx
    MotifOrnament.jsx      # Decorative mandala-style SVG accent
    ImageCropperModal.jsx  # Pan/zoom circular photo cropper (avatar upload)
    ProtectedRoute.jsx     # Redirects to /login if not authenticated
    StoryCard.jsx, LikeButton.jsx, ShareButton.jsx, CommentSection.jsx
    Loader.jsx
  pages/
    Home.jsx                # Feed
    Login.jsx, Signup.jsx
    Search.jsx               # Search + category filters (fetched from DB)
    CreateStory.jsx, EditStory.jsx
    StoryDetail.jsx
    Profile.jsx               # My Stories / Liked Stories tabs, "+ New Story"
    EditProfile.jsx            # Uses ImageCropperModal for the avatar
    Settings.jsx, Terms.jsx, Contact.jsx, Notifications.jsx
  App.jsx                  # Routes
  main.jsx                 # Entry point (Router + AuthProvider + Toaster)
  index.css                # Tailwind v4 theme tokens + motion + Indian-motif
                            # decorative utilities (jali-bg, motif-divider, etc.)
supabase/
  schema.sql               # Your DB schema, kept here as reference (already run)
  additions.sql            # OPTIONAL: messages table for the Contact form
```

## 2. Supabase setup

The frontend is wired to **your** schema exactly as you created it:

- `stories(id, user_id, title, content, location, era, category, image_url, created_at, updated_at)`
- `likes(id, story_id, user_id)`, `comments(id, story_id, user_id, content, created_at)`
- `follows(id, follower_id, following_id)`, `shares(id, story_id, user_id)`
- `profiles(id, username, full_name, bio, avatar_url)`
- Buckets `story-images` / `avatars`, both scoped so uploads must live under
  `<user_id>/...` (matches `uploadStoryImage`/`uploadAvatar` in `lib/api.js`)

`supabase/schema.sql` is already reflected in your project — you don't need to
run it again. `supabase/additions.sql` is optional: run it if you want the
Contact page to save messages into Supabase (a `messages` table with an
insert-only policy). If you skip it, Contact automatically falls back to a
`mailto:` link instead — no code changes needed either way.

Steps:
1. **Project Settings → API**: copy the **Project URL** and **anon public key**
   into `.env`.
2. **Authentication → URL Configuration**: set Site URL to
   `http://localhost:5173` for local dev (add your deployed URL later).
3. (Optional) **Authentication → Providers → Google**: enable it if you want the
   "Continue with Google" button to work — it's already wired up in
   `Login.jsx`/`Signup.jsx`, it just needs the provider turned on.

## 3. Frontend setup

```bash
npm install
cp .env.example .env
# edit .env and paste your Supabase URL + anon key
npm run dev
```

## 4. Navigation model

- **Top bar**: logo, search (desktop), notification bell, avatar (links
  straight to your own profile — no dropdown), hamburger icon.
- **Hamburger menu**: Profile, Explore, Settings, Terms & Conditions, Contact,
  and Logout (or Log In if signed out).
- **Mobile bottom nav**: Home, Explore, Alerts, Profile.
- **Settings page**: Edit Profile, Terms & Conditions, Contact Us, Logout —
  reachable from the hamburger.
- Story creation happens from the **Profile** page ("+ New Story"), not the
  nav bar.

## 5. How the core features map to the database

| Feature | Table(s) | Notes |
|---|---|---|
| Sign up / log in | `auth.users` + `profiles` | Trigger auto-creates the profile row |
| Home feed | `stories` (+ embedded `profiles`, `likes(count)`, `comments(count)`) | Paginated, newest first |
| Create/edit a story + photo | `stories` + `story-images` bucket | Image uploads to Storage, URL saved on the row |
| Like | `likes` | One row per (story, user); RLS blocks liking as someone else |
| Comment | `comments` | Anyone logged in can comment; only the author can delete their own |
| Follow | `follows` | (follower_id, following_id) pair; used for follower/following counts |
| Share | `shares` | Native Web Share API (clipboard-copy fallback); logs a row when a logged-in user shares |
| Notifications | `likes` + `comments` + `follows` | Computed on the fly (no notifications table needed) — recent activity on your stories, merged and sorted |
| Liked Stories tab | `likes` → `stories` | Shown only on your own profile |
| Search category filters | `stories.category` | Fetched distinct from the DB, not hardcoded |
| Contact form | `messages` (optional, see `additions.sql`) | Falls back to `mailto:` if the table doesn't exist |
| Profile photo | `avatars` bucket | Cropped client-side (pan/zoom) before upload, no extra dependency |

## 6. Notes / things you may want to change

- There's no `status`/draft column in your `stories` table, so **Create Story**
  always publishes immediately. If you'd like drafts, add:
  ```sql
  alter table public.stories add column status text not null default 'published'
    check (status in ('draft', 'published'));
  ```
  and tell me — I'll wire the draft toggle back in.
- Username is set at signup and currently locked in `EditProfile` — remove the
  `disabled` on that input if you want to allow changing it (add a uniqueness
  check first).
- The design system (colors, type scale, "paper" shadows, Indian-motif accents)
  lives entirely in `src/index.css` under `@theme` and a few utility classes
  (`.jali-bg`, `.motif-divider`, `.motif-corner`, `.animate-fade-in-up`, etc.).
