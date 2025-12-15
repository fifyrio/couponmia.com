import { getUpcomingHolidays, getHolidaysForCurrentYear } from '@/lib/holidays';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import HolidaysClient from '@/components/pages/HolidaysClient';

export default function HolidaysPage() {
  const upcomingHolidays = getUpcomingHolidays(10);
  const allHolidays = getHolidaysForCurrentYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      <Header />
      <HolidaysClient upcomingHolidays={upcomingHolidays} allHolidays={allHolidays} />
      <Footer />
    </div>
  );
} 