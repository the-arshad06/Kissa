import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2 } from 'react-icons/fi'
import MainLayout from '../components/MainLayout'
import StoryCard from '../components/StoryCard'
import Loader from '../components/Loader'
import Avatar from '../components/Avatar'
import FollowListModal from '../components/FollowListModal'
import { useAuth } from '../context/AuthContext'
import {
  fetchProfileByUsername,
  fetchStoriesByAuthor,
  fetchLikedStories,
  fetchFollowCounts,
  isFollowing,
  followUser,
  unfollowUser,
} from '../lib/api'

export default function Profile() {
  const { username } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [stories, setStories] = useState([])
  const [likedStories, setLikedStories] = useState([])
  const [tab, setTab] = useState('stories')
  const [counts, setCounts] = useState({ followers: 0, following: 0 })
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [followModalTab, setFollowModalTab] = useState(null) // 'followers' | 'following' | null

  const isOwnProfile = user?.id === profile?.id

  useEffect(() => {
    let active = true
    setLoading(true)
    setTab('stories')
    fetchProfileByUsername(username).then(async ({ data: p, error }) => {
      if (!active) return
      if (error || !p) {
        toast.error('Profile not found')
        setLoading(false)
        return
      }
      setProfile(p)

      const tasks = [
        fetchStoriesByAuthor(p.id),
        fetchFollowCounts(p.id),
        user && user.id !== p.id ? isFollowing(user.id, p.id) : Promise.resolve(false),
      ]
      const [{ data: s }, c, f] = await Promise.all(tasks)
      if (!active) return
      setStories(s || [])
      setCounts(c)
      setFollowing(f)

      if (user && user.id === p.id) {
        const { data: liked } = await fetchLikedStories(p.id)
        if (active) setLikedStories(liked || [])
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [username, user])

  const toggleFollow = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    const next = !following
    setFollowing(next)
    setCounts((c) => ({ ...c, followers: c.followers + (next ? 1 : -1) }))
    const { error } = next ? await followUser(user.id, profile.id) : await unfollowUser(user.id, profile.id)
    if (error) {
      toast.error('Could not update follow status')
      setFollowing(!next)
      setCounts((c) => ({ ...c, followers: c.followers + (next ? -1 : 1) }))
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <Loader />
      </MainLayout>
    )
  }

  if (!profile) {
    return (
      <MainLayout>
        <p className="text-center py-16 text-on-surface-variant">This profile could not be found.</p>
      </MainLayout>
    )
  }

  const visibleStories = tab === 'stories' ? stories : likedStories

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 border-b-2 border-on-surface pb-8 mb-8 animate-fade-in-up">
        <div className="shrink-0">
          <Avatar src={profile.avatar_url} size="xl" className="shadow-[3px_3px_0_0_#1b1c19]" />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-headline font-bold">{profile.full_name || profile.username}</h1>
          <p className="text-on-surface-variant text-sm mb-2">@{profile.username}</p>
          {profile.bio && <p className="text-sm max-w-xl mb-3 leading-relaxed">{profile.bio}</p>}
          <div className="flex gap-6 text-sm">
            <span>
              <strong>{stories.length}</strong> Stories
            </span>
            <button
              onClick={() => setFollowModalTab('followers')}
              className="hover:text-primary transition-colors"
            >
              <strong>{counts.followers}</strong> Followers
            </button>
            <button
              onClick={() => setFollowModalTab('following')}
              className="hover:text-primary transition-colors"
            >
              <strong>{counts.following}</strong> Following
            </button>
          </div>
        </div>

        {isOwnProfile ? (
          <div className="flex gap-3">
            <Link to="/create" className="btn-primary label-caps px-4 py-2 paper-shadow-sm paper-interactive flex items-center gap-2">
              <FiPlus size={16} /> New Story
            </Link>
            <Link to="/profile/edit" className="btn-secondary label-caps px-4 py-2 paper-shadow-sm paper-interactive flex items-center gap-2">
              <FiEdit2 size={16} /> Edit Profile
            </Link>
          </div>
        ) : (
          <button
            onClick={toggleFollow}
            className={`label-caps px-5 py-2 paper-shadow-sm paper-interactive ${
              following ? 'btn-secondary' : 'btn-primary'
            }`}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {isOwnProfile && (
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab('stories')}
            className={`label-caps px-4 py-2 border-2 border-on-surface transition-colors ${
              tab === 'stories' ? 'bg-terracotta text-on-primary' : 'bg-warm-white text-on-surface hover:bg-surface-container'
            }`}
          >
            My Stories
          </button>
          <button
            onClick={() => setTab('liked')}
            className={`label-caps px-4 py-2 border-2 border-on-surface transition-colors ${
              tab === 'liked' ? 'bg-terracotta text-on-primary' : 'bg-warm-white text-on-surface hover:bg-surface-container'
            }`}
          >
            Liked Stories
          </button>
        </div>
      )}

      {!isOwnProfile && (
        <h2 className="font-display text-headline font-bold mb-6 uppercase tracking-widest text-primary-container">
          Stories
        </h2>
      )}

      {visibleStories.length === 0 ? (
        <p className="text-on-surface-variant py-8">
          {tab === 'liked' ? "You haven't liked any stories yet." : 'No published stories yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {visibleStories.map((s, i) => (
            <div key={s.id} className="animate-fade-in-up" style={{ animationDelay: `${(i % 9) * 60}ms` }}>
              <StoryCard story={s} />
            </div>
          ))}
        </div>
      )}

      {followModalTab && (
        <FollowListModal
          userId={profile.id}
          initialTab={followModalTab}
          onClose={() => setFollowModalTab(null)}
        />
      )}
    </MainLayout>
  )
}
