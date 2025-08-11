import { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import HolidaySalesDetail from '@/components/sections/HolidaySalesDetail';
import { getHolidayCoupons } from '@/lib/api';

interface Props {
  params: Promise<{ 'holiday-slug': string }>;
}

// 节日名称映射 - 支持URL slug到节日名称的转换
const holidaySlugMap: { [key: string]: string } = {
  // 季节促销
  'summer-sale': 'Summer Sale',
  'winter-sale': 'Winter Sale', 
  'spring-sale': 'Spring Sale',
  'fall-sale': 'Fall Sale',
  'autumn-sale': 'Autumn Sale',
  
  // 主要购物节
  'black-friday': 'Black Friday',
  'cyber-monday': 'Cyber Monday',
  'prime-day': 'Prime Day',
  'boxing-day': 'Boxing Day',
  
  // 联邦节日
  'new-years-day': "New Year's Day",
  'martin-luther-king-jr-day': 'Martin Luther King Jr. Day',
  'presidents-day': "Presidents' Day", 
  'memorial-day': 'Memorial Day',
  'independence-day': 'Independence Day',
  'labor-day': 'Labor Day',
  'columbus-day': 'Columbus Day',
  'veterans-day': 'Veterans Day',
  'thanksgiving-day': 'Thanksgiving Day',
  'christmas-day': 'Christmas Day',
  
  // 文化节日
  'valentines-day': "Valentine's Day",
  'st-patricks-day': "St. Patrick's Day", 
  'easter-sunday': 'Easter Sunday',
  'mothers-day': "Mother's Day",
  'fathers-day': "Father's Day",
  'halloween': 'Halloween',
  
  // 特殊活动
  'back-to-school': 'Back to School',
  'end-of-year': 'End of Year',
  'womens-equality-day': "Women's Equality Day",
  'earth-day': 'Earth Day',
  'april-fools-day': "April Fool's Day",
  'groundhog-day': 'Groundhog Day',
  'mardi-gras': 'Mardi Gras',
  'cinco-de-mayo': 'Cinco de Mayo',
  'flag-day': 'Flag Day',
  'national-donut-day': 'National Donut Day',
  'world-health-day': 'World Health Day',
  'international-womens-day': "International Women's Day",
  
  // 宗教节日
  'good-friday': 'Good Friday',
  'palm-sunday': 'Palm Sunday',
  'ash-wednesday': 'Ash Wednesday',
  'passover': 'Passover',
  'rosh-hashanah': 'Rosh Hashanah',
  'yom-kippur': 'Yom Kippur',
  'hanukkah': 'Hanukkah',
  'kwanzaa': 'Kwanzaa',
  
  // 月度促销
  'january-sale': 'January Sale',
  'february-sale': 'February Sale',
  'march-sale': 'March Sale',
  'april-sale': 'April Sale', 
  'may-sale': 'May Sale',
  'june-sale': 'June Sale',
  'july-sale': 'July Sale',
  'august-sale': 'August Sale',
  'september-sale': 'September Sale',
  'october-sale': 'October Sale',
  'november-sale': 'November Sale',
  'december-sale': 'December Sale'
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { 'holiday-slug': holidaySlug } = await params;
  const holidayName = holidaySlugMap[holidaySlug] || holidaySlug.replace(/-/g, ' ');
  
  return {
    title: `${holidayName} Deals & Coupons - Save Big | CouponMia`,
    description: `Discover exclusive ${holidayName} deals and discount codes. Save money with verified coupons from top retailers during ${holidayName} sales.`,
    alternates: {
      canonical: `https://couponmia.com/holidays/${holidaySlug}`
    }
  };
}

export default async function HolidaySalePage({ params }: Props) {
  const { 'holiday-slug': holidaySlug } = await params;
  const holidayName = holidaySlugMap[holidaySlug] || holidaySlug.replace(/-/g, ' ');
  
  // 获取该节日的促销数据
  const holidayData = await getHolidayCoupons(holidayName, 50);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-text-primary mb-4">
            {holidayName} Deals & Coupons
          </h1>
          <p className="text-text-secondary text-xl max-w-3xl mx-auto">
            Discover exclusive discounts and promotional offers for {holidayName}. 
            Save money with verified coupons from your favorite stores.
          </p>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-card-border">
            <div className="text-3xl font-bold text-brand-light mb-2">
              {holidayData.length}
            </div>
            <div className="text-text-secondary">Available Deals</div>
          </div>
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-card-border">
            <div className="text-3xl font-bold text-green-500 mb-2">
              {new Set(holidayData.map(item => item.coupon?.store?.name).filter(Boolean)).size}
            </div>
            <div className="text-text-secondary">Featured Stores</div>
          </div>
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-card-border">
            <div className="text-3xl font-bold text-purple-500 mb-2">
              {holidayData.filter(item => item.coupon?.code).length}
            </div>
            <div className="text-text-secondary">Coupon Codes</div>
          </div>
        </div>

        {/* 节日促销详情 */}
        <HolidaySalesDetail 
          holidayName={holidayName}
          holidayData={holidayData}
        />
      </main>
      
      <Footer />
    </div>
  );
}

// 静态生成常见节日路径
export async function generateStaticParams() {
  const commonHolidays = [
    'summer-sale',
    'winter-sale',
    'black-friday', 
    'cyber-monday',
    'christmas-day',
    'halloween',
    'valentines-day',
    'mothers-day',
    'fathers-day'
  ];
  
  return commonHolidays.map((slug) => ({
    'holiday-slug': slug,
  }));
}