'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function UserBenefits() {
  const { user, profile, signInWithGoogle } = useAuth()

  if (user && profile) {
    // Show personalized benefits for logged in users
    const availableBalance = profile.total_cashback_earned - profile.total_cashback_withdrawn - profile.total_cashback_pending

    return (
      <div className="w-full max-w-6xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {profile.name}! 👋
            </h2>
            <p className="text-purple-100 mb-6">
              Continue earning cashback on your favorite stores
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full max-w-2xl">
              <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-2xl font-bold">${availableBalance.toFixed(2)}</div>
                <div className="text-sm text-purple-100">Available Balance</div>
              </div>
              <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-2xl font-bold">${profile.total_cashback_earned.toFixed(2)}</div>
                <div className="text-sm text-purple-100">Total Earned</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Link
                href="/dashboard"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center flex-1"
              >
                View Dashboard
              </Link>
              <button
                onClick={() => {
                  const referralUrl = `${window.location.origin}?ref=${profile.referral_code}`
                  navigator.clipboard.writeText(referralUrl)
                  // Show toast notification
                  const toast = document.createElement('div')
                  toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
                  toast.textContent = 'Referral link copied!'
                  document.body.appendChild(toast)
                  setTimeout(() => document.body.removeChild(toast), 3000)
                }}
                className="bg-white/20 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm text-center flex-1"
              >
                Share & Earn
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show benefits for non-logged in users
  return (
    <div className="w-full max-w-6xl mx-auto mb-12">
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-6 text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            🎉 Start Earning Cashback Today!
          </h2>
          <p className="text-xl text-purple-100 mb-6">
            Sign up now and get cashback on every purchase from 1,000+ stores
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-semibold mb-2">Up to 10% Cashback</h3>
              <p className="text-purple-100">Earn money back on every purchase at your favorite stores</p>
            </div>
            <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="text-xl font-semibold mb-2">$5 Welcome Bonus</h3>
              <p className="text-purple-100">Get $5 when you make your first qualifying purchase</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={async () => {
                localStorage.setItem('returnUrl', window.location.pathname)
                await signInWithGoogle()
              }}
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors flex items-center"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign Up with Google
            </button>
            <p className="text-sm text-purple-100">
              Free to join • No monthly fees • Secure with Google
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}