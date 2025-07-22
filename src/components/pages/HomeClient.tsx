'use client';

import { useState } from 'react';
import HolidaySaleCalendarAdvanced from '@/components/sections/AdvancedHolidayCalendar';
import TodaysCouponCodes, { TodaysCoupon } from '@/components/sections/TodaysCouponCodes';
import NewStores from '@/components/sections/NewStores';
import FAQ from '@/components/sections/FAQ';
import Reviews from '@/components/sections/Reviews';
import RecentPosts from '@/components/sections/RecentPosts';
import TodaysCouponModal from '@/components/ui/TodaysCouponModal';

import { Holiday } from '@/lib/holidays';

interface HomeClientProps {
  initialHolidays: Holiday[];
}

export default function HomeClient({ initialHolidays }: HomeClientProps) {
  const [selectedTodaysCoupon, setSelectedTodaysCoupon] = useState<TodaysCoupon | null>(null);

  const handleTodaysCouponClick = (coupon: TodaysCoupon) => {
    setSelectedTodaysCoupon(coupon);
  };

  const handleCloseTodaysModal = () => {
    setSelectedTodaysCoupon(null);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-8">
        
        
        {/* Today's Coupon Codes */}
        <div className="w-full max-w-6xl">
          <TodaysCouponCodes onCouponClick={handleTodaysCouponClick} />
        </div>

        {/* Holiday Sale Calendar */}
        <div className="w-full max-w-6xl">
          <HolidaySaleCalendarAdvanced 
            initialHolidays={initialHolidays}
            showCountdown={true}
            showFilters={true}
          />
        </div>

        {/* New Stores */}
        <div className="w-full max-w-6xl">
          <NewStores />
        </div>

        {/* FAQ */}
        <div className="w-full max-w-6xl">
          <FAQ />
        </div>

        {/* Reviews */}
        <div className="w-full max-w-6xl">
          <Reviews />
        </div>

        {/* Recent Posts */}
        <div className="w-full max-w-6xl">
          <RecentPosts />
        </div>
      </div>

      {/* Today's Coupon Modal */}
      <TodaysCouponModal 
        coupon={selectedTodaysCoupon}
        onClose={handleCloseTodaysModal}
      />
    </>
  );
}