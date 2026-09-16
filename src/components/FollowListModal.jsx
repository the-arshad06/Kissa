import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { fetchFollowers, fetchFollowingList, followUser, unfollowUser, isFollowing } from '../lib/api'
import Avatar from './Avatar'

function UserRow({ person, onClose }) {
  const { user } = useAuth()
  const [following, setFollowing] = useState(false)
  const [checked, setChecked] = useState(false)
  const [busy, setBusy] = useState(false)
  const isMe = user?.id === person.id

  useEffect(() => {
    let active = true
    if (user && !isMe) {
      isFollowing(user.id, person.id).then((v) => {
        if (active) {
          setFollowing(v)
          setChecked(true)
        }
      })
    } else {
      setChecked(true)
    }
    return () => {
      active = false
    }
  }, [user, person.id, isMe])

  const toggle = async () => {
    if (!user || busy) return
    setBusy(true)
    const next = !following
    setFollowing(next)
    const { error } = next ? await followUser(user.id, person.id) : await unfollowUser(user.id, person.id)
    if (error) {
      setFollowing(!next)
      toast.error('Could not update follow status')
    }
    setBusy(false)
  }

  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-surface-container transition-colors">
      <Link to={`/profile/${person.username}`} onClick={onClose} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar src={person.avatar_url} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">{person.full_name || person.username}</p>
          <p className="text-xs text-on-surface-variant truncate">@{person.username}</p>
        </div>
      </Link>
      {user && !isMe && checked && (
        <button
          onClick={toggle}
          disabled={busy}
          className={`label-caps px-3 py-1.5 shrink-0 paper-shadow-sm paper-interactive disabled:opacity-50 ${
            following ? 'btn-secondary' : 'btn-primary'
          }`}
        >
          {following ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  )
}

export default function FollowListModal({ userId, initialTab = 'followers', onClose }) {
  const [tab, setTab] = useState(initialTab)
  const [followers, setFollowers] = useState(null)
  const [followingList, setFollowingList] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([fetchFollowers(userId), fetchFollowingList(userId)]).then(([f1, f2]) => {
      if (!active) return
      setFollowers(f1.data)
      setFollowingList(f2.data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [userId])

  const list = tab === 'followers' ? followers : followingList

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-inverse-surface/60 animate-fade-in" onClick={onClose} />
      <div className="relative bg-warm-white border-2 border-on-surface paper-shadow-lg w-full max-w-sm max-h-[80vh] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-5 h-16 border-b-2 border-on-surface shrink-0">
          <div className="flex gap-6">
            <button
              onClick={() => setTab('followers')}
              className={`label-caps pb-1 border-b-2 -mb-px transition-colors ${
                tab === 'followers' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
              }`}
            >
              Followers
            </button>
            <button
              onClick={() => setTab('following')}
              className={`label-caps pb-1 border-b-2 -mb-px transition-colors ${
                tab === 'following' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
              }`}
            >
              Following
            </button>
          </div>
          <button onClick={onClose} className="p-1 hover:text-primary" aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-outline-variant">
          {loading ? (
            <p className="px-5 py-8 text-sm text-on-surface-variant text-center">Loading...</p>
          ) : list.length === 0 ? (
            <p className="px-5 py-8 text-sm text-on-surface-variant text-center">
              {tab === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
            </p>
          ) : (
            list.map((person) => <UserRow key={person.id} person={person} onClose={onClose} />)
          )}
        </div>
      </div>
    </div>
  )
}
