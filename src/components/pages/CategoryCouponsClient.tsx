"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFormatter, useTranslations } from 'next-intl';
import CouponModal from '@/components/ui/CouponModal';
import CategoryFAQ from '@/components/sections/CategoryFAQ';
import { getStoreLogoPlaceholder } from '@/lib/placeholders';

interface Coupon {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  type: 'code' | 'deal';
  discount_value: string;
  description: string;
  url: string;
  expires_at: string | null;
  is_popular: boolean;
  view_count: number;
  store: {
    id: string;
    name: string;
    alias: string;
    logo_url: string;
  };
}

interface Store {
  id: string;
  name: string;
  alias: string;
  logo_url: string;
  description: string;
  website: string;
  rating: number;
  review_count: number;
  active_offers_count: number;
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  created_at: string;
}

interface CategoryStats {
  storeCount: number;
  couponCount: number;
  verifiedCount: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
}

interface CategoryCouponsClientProps {
  category: Category;
  coupons: Coupon[];
  stores: Store[];
  stats: CategoryStats;
  faqs: FAQ[];
}

export default function CategoryCouponsClient({
  category,
  coupons,
  stores,
  stats,
  faqs
}: CategoryCouponsClientProps) {
  const t = useTranslations('categoryPage');
  const couponSectionT = useTranslations('store.couponsSection');
  const formatter = useFormatter();
  const [activeTab, setActiveTab] = useState<'all' | 'coupons' | 'deals'>('all');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCoupons, setShowAllCoupons] = useState(false);
  const [showAllStores, setShowAllStores] = useState(false);
  const categoryNameLower = category.name.toLowerCase();
  const verifiedCount = stats?.verifiedCount ?? Math.floor(coupons.length * 0.8);

  // Filter coupons based on search and tab
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = searchQuery === '' || 
      coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.store.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'coupons' && coupon.code) ||
      (activeTab === 'deals' && !coupon.code);
    
    return matchesSearch && matchesTab;
  });

  const displayedCoupons = showAllCoupons ? filteredCoupons : filteredCoupons.slice(0, 9);
  const displayedStores = showAllStores ? stores : stores.slice(0, 8);

  const formatExpiryDate = (dateString: string | null) => {
    if (!dateString) return couponSectionT('status.noExpiry');
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return couponSectionT('status.onDate', { date: dateString });
    }
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return couponSectionT('status.expired');
    if (diffDays === 0) return couponSectionT('status.today');
    if (diffDays === 1) return couponSectionT('status.tomorrow');
    if (diffDays <= 7) return couponSectionT('status.inDays', { count: diffDays });
    const formattedDate = formatter.dateTime(date, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    return couponSectionT('status.onDate', { date: formattedDate });
  };

  const formatDiscount = (subtitle: string) => {
    if (!subtitle || subtitle === 'other') return couponSectionT('discount.deal');
    if (subtitle.toLowerCase().includes('from 0.00')) return couponSectionT('discount.deal');
    if (/from\s*0(\.0+)?/i.test(subtitle)) return couponSectionT('discount.deal');
    return subtitle.replace(/\.0+(?=\s*%)/g, '');
  };

  const generateViews = (couponId: string) => {
    const hash = couponId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const viewCount = Math.floor(hash % 1500 + 500);
    return viewCount;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category Hero Section */}
      <div className="mb-8">
        <nav className="text-sm text-text-muted mb-4">
          <Link href="/" className="hover:text-brand-light">{t('breadcrumb.home')}</Link>
          <span className="mx-2">/</span>
          <span className="text-text-primary">{t('breadcrumb.current', { categoryName: category.name })}</span>
        </nav>
        
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border overflow-hidden">
          {/* Category Banner Image */}
          {category.image && (
            <div className="relative h-48 sm:h-56 lg:h-64 mb-8">
              <Image
                src={category.image}
                alt={`${category.name} category banner`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-8 right-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-medium to-brand-light rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">{category.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      {t('hero.title', { categoryName: category.name })}
                    </h1>
                    <div className="flex items-center gap-2 text-brand-accent">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-white drop-shadow">
                        {t('hero.ratingLabel', { rating: '4.6' })}
                      </span>
                      <span className="text-white/80 drop-shadow">
                        {t('hero.votesLabel', { count: '5' })}
                      </span>
                      <button className="flex items-center text-white/90 hover:text-brand-accent ml-4 drop-shadow">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {t('hero.rateButton')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Fallback for categories without images */}
          {!category.image && (
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-medium to-brand-light rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{category.name.charAt(0)}</span>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
                    {t('hero.title', { categoryName: category.name })}
                  </h1>
                  <div className="flex items-center gap-2 text-brand-accent">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">{t('hero.ratingLabel', { rating: '4.6' })}</span>
                    <span className="text-text-muted">{t('hero.votesLabel', { count: '5' })}</span>
                    <button className="flex items-center text-text-secondary hover:text-brand-light ml-4">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {t('hero.rateButton')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats and Description Section */}
          <div className={category.image ? 'px-8 pb-8' : 'p-8 pt-0'}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">{formatter.number(stats.couponCount)}</div>
                  <div className="text-text-muted">{t('hero.stats.topDeals')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">{formatter.number(verifiedCount)}</div>
                  <div className="text-text-muted">{t('hero.stats.verified')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">{formatter.number(stats.storeCount)}</div>
                  <div className="text-text-muted">{t('hero.stats.stores')}</div>
                </div>
              </div>

            <p className="text-text-secondary leading-relaxed">
              {t('hero.description', {
                storeCount: formatter.number(stats.storeCount),
                categoryNameLower,
                dealCount: formatter.number(coupons.length)
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-card-border rounded-lg bg-background text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-medium focus:border-transparent"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-background/50 border border-card-border rounded-lg p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-brand-medium text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t('tabs.all', { count: coupons.length })}
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === 'coupons'
                  ? 'bg-brand-medium text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t('tabs.coupons', { count: coupons.filter(c => c.code).length })}
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === 'deals'
                  ? 'bg-brand-medium text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t('tabs.deals', { count: coupons.filter(c => !c.code).length })}
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Stores */}
      {stores.length > 0 && (
        <div className="mb-8">
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">{t('stores.title')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {displayedStores.map((store) => (
                <Link
                  key={store.id}
                  href={`/store/${store.alias}`}
                  className="group text-center"
                >
                  <div className="relative mb-2">
                    <Image
                      src={store.logo_url || getStoreLogoPlaceholder()}
                      alt={`${store.name} logo`}
                      width={60}
                      height={60}
                      className="mx-auto rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                    />
                  </div>
                  <span className="text-sm text-text-secondary group-hover:text-brand-light transition-colors line-clamp-2">
                    {store.name}
                  </span>
                </Link>
              ))}
            </div>
            {stores.length > 8 && !showAllStores && (
              <button
                onClick={() => setShowAllStores(true)}
                className="mt-4 text-brand-medium hover:text-brand-light font-medium"
              >
                {t('stores.showMore')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Coupons Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {t('couponsSection.title', { categoryName: category.name })}
        </h2>
        <div className="space-y-4">
          {displayedCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-card-bg/90 backdrop-blur-sm rounded-xl border border-card-border p-6 hover:border-brand-medium transition-all duration-200 group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Store Logo and Info */}
                <div className="flex items-center gap-4 flex-1">
                  <Image
                    src={coupon.store.logo_url || getStoreLogoPlaceholder()}
                    alt={`${coupon.store.name} logo`}
                    width={48}
                    height={48}
                    className="rounded-lg shadow-sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary">{coupon.title}</h3>
                      {coupon.is_popular && (
                        <span className="bg-brand-accent text-black text-xs font-medium px-2 py-1 rounded">
                          {t('couponsSection.verified')}
                        </span>
                      )}
                    </div>
                    <p className="text-text-secondary text-sm mb-2">{formatDiscount(coupon.subtitle)}</p>
                    <Link 
                      href={`/store/${coupon.store.alias}`}
                      className="text-brand-medium hover:text-brand-light text-sm font-medium"
                    >
                      {t('couponsSection.viewAll', { storeName: coupon.store.name })}
                    </Link>
                  </div>
                </div>

                {/* Coupon Action */}
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-text-muted">
                    <div>{t('couponsSection.usedBy', { count: formatter.number(generateViews(coupon.id)) })}</div>
                    <div>{formatExpiryDate(coupon.expires_at)}</div>
                  </div>
                  <button
                    onClick={() => setSelectedCoupon(coupon)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      coupon.code
                        ? 'bg-brand-medium hover:bg-brand-light text-white'
                        : 'bg-brand-accent hover:bg-yellow-400 text-black'
                    }`}
                  >
                    {coupon.code ? t('couponsSection.buttons.showCode') : t('couponsSection.buttons.getDeal')}
                  </button>
                </div>
              </div>

              {/* Show Details Button */}
              <div className="mt-4 pt-4 border-t border-card-border">
                <button className="text-brand-medium hover:text-brand-light font-medium text-sm">
                  {t('couponsSection.showDetails')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {filteredCoupons.length > 9 && !showAllCoupons && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAllCoupons(true)}
              className="bg-brand-medium hover:bg-brand-light text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
            >
              {t('couponsSection.showMore')}
            </button>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <CategoryFAQ 
        categoryName={category.name}
        faqs={faqs}
      />

      {/* Coupon Modal */}
      <CouponModal
        coupon={selectedCoupon ? {
          id: parseInt(selectedCoupon.id),
          title: selectedCoupon.title,
          subtitle: selectedCoupon.subtitle,
          code: selectedCoupon.code || null,
          type: selectedCoupon.type,
          discount: formatDiscount(selectedCoupon.subtitle),
          description: selectedCoupon.description,
          expiresAt: selectedCoupon.expires_at || '',
          isPopular: selectedCoupon.is_popular,
          minSpend: null,
          url: selectedCoupon.url
        } : null}
        storeName={selectedCoupon?.store.name || ''}
        onClose={() => setSelectedCoupon(null)}
      />
    </div>
  );
}
