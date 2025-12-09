'use client';

import { useAuth } from '@/hooks/useAuth';
import { addReferralTrackingToUrl, logCouponClick } from '@/utils/couponTracking';

interface Store {
  name: string;
  logo_url: string | null;
  description: string;
  rating: number;
  reviewCount: number;
  activeOffers: number;
  category: string;
  website: string;
  url: string;
  screenshot?: string | null;
}

interface StoreHeroProps {
  store: Store;
}

export default function StoreHero({ store }: StoreHeroProps) {
  const { user, profile } = useAuth();
  
  const handleStoreClick = () => {
    // Log the store visit for analytics
    logCouponClick(`store-${store.name}`, user?.id, profile?.referral_code);
    
    // Add referral tracking to URL if user is logged in
    const trackedUrl = addReferralTrackingToUrl(store.url, profile?.referral_code);
    
    // Open the tracked URL
    window.open(trackedUrl, '_blank', 'noopener,noreferrer');
  };
  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 mb-8">
      <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
        {/* Left Section: Store Info */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-start space-y-6 sm:space-y-0 sm:space-x-6">
          {/* Store Logo */}
          <div className="flex-shrink-0">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={`${store.name} logo`}
                className="w-24 h-24 rounded-2xl shadow-lg object-contain bg-white border border-card-border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-24 h-24 bg-gradient-to-br from-brand-light to-brand-accent rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg ${store.logo_url ? 'hidden' : ''}`}>
              {store.name.charAt(0)}
            </div>
          </div>

          {/* Store Details */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
              {store.name} Discount Codes
            </h1>

            {/* Store Category */}
            {store.category && (
              <div className="mb-4">
                <span className="text-xs text-text-muted bg-card-bg border border-card-border px-2 py-1 rounded-md">
                  {store.category}
                </span>
              </div>
            )}

            <p className="text-text-secondary leading-relaxed mb-6">
              {store.description}
            </p>

            {/* Store Stats */}
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < Math.floor(store.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-text-primary font-medium">{store.rating}</span>
                <span className="text-text-secondary">({store.reviewCount.toLocaleString()} reviews)</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {store.activeOffers} Active Offers
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-text-secondary">Website:</span>
                <a
                  href={`https://${store.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-light hover:text-brand-accent transition-colors font-medium"
                >
                  {store.website}
                </a>
              </div>
            </div>            
          </div>
        </div>

        {/* Right Section: Screenshot */}
        {store.screenshot && (
          <div className="flex-shrink-0 lg:w-80">
            <div className="rounded-xl overflow-hidden border border-card-border shadow-lg">
              <img
                src={store.screenshot}
                alt={`${store.name} website preview`}
                className="w-full h-auto object-cover max-h-[200px]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.parentElement?.classList.add('hidden');
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}