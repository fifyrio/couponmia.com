import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import CategoryCouponsClient from '@/components/pages/CategoryCouponsClient';
import { getCategoryBySlug, getCouponsByCategory, getCategoryStats, getStoresByCategory, getCategoryFAQs } from '@/lib/api';
import { metadataCache } from '@/lib/cache';

// Force dynamic rendering to avoid stale data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ categorySlug: string }>;
}


// Generate metadata for the category page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;

  // Check cache first
  const cacheKey = `metadata:category:${categorySlug}`;
  const cachedMetadata = metadataCache.get(cacheKey);

  if (cachedMetadata !== null) {
    return cachedMetadata;
  }

  // Remove '-coupons' suffix for category lookup
  const cleanCategorySlug = categorySlug.replace(/-coupons$/, '');
  const category = await getCategoryBySlug(cleanCategorySlug);
  const stats = await getCategoryStats(cleanCategorySlug);

  if (!category) {
    const notFoundMetadata = {
      title: 'Category Not Found - CouponMia',
      description: 'The requested category could not be found.'
    };
    metadataCache.set(cacheKey, notFoundMetadata);
    return notFoundMetadata;
  }

  const categoryName = category.name;
  const title = `${categoryName} Coupons & Deals - ${stats.couponCount}+ Verified Offers | CouponMia`;
  const description = `Save money with ${stats.couponCount}+ verified ${categoryName.toLowerCase()} coupons and deals. Find the best discounts from ${stats.storeCount}+ top ${categoryName.toLowerCase()} stores. Updated daily.`;

  const metadata: Metadata = {
    title,
    description,
    keywords: [
      `${categoryName.toLowerCase()} coupons`,
      `${categoryName.toLowerCase()} deals`,
      `${categoryName.toLowerCase()} discounts`,
      `${categoryName.toLowerCase()} promo codes`,
      'coupon codes',
      'online deals',
      'savings'
    ].join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/categories/${categorySlug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/categories/${categorySlug}`,
    },
  };

  // Cache the metadata
  metadataCache.set(cacheKey, metadata);

  return metadata;
}

export default async function CategoryCouponsPage({ params }: Props) {
  const { categorySlug } = await params;
  
  // Remove '-coupons' suffix for category lookup
  const cleanCategorySlug = categorySlug.replace(/-coupons$/, '');
  
  // Fetch category data
  const category = await getCategoryBySlug(cleanCategorySlug);
  
  if (!category) {
    notFound();
  }

  // Fetch all required data
  const [coupons, stats, stores, faqs] = await Promise.all([
    getCouponsByCategory(cleanCategorySlug, 100),
    getCategoryStats(cleanCategorySlug),
    getStoresByCategory(cleanCategorySlug, 20),
    getCategoryFAQs(category.id)
  ]);

  // Transform coupon data to match the expected format
  const transformedCoupons = coupons.map((coupon) => ({
    id: coupon.id,
    title: coupon.title,
    subtitle: coupon.subtitle,
    code: coupon.code || '',
    type: coupon.type,
    discount_value: coupon.discount_value,
    description: coupon.description,
    url: coupon.url,
    expires_at: coupon.expires_at,
    is_popular: coupon.is_popular,
    view_count: coupon.view_count || 0,
    store: {
      id: coupon.store?.id,
      name: coupon.store?.name || 'Unknown Store',
      alias: coupon.store?.alias || '',
      logo_url: coupon.store?.logo_url || ''
    }
  }));

  // Transform store data
  const transformedStores = stores.map((store) => ({
    id: store.id,
    name: store.name,
    alias: store.alias,
    logo_url: store.logo_url || '',
    description: store.description || '',
    website: store.website || '',
    rating: store.rating || 0,
    review_count: store.review_count || 0,
    active_offers_count: store.active_offers_count || 0,
    is_featured: store.is_featured
  }));

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <CategoryCouponsClient 
        category={category}
        coupons={transformedCoupons}
        stores={transformedStores}
        stats={stats}
        faqs={faqs}
      />
      <Footer />
    </div>
  );
}