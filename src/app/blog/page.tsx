import { Metadata } from 'next';
import { getRecentPosts } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'CouponMia Blog - Latest Deals, Savings Tips & Shopping Guides',
  description: 'Discover the latest coupon strategies, shopping guides, and money-saving tips from CouponMia experts. Stay updated with the best deals and promotional offers.',
  keywords: 'coupon blog, savings tips, shopping guides, deals, promotional offers, money saving',
  openGraph: {
    title: 'CouponMia Blog - Latest Deals & Savings Tips',
    description: 'Expert advice on coupons, deals, and saving money online',
    type: 'website',
  }
};

export default async function BlogPage() {
  const posts = await getRecentPosts(12);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Homepage Button */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
          >
            ← Homepage
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CouponMia Blog
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your ultimate guide to smart shopping, exclusive deals, and money-saving strategies. 
            Discover expert tips and the latest promotional offers from top retailers.
          </p>
        </div>

        {/* Featured Article */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                Featured Article
              </span>
            </div>
            <Link href="/blog/ultimate-guide-coupon-strategies-maximum-savings" className="group">
              <h2 className="text-3xl font-bold mb-4 group-hover:text-purple-400 transition-colors">
                The Ultimate Guide to Coupon Strategies: Unlock Maximum Savings in 2024
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Master the art of coupon stacking, discover hidden promotional codes, and learn 
                insider secrets that can save you hundreds of dollars every month. This comprehensive 
                guide covers everything from beginner basics to advanced strategies.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>December 15, 2024</span>
                <span>•</span>
                <span>15 min read</span>
                <span>•</span>
                <span>Savings Guide</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <article key={index} className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-colors">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2 hover:text-purple-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {post.date}
                  </p>
                  <Link 
                    href={`/blog/${post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/g, '')}`}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))
          ) : (
            // Placeholder posts when no data available
            Array.from({ length: 6 }).map((_, index) => (
              <article key={index} className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800">
                <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center">
                  <div className="text-gray-500">Coming Soon</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-400">
                    Blog Post Title
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Coming Soon
                  </p>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-4">
              Never Miss a Deal
            </h2>
            <p className="text-gray-300 mb-6">
              Subscribe to our newsletter for exclusive coupon codes, flash sales, and money-saving tips delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-purple-500"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}