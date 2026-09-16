import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiCompass, FiBell, FiUser, FiMenu } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import HamburgerMenu from './HamburgerMenu'
import Avatar from './Avatar'
import logoFull from '../assets/kissa-logo-full.png'

export default function Navbar() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-surface flex items-center px-4 md:px-10 h-20 border-b-2 border-on-surface shadow-[0_3px_0_0_rgba(27,28,25,0.06)] gap-4 md:gap-6">
        <button
          onClick={() => setMenuOpen(true)}
          className="w-11 h-11 border-2 border-on-surface bg-warm-white flex items-center justify-center paper-interactive shrink-0"
          aria-label="Open menu"
        >
          <FiMenu size={20} />
        </button>

        <Link to="/" className="flex items-center h-full py-3 shrink-0 group" aria-label="KISSA home">
          <img
            src={logoFull}
            alt="KISSA — A Tale of Untold Stories"
            className="h-full w-auto max-w-[180px] sm:max-w-none object-contain transition-transform group-hover:-translate-y-0.5"
          />
        </Link>

        <div className="flex items-center gap-3 ml-auto">
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center h-11 border-2 border-on-surface bg-warm-white px-3 focus-within:shadow-[2px_2px_0_0_#8a4b32] transition-shadow"
          >
            <FiSearch className="text-on-surface-variant" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-40 px-2 placeholder:text-on-surface placeholder:opacity-50"
              placeholder="Search archive..."
              type="text"
            />
          </form>

          {user && <NotificationBell />}

          {user ? (
            <Link
              to={`/profile/${profile?.username}`}
              className="paper-interactive shrink-0"
              aria-label="My profile"
            >
              <Avatar src={profile?.avatar_url} size="md" />
            </Link>
          ) : (
            <Link to="/login" className="btn-primary label-caps px-4 py-2.5 paper-shadow-sm paper-interactive">
              Log In
            </Link>
          )}
        </div>
      </header>

      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex md:hidden justify-around items-center py-2 bg-surface px-4 border-t-2 border-on-surface shadow-[0_-3px_0_0_rgba(27,28,25,0.06)]">
        <Link to="/search" className="flex flex-col items-center gap-1 p-2 text-on-surface-variant hover:text-primary transition-colors">
          <FiCompass size={20} />
          <span className="text-[10px] label-caps">Explore</span>
        </Link>
        <Link
          to={user ? '/notifications' : '/login'}
          className="flex flex-col items-center gap-1 p-2 text-on-surface-variant hover:text-primary transition-colors"
        >
          <FiBell size={20} />
          <span className="text-[10px] label-caps">Alerts</span>
        </Link>
        <Link
          to={user ? `/profile/${profile?.username}` : '/login'}
          className="flex flex-col items-center gap-1 p-2 text-on-surface-variant hover:text-primary transition-colors"
        >
          <FiUser size={20} />
          <span className="text-[10px] label-caps">Profile</span>
        </Link>
      </nav>
    </>
  )
}
