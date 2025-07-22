"use client";

import { useState } from 'react';

export interface TodaysCoupon {
  title: string;
  code: string;
  views: string;
  store: string;
  discount: string;
  expires: string;
}

interface TodaysCouponCodesProps {
  onCouponClick: (coupon: TodaysCoupon) => void;
}

export default function TodaysCouponCodes({ onCouponClick }: TodaysCouponCodesProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };
  const featuredCoupons = [
    {
      title: "75% Off Select Clearance Sitewide Deals + Free Delivery",
      code: "SAVE75",
      views: "1.2k Views",
      store: "Amazon",
      discount: "75% OFF",
      expires: "Ends Today"
    },
    {
      title: "Buy 2 Get 1 Free on All Electronics + Extra 20% Off", 
      code: "TECH20",
      views: "856 Views",
      store: "Best Buy",
      discount: "BOGO + 20%",
      expires: "2 Days Left"
    }
  ];


  return (
    <div className="w-full mb-8">
      <h1 className="text-2xl font-bold mb-8 text-text-primary px-4">Today&apos;s Coupon Codes</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        {featuredCoupons.map((coupon, index) => (
          <div 
            key={index} 
            className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
            onClick={() => onCouponClick(coupon)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-full">
                    {coupon.store}
                  </span>
                  <span className="text-xs font-bold text-white bg-gradient-to-r from-brand-medium to-brand-light px-2 py-1 rounded-full">
                    {coupon.discount}
                  </span>
                </div>
                <div className="text-sm font-semibold text-text-primary mb-3 leading-relaxed">
                  {coupon.title}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  className="bg-gradient-to-r from-brand-medium to-brand-light text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCode(coupon.code);
                  }}
                >
                  {copiedCode === coupon.code ? '✓ Copied!' : coupon.code}
                </button>
                <span className="text-xs text-text-muted font-medium">{coupon.views}</span>
              </div>
              <span className="text-xs text-brand-accent font-medium">{coupon.expires}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}