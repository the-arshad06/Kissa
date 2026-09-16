import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { fetchComments, addComment, deleteComment } from '../lib/api'
import Loader from './Loader'
import Avatar from './Avatar'

export default function CommentSection({ storyId }) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchComments(storyId).then(({ data, error }) => {
      if (!active) return
      if (error) toast.error('Could not load comments')
      setComments(data || [])
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [storyId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    const content = text.trim()
    if (!content) return
    setPosting(true)
    const { data, error } = await addComment(storyId, user.id, content)
    if (error) {
      toast.error('Could not post comment')
    } else {
      setComments((c) => [...c, data])
      setText('')
    }
    setPosting(false)
  }

  const handleDelete = async (id) => {
    const { error } = await deleteComment(id)
    if (error) {
      toast.error('Could not delete comment')
    } else {
      setComments((c) => c.filter((x) => x.id !== id))
    }
  }

  return (
    <section className="mt-12 border-t-2 border-on-surface pt-8">
      <h3 className="font-display text-headline font-bold mb-6">
        Comments ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share a thought, memory, or correction..."
            rows={3}
            className="input-field p-3 text-sm w-full"
          />
          <button
            type="submit"
            disabled={posting || !text.trim()}
            className="btn-primary label-caps px-5 py-2 self-start paper-shadow-sm paper-interactive"
          >
            {posting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-on-surface-variant mb-8">
          <Link to="/login" className="text-primary underline">
            Log in
          </Link>{' '}
          to join the conversation.
        </p>
      )}

      {loading ? (
        <Loader label="Loading comments..." />
      ) : comments.length === 0 ? (
        <p className="text-sm text-on-surface-variant">No comments yet. Be the first to respond.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar src={c.profiles?.avatar_url} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{c.profiles?.full_name || c.profiles?.username}</span>
                  <span className="text-xs text-on-surface-variant">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{c.content}</p>
                {user?.id === c.user_id && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-xs text-error mt-1 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
