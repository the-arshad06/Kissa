import { Link } from 'react-router-dom'
import { FiHeart, FiMessageCircle, FiUserPlus } from 'react-icons/fi'
import { timeAgo } from '../lib/dateUtils'

const ICONS = {
  like: <FiHeart size={16} className="text-primary" />,
  comment: <FiMessageCircle size={16} className="text-primary" />,
  follow: <FiUserPlus size={16} className="text-primary" />,
}

function messageFor(n) {
  const who = n.actor?.full_name || n.actor?.username || 'Someone'
  if (n.type === 'like') return `${who} liked "${n.story_title || 'your story'}"`
  if (n.type === 'comment') return `${who} commented: "${n.preview}"`
  if (n.type === 'follow') return `${who} started following you`
  return ''
}

export default function NotificationItem({ notification }) {
  const content = (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-surface-container transition-colors">
      <div className="w-9 h-9 rounded-full border-2 border-on-surface bg-secondary-container overflow-hidden shrink-0 flex items-center justify-center">
        {notification.actor?.avatar_url ? (
          <img src={notification.actor.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          ICONS[notification.type]
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{messageFor(notification)}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{timeAgo(notification.created_at)}</p>
      </div>
      <div className="shrink-0 mt-1">{ICONS[notification.type]}</div>
    </div>
  )

  if (notification.type === 'follow') {
    return notification.actor?.username ? (
      <Link to={`/profile/${notification.actor.username}`}>{content}</Link>
    ) : (
      content
    )
  }

  return notification.story_id ? <Link to={`/story/${notification.story_id}`}>{content}</Link> : content
}
