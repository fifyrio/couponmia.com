export default function HolidaySaleCalendar() {
  const upcomingEvents = [
    { date: "Date", eventTitle: "Event Title", type: "Subscribe" },
    { date: "Date", eventTitle: "Event Title", type: "Subscribe" },
    { date: "Date", eventTitle: "Event Title", type: "Subscribe" },
  ];

  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 mb-8 w-full">
      <h2 className="text-2xl font-bold text-center mb-8 text-text-primary">Holiday Sale Calendar</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-6 text-text-secondary">Upcoming</h3>
        <div className="space-y-4">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-card-border last:border-b-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm bg-brand-lightest text-brand-light px-3 py-2 rounded-lg font-medium">{event.date}</span>
                <span className="text-sm text-text-secondary">{event.eventTitle}</span>
              </div>
              <button className="text-sm bg-gradient-to-r from-brand-medium to-brand-light text-white px-4 py-2 rounded-lg hover:from-brand-light hover:to-brand-accent transition-all duration-200 font-medium shadow-sm">
                {event.type}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center space-x-3">
        <div className="w-3 h-3 bg-brand-medium rounded-full"></div>
        <div className="w-3 h-3 bg-brand-light rounded-full"></div>
        <div className="w-3 h-3 bg-brand-accent rounded-full"></div>
        <div className="w-3 h-3 bg-brand-light rounded-full opacity-60"></div>
      </div>
    </div>
  );
}