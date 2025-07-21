import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import HolidaySaleCalendarAdvanced from '@/components/sections/AdvancedHolidayCalendar';
import TodaysCouponCodes from '@/components/sections/TodaysCouponCodes';
import NewStores from '@/components/sections/NewStores';
import FAQ from '@/components/sections/FAQ';
import Reviews from '@/components/sections/Reviews';
import RecentPosts from '@/components/sections/RecentPosts';
import { getUpcomingHolidays } from '@/lib/holidays';

export default function Home() {
  // 服务端获取假期数据
  const initialHolidays = getUpcomingHolidays(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-8">
          {/* 假期日历部分 */}
          <div className="w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-text-primary mb-4">
                US Holiday Calendar
              </h1>
              <p className="text-text-secondary text-lg">
                Upcoming holidays and exclusive deals
              </p>
            </div>
            
            {/* 节日促销日历（客户端渲染，支持实时功能） */}
            <HolidaySaleCalendarAdvanced 
              initialHolidays={initialHolidays}
              showCountdown={true}
              showFilters={true}
            />
          </div>
          
          <TodaysCouponCodes />
          <NewStores />
          <FAQ />
          <Reviews />
          <RecentPosts />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
