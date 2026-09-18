import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import logoFull from '../assets/kissa-logo-full.png'
import mandalaBg from '../assets/mandala-bg.mp4'
import mandalaPoster from '../assets/mandala-bg-poster.jpg'

export default function Signup() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setBusy(true)
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
    const { error } = await signUp({ email, password, fullName, username: cleanUsername })
    setBusy(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Check your email to confirm, then log in.')
      navigate('/login')
    }
  }

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle()
    if (error) toast.error(error.message)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={mandalaBg}
        poster={mandalaPoster}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-parchment/85" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block" aria-label="KISSA home">
            <img src={logoFull} alt="KISSA — A Tale of Untold Stories" className="h-20 w-auto mx-auto object-contain" />
          </Link>
          <p className="label-caps text-on-surface-variant mt-2">Preserving Stories</p>
        </div>

        <div className="bg-warm-white border-2 border-on-surface paper-shadow p-8">
          <h1 className="font-display text-headline font-bold mb-1">Join the Archive</h1>
          <p className="text-sm text-on-surface-variant mb-6">Create your account to start contributing.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label-caps block mb-2">Full Name</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="input-field w-full px-3 py-3 text-sm"
              />
            </div>
            <div>
              <label className="label-caps block mb-2">Username</label>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="input-field w-full px-3 py-3 text-sm"
              />
            </div>
            <div>
              <label className="label-caps block mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-field w-full px-3 py-3 text-sm"
              />
            </div>
            <div>
              <label className="label-caps block mb-2">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="input-field w-full px-3 py-3 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="btn-primary label-caps px-6 py-3 paper-shadow-sm paper-interactive disabled:opacity-50 mt-2"
            >
              {busy ? 'Creating account...' : 'Create'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-xs text-on-surface-variant">OR</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          <button
            onClick={handleGoogle}
            className="btn-secondary label-caps w-full px-6 py-3 paper-shadow-sm paper-interactive"
          >
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}
