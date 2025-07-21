import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import HolidaySaleCalendar from '@/components/sections/HolidaySaleCalendar';
import TodaysCouponCodes from '@/components/sections/TodaysCouponCodes';
import NewStores from '@/components/sections/NewStores';
import FAQ from '@/components/sections/FAQ';
import Reviews from '@/components/sections/Reviews';
import RecentPosts from '@/components/sections/RecentPosts';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-8">
          <HolidaySaleCalendar />
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
