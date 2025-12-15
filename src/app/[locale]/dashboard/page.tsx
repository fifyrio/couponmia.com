'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import CashbackDashboard from '@/components/cashback/CashbackDashboard'

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?returnUrl=/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      {/* Header */}
      <header className="bg-card-bg/50 backdrop-blur-sm border-b border-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-brand-medium hover:text-brand-light transition-colors"
              >
                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-semibold">CouponMia</span>
              </Link>
              <h1 className="text-2xl font-bold text-text-primary">
                Welcome back, {profile.name}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-text-secondary">
                Referral Code: <span className="font-mono font-semibold text-brand-accent">{profile.referral_code}</span>
              </div>
              <button
                onClick={signOut}
                className="text-text-muted hover:text-text-secondary text-sm transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Invite Friends */}
          <div className="mb-8 bg-card-bg/50 backdrop-blur-sm border border-card-border rounded-xl shadow-lg">
            <div className="px-6 py-4">
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    const referralUrl = `${window.location.origin}?ref=${profile.referral_code}`
                    navigator.clipboard.writeText(referralUrl)
                    // Show toast notification
                    const toast = document.createElement('div')
                    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
                    toast.textContent = 'Referral link copied to clipboard!'
                    document.body.appendChild(toast)
                    setTimeout(() => document.body.removeChild(toast), 3000)
                  }}
                  className="flex items-center p-4 border border-card-border rounded-lg hover:bg-brand-lightest/30 transition-colors w-full max-w-md justify-center"
                >
                  <svg className="w-6 h-6 text-brand-medium mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <div>
                    <p className="font-medium text-text-primary">Invite Friends</p>
                    <p className="text-sm text-text-secondary">Earn rewards by sharing your referral link</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card-bg/50 backdrop-blur-sm border border-card-border rounded-xl shadow-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-text-secondary truncate">
                          Total Cashback Earned
                        </dt>
                        <dd className="text-2xl font-bold text-text-primary">
                          ${profile.total_cashback_earned.toFixed(2)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card-bg/50 backdrop-blur-sm border border-card-border rounded-xl shadow-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-text-secondary truncate">
                          Available Balance
                        </dt>
                        <dd className="text-2xl font-bold text-text-primary">
                          ${(profile.total_cashback_earned - profile.total_cashback_withdrawn - profile.total_cashback_pending).toFixed(2)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card-bg/50 backdrop-blur-sm border border-card-border rounded-xl shadow-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-brand-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-text-secondary truncate">
                          Referral Code
                        </dt>
                        <dd className="text-2xl font-bold text-brand-accent font-mono">
                          {profile.referral_code}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cashback Dashboard */}
          <CashbackDashboard userId={user.id} />
        </div>
      </main>
    </div>
  )
}