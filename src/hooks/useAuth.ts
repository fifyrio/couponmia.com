'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabaseAuth, handleGoogleSignIn } from '@/lib/auth'

interface AuthState {
  user: User | null
  loading: boolean
  profile: UserProfile | null
}

interface UserProfile {
  id: string
  email: string
  name: string
  total_cashback_earned: number
  total_cashback_withdrawn: number
  total_cashback_pending: number
  referral_code: string
  is_verified: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    profile: null
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabaseAuth.auth.getSession()
      
      if (session?.user && session.user.email) {
        await handleGoogleSignIn({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata
        })
        await loadUserProfile(session.user)
      }
      
      setState(prev => ({
        ...prev,
        user: session?.user || null,
        loading: false
      }))
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user && session.user.email) {
          await handleGoogleSignIn({
            id: session.user.id,
            email: session.user.email,
            user_metadata: session.user.user_metadata
          })
          await loadUserProfile(session.user)
        }
        
        setState(prev => ({
          ...prev,
          user: session?.user || null,
          profile: session?.user ? prev.profile : null,
          loading: false
        }))
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabaseAuth
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code === 'PGRST116' && user.email) {
        // User profile doesn't exist, create it
        await handleGoogleSignIn({
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata
        })
        // Try loading again
        const { data: newProfile } = await supabaseAuth
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setState(prev => ({
          ...prev,
          profile: newProfile
        }))
      } else if (profile) {
        setState(prev => ({
          ...prev,
          profile
        }))
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabaseAuth.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('Error signing in with Google:', error)
        throw error
      }
    } catch (error) {
      console.error('Google sign in failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabaseAuth.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        throw error
      }
      
      setState({
        user: null,
        loading: false,
        profile: null
      })
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  const refreshProfile = async () => {
    if (state.user) {
      await loadUserProfile(state.user)
    }
  }

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    signInWithGoogle,
    signOut,
    refreshProfile,
    isAuthenticated: !!state.user
  }
}