import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiFileText, FiMail, FiLogOut, FiChevronRight } from 'react-icons/fi'
import MainLayout from '../components/MainLayout'
import { useAuth } from '../context/AuthContext'

function SettingsRow({ icon, label, to, onClick, danger }) {
  const className = `flex items-center justify-between px-5 py-4 hover:bg-surface-container transition-colors ${
    danger ? 'text-error' : 'text-on-surface'
  }`
  const inner = (
    <>
      <span className="flex items-center gap-3 text-sm font-medium">
        {icon}
        {label}
      </span>
      <FiChevronRight className="text-on-surface-variant" />
    </>
  )
  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    )
  }
  return (
    <button onClick={onClick} className={`w-full text-left ${className}`}>
      {inner}
    </button>
  )
}

export default function Settings() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-headline md:text-display-mobile font-bold mb-8">Settings</h1>

        <p className="label-caps text-on-surface-variant mb-3">Account</p>
        <div className="border-2 border-on-surface bg-warm-white divide-y divide-outline-variant mb-8">
          <SettingsRow icon={<FiUser size={18} />} label="Edit Profile" to="/profile/edit" />
          {profile?.username && (
            <SettingsRow icon={<FiUser size={18} />} label="View My Profile" to={`/profile/${profile.username}`} />
          )}
        </div>

        <p className="label-caps text-on-surface-variant mb-3">About</p>
        <div className="border-2 border-on-surface bg-warm-white divide-y divide-outline-variant mb-8">
          <SettingsRow icon={<FiFileText size={18} />} label="Terms &amp; Conditions" to="/terms" />
          <SettingsRow icon={<FiMail size={18} />} label="Contact Us" to="/contact" />
        </div>

        <div className="border-2 border-on-surface bg-warm-white">
          <SettingsRow icon={<FiLogOut size={18} />} label="Log Out" onClick={handleLogout} danger />
        </div>
      </div>
    </MainLayout>
  )
}
