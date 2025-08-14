import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import StoreDetailClient from '@/components/pages/StoreDetailClient';
import { getStoreByAlias, getStoreCoupons, getSimilarStores, getStoreFAQs, getFeaturedStores } from '@/lib/api';

// Interface for transformed coupon data used in getBestOffer
interface TransformedCoupon {
  subtitle: string;
}

// Force dynamic rendering to avoid stale data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ storeAlias: string }>;
}

// Helper function to get current date information
function getCurrentDateInfo() {
  const now = new Date();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return {
    month: months[now.getMonth()],
    year: now.getFullYear().toString()
  };
}

// Helper function to extract best offer from coupons
function getBestOffer(coupons: TransformedCoupon[]) {
  if (!coupons || coupons.length === 0) return 'Up to 70% Off';
  
  // Priority order: look for percentage discounts, dollar amounts, then generic terms
  const percentageOffers = coupons.filter(c => 
    c.subtitle && c.subtitle.match(/\d+%\s*off/i)
  ).sort((a, b) => {
    const aPercent = parseInt(a.subtitle.match(/(\d+)%/)?.[1] || '0');
    const bPercent = parseInt(b.subtitle.match(/(\d+)%/)?.[1] || '0');
    return bPercent - aPercent; // Descending order
  });
  
  if (percentageOffers.length > 0) {
    const bestPercent = percentageOffers[0].subtitle;
    return bestPercent.charAt(0).toUpperCase() + bestPercent.slice(1);
  }
  
  // Look for dollar amounts
  const dollarOffers = coupons.filter(c => 
    c.subtitle && c.subtitle.match(/\$\d+\s*off/i)
  ).sort((a, b) => {
    const aDollar = parseInt(a.subtitle.match(/\$(\d+)/)?.[1] || '0');
    const bDollar = parseInt(b.subtitle.match(/\$(\d+)/)?.[1] || '0');
    return bDollar - aDollar; // Descending order
  });
  
  if (dollarOffers.length > 0) {
    const bestDollar = dollarOffers[0].subtitle;
    return bestDollar.charAt(0).toUpperCase() + bestDollar.slice(1);
  }
  
  // Look for special offers
  const specialOffers = coupons.filter(c => 
    c.subtitle && (c.subtitle.includes('free shipping') || c.subtitle.includes('bogo'))
  );
  
  if (specialOffers.length > 0) {
    const special = specialOffers[0].subtitle;
    return special.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  
  // Default fallback
  return 'Up to 70% Off';
}

// Helper function to transform database data to client format
async function getStoreData(storeAlias: string) {
  const store = await getStoreByAlias(storeAlias);
  
  if (!store) {
    return null;
  }

  // Fetch related data in parallel
  const [coupons, similarStores, faqs] = await Promise.all([
    getStoreCoupons(store.id),
    getSimilarStores(store.id),
    getStoreFAQs(store.id)
  ]);

  // Transform coupon data to match client interface
  const transformedCoupons = coupons.map(coupon => ({
    id: parseInt(coupon.id),
    title: coupon.title,
    subtitle: coupon.subtitle,
    code: coupon.code || null,
    type: coupon.type,
    discount: coupon.discount_value,
    description: coupon.description,
    expiresAt: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : 'No expiry',
    isPopular: coupon.is_popular,
    minSpend: coupon.min_spend || null,
    url: coupon.url
  }));

  // Transform FAQ data
  const transformedFAQs = faqs.map(faq => ({
    question: faq.question,
    answer: faq.answer
  }));

  return {
    id: store.id, // Add store ID for cashback tracking
    name: store.name,
    logo_url: store.logo_url,
    description: store.description,
    rating: store.rating,
    reviewCount: store.review_count,
    activeOffers: store.active_offers_count,
    category: store.category,
    website: store.website,
    url: store.url,
    established: '2018', // This could be added to the database schema later
    headquarters: 'Seoul, South Korea', // This could be added to the database schema later
    best_offer: getBestOffer(transformedCoupons), // Extract best offer from coupons
    coupons: transformedCoupons,
    similarStores: similarStores,
    faq: transformedFAQs
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeAlias } = await params;
  const store = await getStoreData(storeAlias);
  
  if (!store) {
    return {
      title: 'Store Not Found - CouponMia',
      description: 'The store you are looking for could not be found.'
    };
  }

  const currentDate = getCurrentDateInfo();
  const seoTitle = `${store.best_offer} ${store.name} Promo Codes & Discounts for ${currentDate.month} ${currentDate.year}`;

  return {
    title: seoTitle,
    description: `Get the latest ${store.name} coupon codes and discounts. Save money with ${store.activeOffers} verified promo codes and deals. ${store.description.substring(0, 120)}...`,
    alternates: {
      canonical: `https://couponmia.com/store/${storeAlias}`
    },
    openGraph: {
      title: seoTitle,
      description: `Get the latest ${store.name} coupon codes and discounts. Save money with ${store.activeOffers} verified promo codes and deals.`,
      url: `https://couponmia.com/store/${storeAlias}`,
      type: 'website'
    }
  };
}

export default async function StoreDetailPage({ params }: Props) {
  const { storeAlias } = await params;
  const store = await getStoreData(storeAlias);

  if (!store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text-primary mb-4">Store Not Found</h1>
            <p className="text-text-secondary">The store you are looking for could not be found.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-text-secondary">
            <li><Link href="/" className="hover:text-brand-light transition-colors">Home</Link></li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <Link href="/stores/startwith/a" className="hover:text-brand-light transition-colors">All Stores</Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-text-primary font-medium">{store.name}</span>
            </li>
          </ol>
        </nav>

        {/* Store Detail Client Component */}
        <StoreDetailClient store={store} />
      </main>
      
      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  try {
    // Fetch featured stores for static generation
    const stores = await getFeaturedStores(10);
    return stores.map(store => ({
      storeAlias: store.alias
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    // Fallback to at least one store
    return [
      { storeAlias: 'buybeautykorea' }
    ];
  }
}