'use client';

import { useState } from 'react';
import HolidaySaleCalendarAdvanced from '@/components/sections/AdvancedHolidayCalendar';
import TodaysCouponCodes, { TodaysCoupon } from '@/components/sections/TodaysCouponCodes';
import PopularStores from '@/components/sections/PopularStores';
import FAQ from '@/components/sections/FAQ';
import Reviews from '@/components/sections/Reviews';
import RecentPosts from '@/components/sections/RecentPosts';
import TodaysCouponModal from '@/components/ui/TodaysCouponModal';
import EmailSubscriptionModal from '@/components/ui/EmailSubscriptionModal';

import { Holiday } from '@/lib/holidays';

interface HomeClientProps {
  initialHolidays: Holiday[];
}

export default function HomeClient({ initialHolidays }: HomeClientProps) {
  const [selectedTodaysCoupon, setSelectedTodaysCoupon] = useState<TodaysCoupon | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

  const handleTodaysCouponClick = (coupon: TodaysCoupon) => {
    setSelectedTodaysCoupon(coupon);
  };

  const handleCloseTodaysModal = () => {
    setSelectedTodaysCoupon(null);
  };

  const handleHolidaySubscribe = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setShowEmailModal(true);
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setSelectedHoliday(null);
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
            showCountdown={false}
            showFilters={true}
            onSubscribe={handleHolidaySubscribe}
          />
        </div>

        {/* Popular Stores */}
        <div className="w-full max-w-6xl">
          <PopularStores />
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
      
      {/* Email Subscription Modal */}
      <EmailSubscriptionModal 
        isOpen={showEmailModal}
        onClose={handleCloseEmailModal}
        holidayTitle={selectedHoliday?.eventTitle || ''}
      />
    </>
  );
}