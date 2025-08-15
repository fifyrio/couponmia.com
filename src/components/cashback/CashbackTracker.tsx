'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import CashbackBadge from './CashbackBadge';

interface CashbackTrackerProps {
  storeId: string;
  storeName: string;
  couponId?: string;
  cashbackRate?: number;
}

export default function CashbackTracker({ 
  storeId, 
  storeName, 
  couponId, 
  cashbackRate = 2.0 
}: CashbackTrackerProps) {
  const { user, signInWithGoogle } = useAuth();
  const [isTracking, setIsTracking] = useState(false);

  const handleCashbackClick = async () => {
    if (isTracking) return;
    
    setIsTracking(true);
    
    try {
      // Track the click
      const response = await fetch('/api/cashback/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          couponId,
          userId: user?.id,
          sessionId: generateSessionId()
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Redirect to the store with cashback tracking
        window.open(result.redirectUrl, '_blank');
        
        // Show cashback tracking notification
        if (user) {
          showCashbackNotification();
        } else {
          showSignupPrompt();
        }
      }
    } catch (error) {
      console.error('Cashback tracking failed:', error);
    } finally {
      setIsTracking(false);
    }
  };

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const showCashbackNotification = () => {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <div>
          <p class="font-semibold">Cashback tracking enabled!</p>
          <p class="text-sm">You can earn ${cashbackRate}% cashback on purchase</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 5000);
  };

  const showSignupPrompt = async () => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-purple-500 text-white p-4 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <div>
          <p class="font-semibold">Sign in to earn cashback!</p>
          <p class="text-sm">Get ${cashbackRate}% cashback on shopping after signing in</p>
          <button id="login-btn-${Date.now()}" class="mt-2 bg-white text-purple-500 px-3 py-1 rounded text-sm font-medium">
            Sign In Now
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add click handler for login button
    const loginBtn = notification.querySelector('button');
    if (loginBtn) {
      loginBtn.addEventListener('click', async () => {
        localStorage.setItem('returnUrl', window.location.pathname);
        await signInWithGoogle();
        document.body.removeChild(notification);
      });
    }
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 8000);
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
         
          <div>
            <h3 className="font-semibold text-gray-900">{storeName} Cashback</h3>
            <p className="text-sm text-gray-600">
              Shop through our link to earn <span className="font-semibold text-purple-600">{cashbackRate}%</span> cashback
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <CashbackBadge cashbackRate={cashbackRate} />
          
          <button
            onClick={handleCashbackClick}
            disabled={isTracking}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTracking ? 'Redirecting...' : 'Activate Cashback'}
          </button>
        </div>
      </div>
      
      {!user && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Note:</span> Sign in to your account to earn cashback rewards.
            <button 
              onClick={async () => {
                localStorage.setItem('returnUrl', window.location.pathname);
                await signInWithGoogle();
              }}
              className="text-purple-600 hover:underline ml-1"
            >
              Sign In Now
            </button>
          </p>
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-500">
        <p>• Cashback will be credited within 24-48 hours after order confirmation</p>
        <p>• Cashback amount is calculated based on actual payment amount</p>
        <p>• Using other coupon codes may affect cashback rate</p>
      </div>
    </div>
  );
}