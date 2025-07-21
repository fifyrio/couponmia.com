# CouponMia.com - US Holiday Calendar System

A comprehensive American holiday calendar system built with Next.js, featuring real-time countdowns, dynamic date calculations, and exclusive deals integration.

## 🎉 Features

### Core Holiday System
- **Real US Holidays**: Complete database of federal holidays, observances, and shopping events
- **Dynamic Date Calculation**: Automatic calculation of variable holidays (Thanksgiving, Easter, etc.)
- **Server-Side Rendering**: SEO-friendly with Next.js SSR support
- **Real-time Countdown**: Live countdown timers for upcoming holidays
- **Smart Filtering**: Filter holidays by type (Federal, Shopping, Observance)

### Technical Features
- **TypeScript**: Full type safety and better development experience
- **API Integration**: RESTful API for holiday data
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance Optimized**: Efficient algorithms and caching strategies

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd couponmia.com

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
- **Main Page**: http://localhost:3000
- **Holiday Calendar**: http://localhost:3000/holidays
- **API Endpoint**: http://localhost:3000/api/holidays

## 📅 Holiday Data

### Federal Holidays
- New Year's Day (Jan 1)
- Martin Luther King Jr. Day (3rd Monday in Jan)
- Presidents' Day (3rd Monday in Feb)
- Memorial Day (Last Monday in May)
- Independence Day (Jul 4)
- Labor Day (1st Monday in Sep)
- Columbus Day (2nd Monday in Oct)
- Veterans Day (Nov 11)
- Thanksgiving Day (4th Thursday in Nov)
- Christmas Day (Dec 25)
- Juneteenth (Jun 19)

### Shopping Events
- Black Friday (Day after Thanksgiving)
- Cyber Monday (Monday after Thanksgiving)
- Boxing Day (Dec 26)

### Observances
- Valentine's Day (Feb 14)
- St. Patrick's Day (Mar 17)
- Easter Sunday (Variable - calculated)
- Mother's Day (2nd Sunday in May)
- Father's Day (3rd Sunday in Jun)
- Halloween (Oct 31)
- Women's Equality Day (Aug 26)

## 🔧 API Usage

### Get Upcoming Holidays
```bash
GET /api/holidays?count=10
```

### Get Holidays by Type
```bash
GET /api/holidays?type=Federal%20Holiday
```

### Get All Holidays for Year
```bash
GET /api/holidays?year=2024
```

### Response Format
```json
{
  "success": true,
  "data": [
    {
      "date": "Nov 27",
      "eventTitle": "Thanksgiving Day",
      "type": "Federal Holiday",
      "month": 11,
      "day": 27,
      "isDynamic": true,
      "fullDate": "2024-11-27T00:00:00.000Z",
      "daysUntil": 129
    }
  ],
  "count": 1,
  "timestamp": "2024-07-21T06:37:01.665Z"
}
```

## 🏗️ Architecture

### File Structure
```
src/
├── app/
│   ├── api/holidays/route.ts    # API endpoint
│   ├── holidays/page.tsx        # Holiday showcase page
│   └── page.tsx                 # Main page
├── components/
│   └── sections/
│       ├── HolidaySaleCalendar.tsx      # Traditional calendar
│       └── AdvancedHolidayCalendar.tsx  # Advanced calendar
└── lib/
    └── holidays.ts              # Holiday data and calculations
```

### Key Components

#### HolidaySaleCalendar.tsx
- Server-side rendered holiday display
- Modal popups for holiday details
- Interactive subscribe buttons

#### AdvancedHolidayCalendar.tsx
- Client-side rendering with real-time updates
- Live countdown timers
- Type filtering
- API integration

#### holidays.ts
- Holiday data management
- Dynamic date calculations
- Utility functions for date manipulation

## 🧮 Dynamic Date Algorithms

### Easter Calculation (Meeus/Jones/Butcher Algorithm)
```typescript
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  // ... complex calculation
  return new Date(year, month - 1, day);
}
```

### Thanksgiving Calculation
```typescript
// 4th Thursday in November
const thanksgiving = getNthDayOfMonth(year, 11, 4, 4);
```

### Mother's Day Calculation
```typescript
// 2nd Sunday in May
const mothersDay = getNthDayOfMonth(year, 5, 2, 0);
```

## 🎨 Styling

The application uses Tailwind CSS with a custom design system:

### Color Palette
- **Primary**: Brand colors for main elements
- **Red**: Federal holidays
- **Green**: Shopping events  
- **Blue**: Observances
- **Gray**: Secondary text and borders

### Components
- Glassmorphism effects with backdrop blur
- Smooth transitions and hover effects
- Responsive grid layouts
- Modern card designs

## 🔮 Future Enhancements

### Planned Features
- [ ] Email notifications for upcoming holidays
- [ ] Calendar export (iCal, Google Calendar)
- [ ] Holiday-specific deal recommendations
- [ ] Multi-language support
- [ ] Holiday history and trivia
- [ ] Social sharing integration

### Technical Improvements
- [ ] Redis caching for API responses
- [ ] GraphQL API for more flexible queries
- [ ] PWA support for offline access
- [ ] Advanced analytics and tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- US Federal Holiday data from official government sources
- Easter calculation algorithm by Jean Meeus
- Holiday icons and emojis for visual appeal
- Next.js team for the amazing framework

---

**Built with ❤️ for CouponMia.com**