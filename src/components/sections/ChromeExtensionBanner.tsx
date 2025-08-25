'use client';

import { useState } from 'react';
import { X, Chrome, Download, Zap, Shield, Clock } from 'lucide-react';

export default function ChromeExtensionBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Chrome Extension Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Chrome className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    Get CouponMia Chrome Extension - Auto-apply coupons instantly
                  </h3>
                </div>
                
                {/* Features */}
                <div className="hidden lg:flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>Auto-apply coupons</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>100% Safe</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Save time</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="flex-shrink-0">
              <a
                href="https://chromewebstore.google.com/detail/couponmia-smart-coupon-fi/lecnpmdlhpiapkjjaadbpkkbknodmeof"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors duration-200 group"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Add to Chrome</span>
              </a>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="ml-4 flex-shrink-0 p-1 hover:bg-white/10 rounded-md transition-colors duration-200"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}