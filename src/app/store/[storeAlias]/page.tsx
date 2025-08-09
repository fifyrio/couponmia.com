import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import StoreDetailClient from '@/components/pages/StoreDetailClient';
import { getStoreByAlias, getStoreCoupons, getSimilarStores, getStoreFAQs, getFeaturedStores } from '@/lib/api';

interface Props {
  params: Promise<{ storeAlias: string }>;
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
    minSpend: coupon.min_spend || null
  }));

  // Transform FAQ data
  const transformedFAQs = faqs.map(faq => ({
    question: faq.question,
    answer: faq.answer
  }));

  return {
    name: store.name,
    logo_url: store.logo_url,
    description: store.description,
    rating: store.rating,
    reviewCount: store.review_count,
    activeOffers: store.active_offers_count,
    categories: store.categories,
    website: store.website,
    established: '2018', // This could be added to the database schema later
    headquarters: 'Seoul, South Korea', // This could be added to the database schema later
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

  return {
    title: `${store.name} Coupons & Promo Codes - Save Up to ${store.coupons[0]?.discount || '50%'} | CouponMia`,
    description: `Get the latest ${store.name} coupon codes and discounts. Save money with ${store.activeOffers} verified promo codes and deals. ${store.description.substring(0, 120)}...`,
    alternates: {
      canonical: `https://couponmia.com/store/${storeAlias}`
    },
    openGraph: {
      title: `${store.name} Coupons & Promo Codes - Save Up to ${store.coupons[0]?.discount || '50%'} | CouponMia`,
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