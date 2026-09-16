import { useState } from 'react'
import toast from 'react-hot-toast'
import MainLayout from '../components/MainLayout'
import { useAuth } from '../context/AuthContext'
import { submitContactMessage } from '../lib/api'

const CONTACT_EMAIL = 'hello@kissa-archive.app'

export default function Contact() {
  const { profile, user } = useAuth()
  const [name, setName] = useState(profile?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in every field')
      return
    }
    setBusy(true)
    const { error } = await submitContactMessage({ name: name.trim(), email: email.trim(), message: message.trim() })
    setBusy(false)

    if (error) {
      // Table not set up yet (see supabase/additions.sql) — fall back to the user's email client.
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=KISSA Contact Form&body=${body}`
      toast('Opening your email app instead — message wasn\'t saved to the server.')
      return
    }
    setSent(true)
    setMessage('')
  }

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-headline md:text-display-mobile font-bold mb-2">Contact Us</h1>
        <p className="text-on-surface-variant mb-8">
          Questions, feedback, or a story you need help publishing? Send us a note.
        </p>

        {sent ? (
          <div className="bg-warm-white border-2 border-on-surface paper-shadow p-8 text-center">
            <h2 className="font-display text-lg font-bold mb-2">Message sent</h2>
            <p className="text-sm text-on-surface-variant">Thanks for reaching out — we'll get back to you soon.</p>
            <button onClick={() => setSent(false)} className="btn-secondary label-caps px-5 py-2 mt-6 paper-shadow-sm paper-interactive">
              Send Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-warm-white border-2 border-on-surface paper-shadow p-8 flex flex-col gap-4">
            <div>
              <label className="label-caps block mb-2">Your Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                className="input-field w-full px-3 py-3 text-sm"
              />
            </div>
            <div>
              <label className="label-caps block mb-2">Message</label>
              <textarea
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                className="input-field w-full px-3 py-3 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="btn-primary label-caps px-6 py-3 paper-shadow-sm paper-interactive disabled:opacity-50 self-start"
            >
              {busy ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}

        <p className="text-sm text-on-surface-variant mt-6 text-center">
          You can also reach us directly at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </MainLayout>
  )
}
