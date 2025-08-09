#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const blogPosts = [
  {
    title: 'The Ultimate Guide to Coupon Strategies: Unlock Maximum Savings in 2024',
    slug: 'ultimate-guide-coupon-strategies-maximum-savings',
    excerpt: 'Master the art of coupon stacking, discover hidden promotional codes, and learn insider secrets that can save you hundreds of dollars every month.',
    featured_image_url: '/api/placeholder/1200/630',
    author_name: 'CouponMia Editorial Team',
    is_published: true,
    published_at: new Date('2024-12-15T10:00:00Z').toISOString()
  },
  {
    title: 'Top 10 Cashback Apps That Actually Pay in 2024 - Tested & Reviewed',
    slug: 'top-10-cashback-apps-that-actually-pay',
    excerpt: 'We tested dozens of cashback apps to find the ones that actually deliver on their promises. Here are the top 10 that consistently pay real money.',
    featured_image_url: '/api/placeholder/1200/630',
    author_name: 'CouponMia Editorial Team',
    is_published: true,
    published_at: new Date('2024-12-12T10:00:00Z').toISOString()
  },
  {
    title: 'Black Friday Strategy Guide 2024: Plan Your Shopping Like a Pro',
    slug: 'black-friday-strategy-guide-2024',
    excerpt: 'Get ahead of the Black Friday rush with our comprehensive planning guide. Learn when to shop, which deals are worth it, and how to avoid common pitfalls.',
    featured_image_url: '/api/placeholder/1200/630',
    author_name: 'Sarah Mitchell',
    is_published: true,
    published_at: new Date('2024-11-20T10:00:00Z').toISOString()
  },
  {
    title: 'How to Stack Coupons Like a Pro: Advanced Techniques for 2024',
    slug: 'how-to-stack-coupons-like-a-pro',
    excerpt: 'Learn the art and science of coupon stacking. Discover which stores allow it, how to combine different types of discounts, and maximize your savings potential.',
    featured_image_url: '/api/placeholder/1200/630',
    author_name: 'Mike Rodriguez',
    is_published: true,
    published_at: new Date('2024-12-08T10:00:00Z').toISOString()
  },
  {
    title: 'Browser Extensions Every Smart Shopper Needs in 2024',
    slug: 'browser-extensions-every-smart-shopper-needs',
    excerpt: 'Discover the essential browser extensions that automatically find coupons, compare prices, and track deals so you never miss a savings opportunity.',
    featured_image_url: '/api/placeholder/1200/630',
    author_name: 'Jessica Chen',
    is_published: true,
    published_at: new Date('2024-12-05T10:00:00Z').toISOString()
  },
  {
    title: 'Holiday Shopping Calendar: When to Buy Everything for Maximum Savings',
    slug: 'holiday-shopping-calendar-when-to-buy-everything',
    excerpt: 'Time your holiday purchases perfectly with our month-by-month guide to seasonal sales, clearance events, and the best times to buy specific items.',
    featured_image_url: '/api/placeholder/1200/630',
    author_name: 'David Park',
    is_published: true,
    published_at: new Date('2024-11-15T10:00:00Z').toISOString()
  }
];

async function populateBlogData() {
  try {
    console.log('🚀 Starting blog data population...');
    
    // Clear existing blog posts (optional)
    console.log('📝 Clearing existing blog posts...');
    await supabase.from('blog_posts').delete().neq('id', 0);
    
    // Insert new blog posts
    console.log('📝 Inserting blog posts...');
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(blogPosts)
      .select();
    
    if (error) {
      console.error('❌ Error inserting blog posts:', error);
      return;
    }
    
    console.log(`✅ Successfully inserted ${data.length} blog posts`);
    
    // Display inserted posts
    console.log('\n📚 Inserted blog posts:');
    data.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   - Slug: ${post.slug}`);
      console.log(`   - Published: ${new Date(post.published_at).toLocaleDateString()}`);
      console.log(`   - Author: ${post.author_name}\n`);
    });
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
populateBlogData();