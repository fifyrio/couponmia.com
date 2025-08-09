'use client';

import { useState } from 'react';
import StoreHero from '@/components/sections/StoreHero';
import StoreCoupons from '@/components/sections/StoreCoupons';
import SimilarStores from '@/components/sections/SimilarStores';
import StoreFAQ from '@/components/sections/StoreFAQ';
import StoreMoreInfo from '@/components/sections/StoreMoreInfo';
import CouponModal from '@/components/ui/CouponModal';

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
}

interface Store {
  name: string;
  logo_url: string | null;
  description: string;
  rating: number;
  reviewCount: number;
  activeOffers: number;
  categories: string[];
  website: string;
  established: string;
  headquarters: string;
  coupons: Coupon[];
  similarStores: Array<{ name: string; alias: string; logo_url: string | null; offers: number }>;
  faq: Array<{ question: string; answer: string }>;
}

interface StoreDetailClientProps {
  store: Store;
}

export default function StoreDetailClient({ store }: StoreDetailClientProps) {
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const handleCouponClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
  };

  const handleCloseModal = () => {
    setSelectedCoupon(null);
  };

  return (
    <>
      {/* Store Hero Section */}
      <StoreHero store={store} />

      {/* Coupons Section */}
      <StoreCoupons 
        coupons={store.coupons} 
        storeName={store.name}
        onCouponClick={handleCouponClick}
      />

      {/* Similar Stores */}
      <SimilarStores stores={store.similarStores} currentStore={store.name} />

      {/* FAQ Section */}
      <StoreFAQ faq={store.faq} storeName={store.name} />

      {/* More Info Section */}
      <StoreMoreInfo storeName={store.name} />

      {/* Coupon Modal */}
      <CouponModal 
        coupon={selectedCoupon}
        storeName={store.name}
        onClose={handleCloseModal}
      />
    </>
  );
}