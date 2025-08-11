import { getUpcomingHolidays, getHolidaysForCurrentYear } from '@/lib/holidays';
import HolidaySaleCalendar from '@/components/sections/HolidaySaleCalendar';
import AdvancedHolidayCalendar from '@/components/sections/AdvancedHolidayCalendar';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export default function HolidaysPage() {
  const upcomingHolidays = getUpcomingHolidays(10);
  const allHolidays = getHolidaysForCurrentYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-text-primary mb-4">
            🎉 US Holiday Calendar
          </h1>
          <p className="text-text-secondary text-xl max-w-2xl mx-auto">
            Discover upcoming American holidays, shopping events, and exclusive deals. 
            Stay prepared for every celebration throughout the year.
          </p>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-card-border">
            <div className="text-3xl font-bold text-brand-light mb-2">
              {allHolidays.length}
            </div>
            <div className="text-text-secondary">Total Holidays</div>
          </div>
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-card-border">
            <div className="text-3xl font-bold text-red-500 mb-2">
              {allHolidays.filter(h => h.type === 'Federal Holiday').length}
            </div>
            <div className="text-text-secondary">Federal Holidays</div>
          </div>
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-card-border">
            <div className="text-3xl font-bold text-green-500 mb-2">
              {allHolidays.filter(h => h.type === 'Shopping Event').length}
            </div>
            <div className="text-text-secondary">Shopping Events</div>
          </div>
        </div>

        {/* 节日促销日历 */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-6 text-center">
            Holiday Sale Calendar
          </h2>
          <AdvancedHolidayCalendar 
            initialHolidays={upcomingHolidays}
            showCountdown={true}
            showFilters={true}
          />
        </div>

        {/* 传统假期日历 */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-6 text-center">
            Traditional Holiday Calendar
          </h2>
          <HolidaySaleCalendar />
        </div>

        {/* 假期类型说明 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl p-6 border border-card-border">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🏛️</span>
              <h3 className="text-xl font-bold text-text-primary">Federal Holidays</h3>
            </div>
            <p className="text-text-secondary mb-4">
              Official US federal holidays when government offices and many businesses are closed.
            </p>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• New Year&apos;s Day</li>
              <li>• Martin Luther King Jr. Day</li>
              <li>• Presidents&apos; Day</li>
              <li>• Memorial Day</li>
              <li>• Independence Day</li>
              <li>• Labor Day</li>
              <li>• Columbus Day</li>
              <li>• Veterans Day</li>
              <li>• Thanksgiving Day</li>
              <li>• Christmas Day</li>
            </ul>
          </div>

          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl p-6 border border-card-border">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🛍️</span>
              <h3 className="text-xl font-bold text-text-primary">Shopping Events</h3>
            </div>
            <p className="text-text-secondary mb-4">
              Major shopping days with significant discounts and deals across retailers.
            </p>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Black Friday</li>
              <li>• Cyber Monday</li>
              <li>• Boxing Day</li>
              <li>• Prime Day</li>
              <li>• Back to School</li>
            </ul>
          </div>

          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl p-6 border border-card-border">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🎉</span>
              <h3 className="text-xl font-bold text-text-primary">Observances</h3>
            </div>
            <p className="text-text-secondary mb-4">
              Cultural and traditional celebrations that are widely observed but not federal holidays.
            </p>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Valentine&apos;s Day</li>
              <li>• St. Patrick&apos;s Day</li>
              <li>• Easter Sunday</li>
              <li>• Mother&apos;s Day</li>
              <li>• Father&apos;s Day</li>
              <li>• Halloween</li>
            </ul>
          </div>
        </div>

        {/* 功能特性 */}
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl p-8 border border-card-border">
          <h2 className="text-3xl font-bold text-text-primary mb-6 text-center">
            Features & Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-text-primary mb-2">Real-time Updates</h3>
              <p className="text-sm text-text-secondary">Live countdown timers and automatic updates</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-text-primary mb-2">Smart Filtering</h3>
              <p className="text-sm text-text-secondary">Filter by holiday type and preferences</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-bold text-text-primary mb-2">Mobile Friendly</h3>
              <p className="text-sm text-text-secondary">Responsive design for all devices</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="font-bold text-text-primary mb-2">API Ready</h3>
              <p className="text-sm text-text-secondary">RESTful API for integration</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 