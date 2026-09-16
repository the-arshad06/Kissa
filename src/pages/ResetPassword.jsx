import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import logoFull from '../assets/kissa-logo-full.png'
import mandalaBg from '../assets/mandala-bg.mp4'
import mandalaPoster from '../assets/mandala-bg-poster.jpg'

export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  // Supabase's client reads the recovery token out of the URL itself and
  // fires this event once the temporary "recovery" session is ready. Until
  // then, updateUser() below has nothing to act on.
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // If the recovery session was already established before this component
    // mounted (e.g. a fast redirect), there won't be another event to catch.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setBusy(true)
    const { error } = await updatePassword(password)
    setBusy(false)
    if (error) {
      toast.error(error.message)
    } else {
      setDone(true)
      toast.success('Password updated')
    }
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
          {done ? (
            <>
              <h1 className="font-display text-headline font-bold mb-1">Password Updated</h1>
              <p className="text-sm text-on-surface-variant mb-6">You can now log in with your new password.</p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary label-caps px-6 py-3 paper-shadow-sm paper-interactive"
              >
                Go to Log In
              </button>
            </>
          ) : !ready ? (
            <>
              <h1 className="font-display text-headline font-bold mb-1">Verifying Link</h1>
              <p className="text-sm text-on-surface-variant">
                Give it a moment — if this doesn't resolve, the link may have expired.{' '}
                <Link to="/forgot-password" className="text-primary underline">
                  Request a new one
                </Link>
                .
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-headline font-bold mb-1">Choose a New Password</h1>
              <p className="text-sm text-on-surface-variant mb-6">Make it at least 8 characters.</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="label-caps block mb-2">New Password</label>
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
                <div>
                  <label className="label-caps block mb-2">Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="input-field w-full px-3 py-3 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary label-caps px-6 py-3 paper-shadow-sm paper-interactive disabled:opacity-50 mt-2"
                >
                  {busy ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
