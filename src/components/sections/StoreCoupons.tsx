'use client';

import { useState } from 'react';

interface Coupon {
  id: number;
  title: string;
  subtitle: string;
  code: string | null;
  type: 'code' | 'deal';
  discount: string;
  description: string;
  expiresAt: string;
  isPopular: boolean;
  minSpend: number | null;
  url: string;
}

interface StoreCouponsProps {
  coupons: Coupon[];
  storeName: string;
  onCouponClick: (coupon: Coupon) => void;
}

export default function StoreCoupons({ coupons, storeName, onCouponClick }: StoreCouponsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'coupons' | 'deals'>('all');
  const [showAll, setShowAll] = useState(false);

  const allFilteredCoupons = coupons.filter(coupon => {
    if (activeTab === 'all') return true;
    if (activeTab === 'coupons') return coupon.type === 'code';
    if (activeTab === 'deals') return coupon.type === 'deal';
    return true;
  });

  const filterCoupons = showAll ? allFilteredCoupons : allFilteredCoupons.slice(0, 6);


  const maskCouponCode = (code: string) => {
    if (code.length <= 3) return code;
    return code.substring(0, 3) + '*'.repeat(code.length - 3);
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays <= 7) return `Expires in ${diffDays} days`;
    return `Expires ${date.toLocaleDateString()}`;
  };

  const formatDiscount = (subtitle: string) => {
    if (subtitle === 'other') return 'DEAL';
    // Handle 'FROM 0.00' case
    if (subtitle && subtitle.toLowerCase().includes('from 0.00')) return 'DEAL';
    // Handle other cases with 'from 0' variations
    if (subtitle && /from\s*0(\.0+)?/i.test(subtitle)) return 'DEAL';
    // Remove unnecessary decimal points (e.g., "15.00% OFF" -> "15% OFF")
    return subtitle.replace(/\.0+(?=\s*%)/g, '');
  };

  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        
        {/* Tab Navigation */}
        <div className="flex bg-card-bg/50 border border-card-border rounded-lg p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-brand-light text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All ({coupons.length})
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
              activeTab === 'coupons'
                ? 'bg-brand-light text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Coupons ({coupons.filter(c => c.type === 'code').length})
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
              activeTab === 'deals'
                ? 'bg-brand-light text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Deals ({coupons.filter(c => c.type === 'deal').length})
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {filterCoupons.map((coupon, index) => (
          <div
            key={coupon.id && !isNaN(coupon.id) ? coupon.id : `coupon-${activeTab}-${index}-${coupon.title}-${coupon.code || 'no-code'}`}
            className="bg-card-bg/90 backdrop-blur-sm border border-card-border rounded-xl p-6 transition-all duration-200 hover:shadow-md hover:border-brand-light/50 cursor-pointer"
            onClick={() => onCouponClick(coupon)}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              {/* Coupon Info */}
              <div className="flex items-center space-x-6 mb-4 lg:mb-0">
                {/* Discount Badge */}
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-brand-light to-brand-accent rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm text-center leading-tight">
                  {formatDiscount(coupon.subtitle)}
                </div>

                {/* Coupon Details */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="font-semibold text-text-primary text-base">
                      {coupon.title}
                    </div>
                    {coupon.isPopular && (
                      <span className="bg-brand-light/10 text-brand-light px-2 py-1 rounded-md text-xs font-medium border border-brand-light/20">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm mb-2">{coupon.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      {formatExpiryDate(coupon.expiresAt)}
                    </span>
                    {coupon.minSpend && (
                      <span>Min spend: ${coupon.minSpend}</span>
                    )}
                    <span className="text-brand-light">Verified</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center space-x-4 lg:flex-shrink-0">
                {coupon.code ? (
                  <div className="flex items-center space-x-3">
                    <div className="bg-card-bg border border-card-border px-4 py-2 rounded-lg">
                      <span className="font-mono font-medium text-text-primary text-sm">
                        {maskCouponCode(coupon.code)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCouponClick(coupon);
                      }}
                      className="px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm cursor-pointer bg-brand-light text-white hover:bg-brand-accent shadow-sm"
                    >
                      Copy Code
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onCouponClick(coupon);
                    }}
                    className="bg-brand-light text-white px-8 py-2 rounded-lg font-medium hover:bg-brand-accent transition-all duration-200 shadow-sm text-sm cursor-pointer"
                  >
                    Get Deal
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filterCoupons.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎫</div>
          <div className="text-xl font-semibold text-text-primary mb-2">
            No {activeTab} available
          </div>
          <p className="text-text-secondary">
            Check back soon for new {activeTab} from {storeName}!
          </p>
        </div>
      )}

      {/* Show More Button */}
      {!showAll && allFilteredCoupons.length > 6 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(true)}
            className="bg-card-bg/90 border border-card-border text-text-primary px-8 py-3 rounded-lg font-medium hover:bg-brand-light hover:text-white hover:border-brand-light transition-all duration-200 shadow-sm"
          >
            Show More ({allFilteredCoupons.length - 6} more)
          </button>
        </div>
      )}

      {/* Show Less Button */}
      {showAll && allFilteredCoupons.length > 6 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(false)}
            className="bg-card-bg/90 border border-card-border text-text-primary px-8 py-3 rounded-lg font-medium hover:bg-brand-light hover:text-white hover:border-brand-light transition-all duration-200 shadow-sm"
          >
            Show Less
          </button>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-text-secondary bg-card-bg/50 border border-card-border rounded-lg p-4">
        <p>
          💡 <strong>How to use:</strong> Click any coupon card to see details, then copy the code and apply it at checkout to save money!
        </p>
      </div>
    </div>
  );
}