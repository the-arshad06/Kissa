import { supabase } from './supabaseClient'

// Matches your actual schema:
//   stories(id, user_id, title, content, location, era, category, image_url, created_at, updated_at)
//   likes(id, story_id, user_id)  comments(id, story_id, user_id, content)
//   follows(id, follower_id, following_id)  shares(id, story_id, user_id)
//   profiles(id, username, full_name, bio, avatar_url)

const STORY_SELECT = `
  *,
  profiles:user_id ( username, full_name, avatar_url ),
  likes ( count ),
  comments ( count )
`

// Supabase returns embedded aggregates as arrays, e.g. likes: [{ count: 3 }].
// Flatten each row into the plain shape the UI components expect.
function mapStory(row) {
  if (!row) return row
  const { profiles, likes, comments, ...rest } = row
  return {
    ...rest,
    username: profiles?.username,
    full_name: profiles?.full_name,
    avatar_url: profiles?.avatar_url,
    like_count: likes?.[0]?.count ?? 0,
    comment_count: comments?.[0]?.count ?? 0,
  }
}

function mapStories(rows) {
  return (rows || []).map(mapStory)
}

// ---------- Stories ----------

export async function fetchFeed({ limit = 20, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('stories')
    .select(STORY_SELECT)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  return { data: mapStories(data), error }
}

export async function fetchStoryById(id) {
  const { data, error } = await supabase.from('stories').select(STORY_SELECT).eq('id', id).single()
  return { data: mapStory(data), error }
}

// Escapes characters that have special meaning in PostgREST's filter
// syntax (used by .or()/.ilike()) before they're interpolated into a
// filter string built from user input. Without this, a search containing
// a comma or parenthesis could alter the structure of the query.
function sanitizeFilterValue(value) {
  return value.replace(/[,()*]/g, '').slice(0, 200)
}

export async function searchStories(rawQuery) {
  const query = sanitizeFilterValue(rawQuery)
  const { data, error } = await supabase
    .from('stories')
    .select(STORY_SELECT)
    .or(
      `title.ilike.%${query}%,content.ilike.%${query}%,location.ilike.%${query}%,category.ilike.%${query}%,era.ilike.%${query}%`
    )
    .order('created_at', { ascending: false })
  return { data: mapStories(data), error }
}

export async function fetchStoriesByAuthor(userId) {
  const { data, error } = await supabase
    .from('stories')
    .select(STORY_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: mapStories(data), error }
}

export async function createStory(story) {
  return supabase.from('stories').insert(story).select().single()
}

export async function updateStory(id, patch) {
  return supabase.from('stories').update(patch).eq('id', id).select().single()
}

export async function deleteStory(id) {
  return supabase.from('stories').delete().eq('id', id)
}

// ---------- Storage (image uploads) ----------
// Your bucket policies check (storage.foldername(name))[1] = auth.uid(),
// so the first path segment MUST be the user's own id — kept that below.
//
// The extension is derived from a whitelist of accepted MIME types, never
// from `file.name` — that's attacker-controlled input and shouldn't be
// used to build a storage path.
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function safeImageExtension(file) {
  return ALLOWED_IMAGE_TYPES[file.type] || null
}

export async function uploadStoryImage(file, userId) {
  const ext = safeImageExtension(file)
  if (!ext) return { url: null, error: { message: 'Please upload a JPG, PNG, or WEBP image.' } }
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('story-images').upload(path, file)
  if (error) return { url: null, error }
  const { data } = supabase.storage.from('story-images').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}

// Uploads several photos for one story ("visual evidence"). Stops at the
// first failure and reports which files made it up so far.
export async function uploadStoryImages(files, userId) {
  const urls = []
  for (const file of files) {
    const { url, error } = await uploadStoryImage(file, userId)
    if (error) return { urls, error }
    urls.push(url)
  }
  return { urls, error: null }
}

export async function uploadAvatar(file, userId) {
  const ext = safeImageExtension(file)
  if (!ext) return { url: null, error: { message: 'Please upload a JPG, PNG, or WEBP image.' } }
  const path = `${userId}/avatar.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) return { url: null, error }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return { url: `${data.publicUrl}?t=${Date.now()}`, error: null }
}

// ---------- Likes ----------

export async function likeStory(storyId, userId) {
  return supabase.from('likes').insert({ story_id: storyId, user_id: userId })
}

export async function unlikeStory(storyId, userId) {
  return supabase.from('likes').delete().eq('story_id', storyId).eq('user_id', userId)
}

export async function hasLiked(storyId, userId) {
  if (!userId) return false
  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('story_id', storyId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

// ---------- Comments ----------

export async function fetchComments(storyId) {
  return supabase
    .from('comments')
    .select('*, profiles:user_id (username, full_name, avatar_url)')
    .eq('story_id', storyId)
    .order('created_at', { ascending: true })
}

export async function addComment(storyId, userId, content) {
  return supabase
    .from('comments')
    .insert({ story_id: storyId, user_id: userId, content })
    .select('*, profiles:user_id (username, full_name, avatar_url)')
    .single()
}

export async function deleteComment(commentId) {
  return supabase.from('comments').delete().eq('id', commentId)
}

// ---------- Follows ----------

export async function followUser(followerId, followingId) {
  return supabase.from('follows').insert({ follower_id: followerId, following_id: followingId })
}

export async function unfollowUser(followerId, followingId) {
  return supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId)
}

export async function isFollowing(followerId, followingId) {
  if (!followerId) return false
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle()
  return !!data
}

export async function fetchFollowCounts(userId) {
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ])
  return { followers: followers ?? 0, following: following ?? 0 }
}

// People who follow this user.
export async function fetchFollowers(userId) {
  const { data, error } = await supabase
    .from('follows')
    .select('created_at, profile:follower_id ( id, username, full_name, avatar_url )')
    .eq('following_id', userId)
    .order('created_at', { ascending: false })
  if (error) return { data: [], error }
  return { data: (data || []).map((r) => r.profile).filter(Boolean), error: null }
}

// People this user follows.
export async function fetchFollowingList(userId) {
  const { data, error } = await supabase
    .from('follows')
    .select('created_at, profile:following_id ( id, username, full_name, avatar_url )')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })
  if (error) return { data: [], error }
  return { data: (data || []).map((r) => r.profile).filter(Boolean), error: null }
}

// ---------- Shares ----------
// Fire-and-forget: records that a share happened. user_id is nullable in your
// schema, but the insert policy requires `authenticated`, so only log it
// when someone is logged in — anonymous visitors can still use the native
// share sheet / copy link, we just skip the DB row for them.
export async function recordShare(storyId, userId) {
  if (!userId) return { error: null }
  return supabase.from('shares').insert({ story_id: storyId, user_id: userId })
}

// ---------- Profiles ----------

export async function fetchProfileByUsername(username) {
  return supabase.from('profiles').select('*').eq('username', username).single()
}

export async function updateProfile(userId, patch) {
  return supabase.from('profiles').update(patch).eq('id', userId).select().single()
}

// Username changes are rate-limited (2 per 14 days), enforced by the
// change_username() database function — never update profiles.username
// directly, that column is locked down for regular writes.
export async function changeUsername(newUsername) {
  return supabase.rpc('change_username', { new_username: newUsername })
}

export async function fetchUsernameChangesRemaining(userId) {
  const { count, error } = await supabase
    .from('username_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('changed_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
  if (error) return { remaining: null, error }
  return { remaining: Math.max(0, 2 - (count ?? 0)), error: null }
}

// ---------- Liked stories ----------

export async function fetchLikedStories(userId) {
  const { data, error } = await supabase
    .from('likes')
    .select(`created_at, stories ( ${STORY_SELECT} )`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return { data: [], error }
  return { data: mapStories((data || []).map((row) => row.stories).filter(Boolean)), error: null }
}

// ---------- Categories (for search filters) ----------

export async function fetchCategories() {
  const { data, error } = await supabase.from('stories').select('category').not('category', 'is', null)
  if (error) return { data: [], error }
  const unique = [...new Set(data.map((r) => r.category).filter(Boolean))].sort()
  return { data: unique, error: null }
}

// ---------- Notifications ----------
// Built from existing tables (no notifications table in your schema) —
// pulls recent likes/comments on the current user's stories, plus new
// followers, and merges them into one feed sorted by recency.

export async function fetchNotifications(userId, { limit = 30 } = {}) {
  const { data: myStories } = await supabase.from('stories').select('id, title').eq('user_id', userId)
  const storyIds = (myStories || []).map((s) => s.id)
  const titleById = Object.fromEntries((myStories || []).map((s) => [s.id, s.title]))

  const [likesRes, commentsRes, followsRes] = await Promise.all([
    storyIds.length
      ? supabase
          .from('likes')
          .select('story_id, created_at, profiles:user_id ( username, full_name, avatar_url )')
          .in('story_id', storyIds)
          .neq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
      : Promise.resolve({ data: [] }),
    storyIds.length
      ? supabase
          .from('comments')
          .select('story_id, content, created_at, profiles:user_id ( username, full_name, avatar_url )')
          .in('story_id', storyIds)
          .neq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
      : Promise.resolve({ data: [] }),
    supabase
      .from('follows')
      .select('created_at, profiles:follower_id ( username, full_name, avatar_url )')
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
  ])

  const likeNotifs = (likesRes.data || []).map((l) => ({
    type: 'like',
    created_at: l.created_at,
    actor: l.profiles,
    story_id: l.story_id,
    story_title: titleById[l.story_id],
  }))
  const commentNotifs = (commentsRes.data || []).map((c) => ({
    type: 'comment',
    created_at: c.created_at,
    actor: c.profiles,
    story_id: c.story_id,
    story_title: titleById[c.story_id],
    preview: c.content?.slice(0, 80),
  }))
  const followNotifs = (followsRes.data || []).map((f) => ({
    type: 'follow',
    created_at: f.created_at,
    actor: f.profiles,
  }))

  return [...likeNotifs, ...commentNotifs, ...followNotifs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit)
}

// ---------- Contact ----------
// Requires the optional `messages` table — see supabase/additions.sql.
// If that table doesn't exist yet, this fails gracefully and Contact.jsx
// falls back to a mailto link.

export async function submitContactMessage({ name, email, message }) {
  return supabase.from('messages').insert({ name, email, message })
}
