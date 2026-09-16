import { useEffect, useState } from 'react'
import MainLayout from '../components/MainLayout'
import Loader from '../components/Loader'
import NotificationItem from '../components/NotificationItem'
import { useAuth } from '../context/AuthContext'
import { fetchNotifications } from '../lib/api'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    localStorage.setItem('kissa_notifications_last_seen', new Date().toISOString())
    fetchNotifications(user.id, { limit: 50 }).then((data) => {
      setNotifications(data)
      setLoading(false)
    })
  }, [user])

  return (
    <MainLayout>
      <h1 className="font-display text-headline md:text-display-mobile font-bold mb-8">Notifications</h1>

      {loading ? (
        <Loader />
      ) : notifications.length === 0 ? (
        <p className="text-on-surface-variant py-16 text-center">
          Nothing yet — likes, comments, and new followers will show up here.
        </p>
      ) : (
        <div className="border-2 border-on-surface bg-warm-white divide-y divide-outline-variant">
          {notifications.map((n, i) => (
            <NotificationItem key={i} notification={n} />
          ))}
        </div>
      )}
    </MainLayout>
  )
}
