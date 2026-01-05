import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import StoreDetailClient from '@/components/pages/StoreDetailClient';
import { getStoreByAlias, getStoreCoupons, getSimilarStores, getStoreFAQs, getFeaturedStores } from '@/lib/api';
import { metadataCache } from '@/lib/cache';
import { unstable_cache } from 'next/cache';

// Interface for transformed coupon data used in getBestOffer
interface TransformedCoupon {
  subtitle: string;
}

// Enable Incremental Static Regeneration (ISR) with 1-hour revalidation
export const revalidate = 60; // Revalidate every 60 seconds

interface Props {
  params: Promise<{ locale: string; storeAlias: string }>;
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

// Core fetcher for store data
async function fetchStoreData(storeAlias: string) {
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
    screenshot: store.screenshot || null,
    faq_image: store.faq_image || null,
    best_offer: getBestOffer(transformedCoupons), // Extract best offer from coupons
    discount_analysis: store.discount_analysis,
    coupons: transformedCoupons,
    similarStores: similarStores,
    faq: transformedFAQs
  };
}

// Cache store data with ISR-friendly keys and tags
const getStoreData = (storeAlias: string) =>
  unstable_cache(
    () => fetchStoreData(storeAlias),
    ['store-data', storeAlias],
    {
      revalidate: 3600,
      tags: [`store:${storeAlias}`],
    }
  )();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeAlias, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.storePage' });

  // Check cache first (2 hour TTL for metadata)
  const cacheKey = `metadata:store:${locale}:${storeAlias}`;
  const cachedMetadata = metadataCache.get(cacheKey);

  if (cachedMetadata !== null) {
    return cachedMetadata;
  }

  const store = await getStoreData(storeAlias);

  if (!store) {
    const notFoundMetadata = {
      title: t('notFoundTitle'),
      description: t('notFoundDescription')
    };
    // Cache not found metadata for shorter time
    metadataCache.set(cacheKey, notFoundMetadata);
    return notFoundMetadata;
  }

  const currentDate = getCurrentDateInfo();
  const descriptionSnippet = store.description
    ? `${store.description.substring(0, 120)}...`
    : '';
  const seoTitle = t('title', {
    bestOffer: store.best_offer,
    storeName: store.name,
    month: currentDate.month,
    year: currentDate.year
  });
  const seoDescription = t('description', {
    storeName: store.name,
    activeOffers: store.activeOffers,
    storeDescription: descriptionSnippet
  });
  const localePrefix = locale === 'en' ? '' : `/${locale}`;
  const pageUrl = `https://couponmia.com${localePrefix}/store/${storeAlias}`;

  const metadata: Metadata = {
    title: seoTitle,
    description: seoDescription,
    keywords: t('keywords').split(',').map(keyword => keyword.trim()),
    alternates: {
      canonical: pageUrl
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: pageUrl,
      type: 'website',
      ...(store.screenshot && {
        images: [
          {
            url: store.screenshot,
            width: 1200,
            height: 630,
            alt: `${store.name} website preview`
          }
        ]
      })
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      ...(store.screenshot && {
        images: [store.screenshot]
      })
    }
  };

  // Cache the metadata
  metadataCache.set(cacheKey, metadata);

  return metadata;
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
    // Fetch all featured stores for static generation at build time
    // This pre-renders popular store pages for optimal performance
    const stores = await getFeaturedStores(200);
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
