import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiBell } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { fetchNotifications } from '../lib/api'
import NotificationItem from './NotificationItem'

const SEEN_KEY = 'kissa_notifications_last_seen'

export default function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const data = await fetchNotifications(user.id, { limit: 10 })
    setNotifications(data)
    const lastSeen = localStorage.getItem(SEEN_KEY)
    const unread = lastSeen ? data.filter((n) => new Date(n.created_at) > new Date(lastSeen)) : data
    setUnreadCount(unread.length)
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000) // refresh every minute
    return () => clearInterval(interval)
  }, [load])

  const handleOpen = () => {
    const next = !open
    setOpen(next)
    if (next) {
      localStorage.setItem(SEEN_KEY, new Date().toISOString())
      setUnreadCount(0)
    }
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 border-2 border-on-surface bg-warm-white flex items-center justify-center paper-interactive shrink-0"
        aria-label="Notifications"
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-on-surface">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-warm-white border-2 border-on-surface paper-shadow-sm z-50">
          <div className="px-4 py-3 border-b-2 border-on-surface">
            <h3 className="label-caps">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-outline-variant">
            {loading ? (
              <p className="px-4 py-6 text-sm text-on-surface-variant text-center">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-on-surface-variant text-center">
                Nothing yet — activity on your stories will show up here.
              </p>
            ) : (
              notifications.map((n, i) => <NotificationItem key={i} notification={n} />)
            )}
          </div>
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center label-caps px-4 py-3 border-t-2 border-on-surface text-primary hover:bg-surface-container"
          >
            View All
          </Link>
        </div>
      )}
    </div>
  )
}
