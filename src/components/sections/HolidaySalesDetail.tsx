'use client';

import { useState } from 'react';
import { getStoreLogoPlaceholder } from '@/lib/placeholders';
import CouponModal from '@/components/ui/CouponModal';

interface HolidayDataItem {
  holiday_name: string;
  holiday_type: string;
  holiday_date: string;
  match_source: string;
  match_text: string;
  confidence_score: number;
  coupon: {
    id: string;
    title: string;
    subtitle: string;
    code: string;
    type: string;
    discount_value: string;
    expires_at: string;
    store: {
      name: string;
      alias: string;
      logo_url: string;
    };
  };
}

interface ModalCoupon {
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

interface HolidaySalesDetailProps {
  holidayName: string;
  holidayData: HolidayDataItem[];
}

export default function HolidaySalesDetail({ holidayName, holidayData }: HolidaySalesDetailProps) {
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [modalCoupon, setModalCoupon] = useState<ModalCoupon | null>(null);
  const [modalStoreName, setModalStoreName] = useState<string>('');

  const formatExpires = (expiresAt: string) => {
    if (!expiresAt) return '';
    const date = new Date(expiresAt);
    const now = new Date();
    if (date > now) {
      return `Expires ${date.toLocaleDateString()}`;
    }
    return 'Expired';
  };

  const handleCouponClick = (holidayItem: HolidayDataItem) => {
    const coupon = holidayItem.coupon;
    setSelectedCoupon(coupon.id);
    
    // Transform the coupon data to match CouponModal interface
    const modalCouponData = {
      id: parseInt(coupon.id),
      title: coupon.title,
      subtitle: coupon.discount_value,
      code: coupon.code || null,
      type: coupon.type as 'code' | 'deal',
      discount: coupon.discount_value,
      description: coupon.subtitle || coupon.title,
      expiresAt: coupon.expires_at,
      isPopular: false, // We don't have this info in holiday data
      minSpend: null, // We don't have this info in holiday data
      url: `https://${coupon.store.alias}.com` // Construct URL from store alias
    };
    
    setModalCoupon(modalCouponData);
    setModalStoreName(coupon.store.name);
  };

  const handleCloseModal = () => {
    setModalCoupon(null);
    setModalStoreName('');
  };

  const getTypeStyle = (type: string) => {
    return type === 'code' 
      ? 'bg-brand-light/10 text-brand-accent border-brand-light/20' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  if (holidayData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          No {holidayName} deals found
        </h3>
        <p className="text-text-secondary">
          Check back later for exclusive {holidayName} offers and discounts!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {holidayData.map((item) => {
          const coupon = item.coupon;
          const isSelected = selectedCoupon === coupon.id;
          
          return (
            <div
              key={coupon.id}
              className={`bg-card-bg/90 backdrop-blur-sm rounded-2xl border p-6 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                isSelected ? 'border-brand-light shadow-lg' : 'border-card-border'
              }`}
              onClick={() => handleCouponClick(item)}
            >
              {/* Store Logo */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-full border border-card-border flex items-center justify-center overflow-hidden">
                  <img 
                    src={coupon.store.logo_url || getStoreLogoPlaceholder()} 
                    alt={coupon.store.name}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getStoreLogoPlaceholder();
                    }}
                  />
                </div>
              </div>

              {/* Store Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-center flex-1">
                  <h3 className="font-bold text-text-primary text-lg">
                    {coupon.store.name}
                  </h3>                
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getTypeStyle(coupon.type)}`}>
                  {coupon.type === 'code' ? 'Coupon Code' : 'Deal'}
                </span>
              </div>

              {/* Coupon Title */}
              <div className="mb-4">
                <h4 className="font-semibold text-text-primary text-sm mb-2 line-clamp-2">
                  {coupon.title}
                </h4>
                {coupon.subtitle && (
                  <p className="text-xs text-text-secondary">
                    {coupon.subtitle}
                  </p>
                )}
              </div>

              {/* Discount Value */}
              <div className="mb-4">
                <div className="text-2xl font-bold text-brand-accent">
                  {coupon.discount_value}
                </div>
              </div>

              {/* Coupon Code */}
              {coupon.code && (
                <div className="mb-4">
                  <div className="bg-brand-light/10 border border-dashed border-brand-light/20 rounded-lg p-3 text-center">
                    <div className="text-xs text-text-secondary mb-1">Coupon Code</div>
                    <div className="font-mono font-bold text-brand-accent text-lg tracking-wider">
                      {coupon.code}
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      Click to view details
                    </div>
                  </div>
                </div>
              )}

              {/* Expiry */}
              {coupon.expires_at && (
                <div className="mb-4">
                  <p className="text-xs text-text-muted">
                    {formatExpires(coupon.expires_at)}
                  </p>
                </div>
              )}

              {/* Match Info */}
              <div className="pt-4 border-t border-card-border">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Found in {item.match_source}</span>
                  <span>
                    {Math.round(item.confidence_score * 100)}% match
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4">
                <button className="w-full bg-gradient-to-r from-brand-medium to-brand-light text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm font-bold">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Footer */}
      <div className="mt-12 bg-card-bg/50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          {holidayName} Shopping Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold text-brand-light mb-2">
              {holidayData.length}
            </div>
            <div className="text-text-secondary">Total Offers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-500 mb-2">
              {new Set(holidayData.map(item => item.coupon.store.name)).size}
            </div>
            <div className="text-text-secondary">Participating Stores</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-500 mb-2">
              {holidayData.filter(item => item.coupon.code).length}
            </div>
            <div className="text-text-secondary">Coupon Codes</div>
          </div>
        </div>
        <p className="text-text-secondary mt-6">
          All deals are automatically verified and updated daily for your convenience.
        </p>
      </div>

      {/* Coupon Modal */}
      <CouponModal 
        coupon={modalCoupon}
        storeName={modalStoreName}
        onClose={handleCloseModal}
      />
    </div>
  );
}