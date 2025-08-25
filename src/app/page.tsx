import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Hero from '@/components/sections/Hero';
import ChromeExtensionBanner from '@/components/sections/ChromeExtensionBanner';
import HomeClient from '@/components/pages/HomeClient';
import { getUpcomingHolidays } from '@/lib/holidays';

export default function Home() {
  // 服务端获取假期数据 (使用静态计算，不是数据库)
  const initialHolidays = getUpcomingHolidays(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      {/* Chrome Extension Promotion Banner */}
      <ChromeExtensionBanner />
      
      <Header />
      
      {/* Hero Section */}
      <Hero />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-8">                    
          <HomeClient initialHolidays={initialHolidays} />       
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
