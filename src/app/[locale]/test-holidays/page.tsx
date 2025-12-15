import { getHolidaysForCurrentYear, getUpcomingHolidays } from '@/lib/holidays';

export default function TestHolidaysPage() {
  const allHolidays = getHolidaysForCurrentYear();
  const upcomingHolidays = getUpcomingHolidays(10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-text-primary">Holiday Data Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-6">
            <h2 className="text-xl font-bold mb-4 text-text-primary">All Holidays (2024)</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allHolidays
                .sort((a, b) => {
                  if (a.month !== b.month) return a.month - b.month;
                  return a.day - b.day;
                })
                .map((holiday, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
                    <div>
                      <span className="font-medium text-text-primary">{holiday.eventTitle}</span>
                      <span className="text-sm text-text-secondary ml-2">({holiday.type})</span>
                    </div>
                    <span className="text-sm bg-brand-lightest text-brand-light px-2 py-1 rounded">
                      {holiday.date}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-6">
            <h2 className="text-xl font-bold mb-4 text-text-primary">Upcoming Holidays</h2>
            <div className="space-y-2">
              {upcomingHolidays.map((holiday, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
                  <div>
                    <span className="font-medium text-text-primary">{holiday.eventTitle}</span>
                    <span className="text-sm text-text-secondary ml-2">({holiday.type})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm bg-brand-lightest text-brand-light px-2 py-1 rounded block">
                      {holiday.date}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {holiday.daysUntil !== undefined && `${holiday.daysUntil} days`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-6">
          <h2 className="text-xl font-bold mb-4 text-text-primary">Current Date Info</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-brand-light">
                {new Date().getFullYear()}
              </div>
              <div className="text-sm text-text-secondary">Year</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-light">
                {new Date().getMonth() + 1}
              </div>
              <div className="text-sm text-text-secondary">Month</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-light">
                {new Date().getDate()}
              </div>
              <div className="text-sm text-text-secondary">Day</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-light">
                {upcomingHolidays.length}
              </div>
              <div className="text-sm text-text-secondary">Upcoming</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 