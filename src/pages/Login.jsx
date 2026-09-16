import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import logoFull from '../assets/kissa-logo-full.png'
import mandalaBg from '../assets/mandala-bg.mp4'
import mandalaPoster from '../assets/mandala-bg-poster.jpg'

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const { error } = await signIn({ email, password })
    setBusy(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back')
      navigate(from, { replace: true })
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
          <h1 className="font-display text-headline font-bold mb-1">Welcome Back</h1>
          <p className="text-sm text-on-surface-variant mb-6">Log in to your archive account.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label-caps block mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scholar@example.com"
                className="input-field w-full px-3 py-3 text-sm"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-caps">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field w-full px-3 py-3 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="btn-primary label-caps px-6 py-3 paper-shadow-sm paper-interactive disabled:opacity-50 mt-2"
            >
              {busy ? 'Logging in...' : 'Log In'}
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
          New to the archive?{' '}
          <Link to="/signup" className="text-primary font-bold underline">
            Join the Archive
          </Link>
        </p>
      </div>
    </div>
  )
}
