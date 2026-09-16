import { FiShare2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { recordShare } from '../lib/api'

export default function ShareButton({ title, url, storyId }) {
  const { user } = useAuth()

  const handleShare = async () => {
    const shareUrl = url || window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl })
      } catch {
        // user cancelled — don't log a share that didn't happen
        return
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard')
    }
    if (storyId) recordShare(storyId, user?.id)
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 label-caps text-on-surface-variant hover:text-primary transition-colors"
    >
      <FiShare2 size={18} />
      Share
    </button>
  )
}
