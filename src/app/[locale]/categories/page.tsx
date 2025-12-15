import { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@/lib/api';

export const metadata: Metadata = {
  title: 'All Categories - Browse by Category | CouponMia',
  description: 'Browse all coupon categories on CouponMia. Find the best deals and discount codes organized by category including electronics, fashion, travel, and more.',
  keywords: 'categories, coupon categories, deals by category, discount codes, online coupons, shopping categories',
  openGraph: {
    title: 'All Categories - Browse by Category | CouponMia',
    description: 'Browse all coupon categories on CouponMia. Find the best deals and discount codes organized by category.',
    type: 'website',
    url: '/categories',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Categories - Browse by Category | CouponMia',
    description: 'Browse all coupon categories on CouponMia. Find the best deals and discount codes organized by category.',
  },
  alternates: {
    canonical: '/categories',
  },
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <nav className="text-sm text-text-muted mb-4">
            <Link href="/" className="hover:text-brand-light">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary">Categories</span>
          </nav>
          
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-medium to-brand-light rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Browse All Categories
              </h1>
              <p className="text-text-secondary leading-relaxed max-w-2xl mx-auto">
                Discover amazing deals and discount codes organized by category. Find exactly what you&apos;re looking for from our wide selection of stores and brands.
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Shop by Category
          </h2>
          
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}-coupons`}
                  className="bg-card-bg/90 backdrop-blur-sm rounded-xl border border-card-border p-6 hover:border-brand-medium transition-all duration-200 group"
                >
                  <div className="text-center">
                    {/* Category Icon or Image */}
                    {category.image ? (
                      <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={category.image}
                          alt={`${category.name} category`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-brand-medium to-brand-light rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{category.name.charAt(0)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-medium to-brand-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl font-bold text-white">{category.name.charAt(0)}</span>
                      </div>
                    )}
                    
                    {/* Category Info */}
                    <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-brand-medium transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-text-muted text-sm">
                      View deals & coupons
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v16l4-2 4 2V6a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">No Categories Found</h3>
              <p className="text-text-muted">
                Categories are currently being loaded. Please check back later.
              </p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
            Use our search feature to find specific stores, brands, or deals that match your needs.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-medium to-brand-light text-white rounded-lg font-semibold hover:from-brand-light hover:to-brand-medium transition-all duration-200 shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search for Deals
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}