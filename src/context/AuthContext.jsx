import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) {
      console.error('Failed to load profile:', error.message)
      setProfile(null)
    } else {
      setProfile(data)
    }
  }, [])

  useEffect(() => {
    // 1. Get whatever session already exists (page refresh, etc.)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      fetchProfile(session?.user?.id).finally(() => setLoading(false))
    })

    // 2. Subscribe to future auth changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      fetchProfile(session?.user?.id)
    })

    return () => listener.subscription.unsubscribe()
  }, [fetchProfile])

  const signUp = async ({ email, password, fullName, username }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, username } },
    })
    return { data, error }
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPasswordForEmail = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  }

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    return { data, error }
  }

  const refreshProfile = (freshData) => {
    // If the caller already has the up-to-date row (e.g. straight from an
    // update's response), use it directly instead of re-querying — avoids
    // any race between the write landing and a refetch reading stale data.
    if (freshData) {
      setProfile(freshData)
      return Promise.resolve()
    }
    return fetchProfile(session?.user?.id)
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
