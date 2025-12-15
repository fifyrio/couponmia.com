import { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import HolidaySalesDetail from '@/components/sections/HolidaySalesDetail';
import { getHolidayCoupons, getHolidayBySlug } from '@/lib/api';
import { getHolidayBannerPlaceholder } from '@/lib/placeholders';

interface Props {
  params: Promise<{ 'holiday-slug': string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { 'holiday-slug': rawHolidaySlug } = await params;
  const holidaySlug = decodeURIComponent(rawHolidaySlug);
  
  // 从数据库获取节日信息
  const holidayData = await getHolidayBySlug(holidaySlug);
  const holidayName = holidayData?.name || holidaySlug.replace(/-/g, ' ');
  
  return {
    title: `${holidayName} Deals & Coupons - Save Big | CouponMia`,
    description: `Discover exclusive ${holidayName} deals and discount codes. Save money with verified coupons from top retailers during ${holidayName} sales.`,
    alternates: {
      canonical: `https://couponmia.com/holidays/${holidaySlug}`
    }
  };
}

export default async function HolidaySalePage({ params }: Props) {
  const { 'holiday-slug': rawHolidaySlug } = await params;
  const holidaySlug = decodeURIComponent(rawHolidaySlug);
  
  // 从数据库获取节日信息
  const holidayInfo = await getHolidayBySlug(holidaySlug);
  const holidayName = holidayInfo?.name || holidaySlug.replace(/-/g, ' ');
  const holidayImage = holidayInfo?.banner_image_url;
  
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

        {/* Holiday Image */}
        <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src={holidayImage || getHolidayBannerPlaceholder()} 
            alt={`${holidayName} Sale Banner`}
            className="w-full h-32 md:h-40 lg:h-48 object-cover"
            loading="eager"
          />
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
              {new Set(holidayData.map(item => 
                (item as unknown as { coupon?: { store?: { name?: string } } }).coupon?.store?.name
              ).filter(Boolean)).size}
            </div>
            <div className="text-text-secondary">Featured Stores</div>
          </div>
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-card-border">
            <div className="text-3xl font-bold text-purple-500 mb-2">
              {holidayData.filter(item => (item as unknown as { coupon?: { code?: string } }).coupon?.code).length}
            </div>
            <div className="text-text-secondary">Coupon Codes</div>
          </div>
        </div>

        {/* 节日促销详情 */}
        <HolidaySalesDetail 
          holidayName={holidayName}
          holidayData={holidayData as unknown as { holiday_name: string; holiday_type: string; holiday_date: string; match_source: string; match_text: string; confidence_score: number; coupon: { id: string; title: string; subtitle: string; code: string; type: string; discount_value: string; expires_at: string; store: { name: string; alias: string; logo_url: string; }; }; }[]}
        />
      </main>
      
      <Footer />
    </div>
  );
}

// 静态生成活跃节日路径
export async function generateStaticParams() {
  try {
    // 从数据库获取活跃的节日列表
    const { data } = await import('@/lib/supabase').then(({ supabase }) => 
      supabase
        .from('holidays')
        .select('slug')
        .eq('is_active', true)
        .order('display_order')
    );

    if (data && data.length > 0) {
      return data.map((holiday) => ({
        'holiday-slug': holiday.slug,
      }));
    }
    
    // 如果数据库查询失败，使用常见节日作为后备
    const fallbackHolidays = [
      'summer-sale',
      'winter-sale', 
      'black-friday',
      'cyber-monday',
      'christmas-day',
      'halloween',
      'valentines-day',
      'mothers-day',
      'fathers-day',
      'back-to-school'
    ];
    
    return fallbackHolidays.map((slug) => ({
      'holiday-slug': slug,
    }));
  } catch (error) {
    console.error('Error generating static params for holidays:', error);
    
    // 错误时的后备方案
    const fallbackHolidays = [
      'summer-sale',
      'winter-sale',
      'black-friday', 
      'cyber-monday',
      'christmas-day',
      'halloween',
      'valentines-day',
      'mothers-day', 
      'fathers-day',
      'back-to-school'
    ];
    
    return fallbackHolidays.map((slug) => ({
      'holiday-slug': slug,
    }));
  }
}