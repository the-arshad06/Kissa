import { useEffect, useState } from 'react'
import { FiHeart } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { hasLiked, likeStory, unlikeStory } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function LikeButton({ storyId, initialCount = 0 }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    if (user) {
      hasLiked(storyId, user.id).then((v) => active && setLiked(v))
    }
    return () => {
      active = false
    }
  }, [storyId, user])

  const toggle = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (busy) return
    setBusy(true)

    // optimistic update
    const nextLiked = !liked
    setLiked(nextLiked)
    setCount((c) => c + (nextLiked ? 1 : -1))

    const { error } = nextLiked ? await likeStory(storyId, user.id) : await unlikeStory(storyId, user.id)

    if (error) {
      // revert on failure
      setLiked(!nextLiked)
      setCount((c) => c + (nextLiked ? -1 : 1))
      toast.error('Could not update like. Try again.')
    }
    setBusy(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="flex items-center gap-2 label-caps text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
    >
      <FiHeart className={liked ? 'fill-primary text-primary' : ''} size={18} />
      {count}
    </button>
  )
}
