import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import logoFull from '../assets/kissa-logo-full.png'
import mandalaBg from '../assets/mandala-bg.mp4'
import mandalaPoster from '../assets/mandala-bg-poster.jpg'

export default function ForgotPassword() {
  const { resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const { error } = await resetPasswordForEmail(email.trim())
    setBusy(false)
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
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
          {sent ? (
            <>
              <h1 className="font-display text-headline font-bold mb-1">Check Your Email</h1>
              <p className="text-sm text-on-surface-variant mb-6">
                If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
              </p>
              <Link to="/login" className="btn-secondary label-caps px-6 py-3 paper-shadow-sm paper-interactive inline-block">
                Back to Log In
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-display text-headline font-bold mb-1">Reset Your Password</h1>
              <p className="text-sm text-on-surface-variant mb-6">
                Enter your email and we'll send you a link to get back into your account.
              </p>

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
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary label-caps px-6 py-3 paper-shadow-sm paper-interactive disabled:opacity-50 mt-2"
                >
                  {busy ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Remembered it?{' '}
          <Link to="/login" className="text-primary font-bold underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}
