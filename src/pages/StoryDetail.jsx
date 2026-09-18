import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import MainLayout from '../components/MainLayout'
import Loader from '../components/Loader'
import LikeButton from '../components/LikeButton'
import ShareButton from '../components/ShareButton'
import CommentSection from '../components/CommentSection'
import { useAuth } from '../context/AuthContext'
import { fetchStoryById, deleteStory, isFollowing, followUser, unfollowUser } from '../lib/api'
import Avatar from '../components/Avatar'
import { timeAgo, fullDate } from '../lib/dateUtils'

export default function StoryDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followBusy, setFollowBusy] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchStoryById(id).then(async ({ data, error }) => {
      if (!active) return
      if (error || !data) {
        toast.error('Story not found')
        setLoading(false)
        return
      }
      setStory(data)
      if (user && user.id !== data.user_id) {
        const f = await isFollowing(user.id, data.user_id)
        if (active) setFollowing(f)
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [id, user])

  const handleDelete = async () => {
    if (!confirm('Delete this story permanently?')) return
    const { error } = await deleteStory(story.id)
    if (error) {
      toast.error('Could not delete story')
    } else {
      toast.success('Story deleted')
      navigate('/')
    }
  }

  const toggleFollow = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setFollowBusy(true)
    const nextFollowing = !following
    setFollowing(nextFollowing)
    const { error } = nextFollowing
      ? await followUser(user.id, story.user_id)
      : await unfollowUser(user.id, story.user_id)
    if (error) {
      setFollowing(!nextFollowing)
      toast.error('Could not update follow status')
    }
    setFollowBusy(false)
  }

  if (loading) {
    return (
      <MainLayout>
        <Loader />
      </MainLayout>
    )
  }

  if (!story) {
    return (
      <MainLayout>
        <p className="text-center py-16 text-on-surface-variant">This record could not be found.</p>
      </MainLayout>
    )
  }

  const isOwner = user?.id === story.user_id

  return (
    <MainLayout>
      <article className="max-w-3xl mx-auto">
        {(story.category || story.era) && (
          <span className="text-meta uppercase tracking-widest text-primary-container font-bold block mb-3">
            {[story.category, story.era].filter(Boolean).join(' // ')}
          </span>
        )}
        <h1 className="font-display text-display-mobile md:text-display-lg font-bold leading-tight mb-6">
          {story.title}
        </h1>

        <div className="flex items-center justify-between flex-wrap gap-4 border-y-2 border-on-surface py-4 mb-8">
          <Link to={`/profile/${story.username}`} className="flex items-center gap-3">
            <Avatar src={story.avatar_url} size="md" />
            <div>
              <p className="text-sm font-bold">Written by {story.full_name || story.username}</p>
              <p className="text-xs text-on-surface-variant" title={fullDate(story.created_at)}>
                {timeAgo(story.created_at)}
                {story.location ? ` · ${story.location}` : ''}
              </p>
            </div>
          </Link>

          {!isOwner && (
            <button
              onClick={toggleFollow}
              disabled={followBusy}
              className={`label-caps px-4 py-2 paper-shadow-sm paper-interactive ${
                following ? 'btn-secondary' : 'btn-primary'
              }`}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          )}

          {isOwner && (
            <div className="flex gap-3">
              <Link to={`/edit-story/${story.id}`} className="label-caps text-primary underline">
                Edit
              </Link>
              <button onClick={handleDelete} className="label-caps text-error underline">
                Delete
              </button>
            </div>
          )}
        </div>

        {story.image_urls?.length > 0 ? (
          <div className="mb-8">
            <div className="border-2 border-on-surface paper-shadow overflow-hidden">
              <img src={story.image_urls[0]} alt={story.title} className="w-full h-auto object-cover" />
            </div>
            {story.image_urls.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
                {story.image_urls.slice(1).map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="block h-20 border-2 border-on-surface overflow-hidden hover-lift"
                  >
                    <img src={url} alt={`${story.title} ${i + 2}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          story.image_url && (
            <div className="border-2 border-on-surface paper-shadow mb-8 overflow-hidden">
              <img src={story.image_url} alt={story.title} className="w-full h-auto object-cover" />
            </div>
          )
        )}

        <div className="max-w-none whitespace-pre-wrap text-on-surface leading-relaxed text-lg mb-8">
          {story.content}
        </div>

        <div className="flex items-center gap-6 border-t-2 border-on-surface pt-6">
          <LikeButton storyId={story.id} initialCount={story.like_count} />
          <ShareButton title={story.title} storyId={story.id} />
        </div>

        <CommentSection storyId={story.id} />
      </article>
    </MainLayout>
  )
}
