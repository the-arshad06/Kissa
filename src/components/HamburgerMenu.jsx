import { Link, useNavigate } from 'react-router-dom'
import { FiX, FiUser, FiCompass, FiSettings, FiFileText, FiMail, FiLogOut, FiLogIn } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

function MenuLink({ to, icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-6 py-4 text-sm font-medium hover:bg-surface-container transition-colors border-b border-outline-variant"
    >
      {icon}
      {label}
    </Link>
  )
}

export default function HamburgerMenu({ open, onClose }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    onClose()
    navigate('/')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-inverse-surface/60 animate-fade-in"
        onClick={onClose}
      />
      <div className="absolute left-0 top-0 h-full w-full max-w-xs bg-warm-white border-r-2 border-on-surface flex flex-col animate-slide-in-left">
        <div className="flex items-center justify-between px-6 h-20 border-b-2 border-on-surface shrink-0">
          {user ? (
            <div className="flex items-center gap-3 min-w-0">
              <Avatar src={profile?.avatar_url} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{profile?.full_name || profile?.username}</p>
                <p className="text-xs text-on-surface-variant truncate">@{profile?.username}</p>
              </div>
            </div>
          ) : (
            <span className="font-display text-lg text-primary font-bold">KISSA</span>
          )}
          <button onClick={onClose} className="p-1 hover:text-primary shrink-0" aria-label="Close menu">
            <FiX size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {user && (
            <MenuLink
              to={`/profile/${profile?.username}`}
              icon={<FiUser size={18} />}
              label="My Profile"
              onClick={onClose}
            />
          )}
          <MenuLink to="/search" icon={<FiCompass size={18} />} label="Explore" onClick={onClose} />
          {user && <MenuLink to="/settings" icon={<FiSettings size={18} />} label="Settings" onClick={onClose} />}
          <MenuLink to="/terms" icon={<FiFileText size={18} />} label="Terms &amp; Conditions" onClick={onClose} />
          <MenuLink to="/contact" icon={<FiMail size={18} />} label="Contact Us" onClick={onClose} />
        </nav>

        <div className="border-t-2 border-on-surface shrink-0">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium text-error hover:bg-surface-container transition-colors"
            >
              <FiLogOut size={18} /> Log Out
            </button>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-primary hover:bg-surface-container transition-colors"
            >
              <FiLogIn size={18} /> Log In
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
