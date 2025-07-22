'use client';

import { useState } from 'react';

interface EmailSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  holidayTitle: string;
}

export default function EmailSubscriptionModal({ isOpen, onClose, holidayTitle }: EmailSubscriptionModalProps) {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim()) return;
    
    setIsSubscribing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      setSubscriptionSuccess(true);
      
      // Show success message for 2 seconds then close
      setTimeout(() => {
        setSubscriptionSuccess(false);
        setEmail('');
        onClose();
      }, 2000);
    }, 1000);
  };

  const handleClose = () => {
    setEmail('');
    setSubscriptionSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg/95 backdrop-blur-sm border border-card-border rounded-2xl shadow-2xl max-w-md w-full p-8">
        {subscriptionSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-text-primary mb-2">Successfully Subscribed!</div>
            <p className="text-text-secondary">You&apos;ll receive exclusive deals for {holidayTitle}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Subscribe for Deals</h2>
              <button
                onClick={handleClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-text-secondary mb-4">
                Get notified about exclusive deals and discounts for <span className="font-semibold text-text-primary">{holidayTitle}</span>
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-card-border rounded-xl focus:ring-2 focus:ring-brand-light focus:border-transparent bg-white/90 text-text-primary placeholder-text-muted transition-all"
                    disabled={isSubscribing}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={isSubscribing}
                className="flex-1 px-6 py-3 border border-card-border text-text-primary rounded-xl hover:bg-card-bg/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubscribe}
                disabled={!email.trim() || isSubscribing}
                className="flex-1 bg-gradient-to-r from-brand-medium to-brand-light text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Subscribing...
                  </div>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>

            <p className="text-xs text-text-muted mt-4 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </>
        )}
      </div>
    </div>
  );
}