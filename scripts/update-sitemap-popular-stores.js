#!/usr/bin/env node

/**
 * Update Sitemap Popular Stores Script
 * 
 * This script fetches the top 5 featured stores using the same logic as the homepage:
 * - Queries stores with is_featured = true
 * - Orders by created_at (descending)
 * - Takes the top 5 stores
 * 
 * Then updates the sitemap.xml with these featured stores.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

class SitemapPopularStoresUpdater {
  constructor() {
    this.sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    this.topStoresCount = 5;
  }

  // Note: Removed calculateStoreScore function as we now use the same logic as homepage
  // which simply queries featured stores ordered by created_at

  // Get top popular stores from database - using same logic as homepage
  async getTopPopularStores() {
    console.log('📊 Fetching featured stores from database (same as homepage)...');
    
    try {
      // Use the same logic as getFeaturedStores() in api.ts
      const { data: stores, error } = await supabase
        .from('stores')
        .select(`
          id,
          name,
          alias,
          is_featured,
          active_offers_count,
          rating,
          review_count,
          created_at
        `)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(20); // Get more than needed to have options

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!stores || stores.length === 0) {
        throw new Error('No featured stores found in database');
      }

      console.log(`Found ${stores.length} featured stores in database`);

      // Take top 5 from featured stores (same as homepage logic)
      const topStores = stores.slice(0, this.topStoresCount);

      console.log('\n🏆 Top 5 Popular Stores (Featured Stores):');
      topStores.forEach((store, index) => {
        console.log(`${index + 1}. ${store.name} (${store.alias})`);
        console.log(`   Featured: ${store.is_featured}, Offers: ${store.active_offers_count}, Rating: ${store.rating}`);
      });

      return topStores;
    } catch (error) {
      console.error('❌ Error fetching featured stores:', error);
      throw error;
    }
  }

  // Read current sitemap.xml
  readSitemap() {
    try {
      const sitemapContent = fs.readFileSync(this.sitemapPath, 'utf8');
      return sitemapContent;
    } catch (error) {
      console.error('❌ Error reading sitemap.xml:', error);
      throw error;
    }
  }

  // Update sitemap.xml with new top stores
  updateSitemap(sitemapContent, topStores) {
    console.log('\n📝 Updating sitemap.xml with new top stores...');
    
    // Find the position after the main pages section
    const mainPagesEnd = sitemapContent.indexOf('  <!-- Blog Posts -->');
    
    if (mainPagesEnd === -1) {
      throw new Error('Could not find main pages section in sitemap.xml');
    }

    // Generate new top stores XML
    const today = new Date().toISOString().split('T')[0];
    const topStoresXml = topStores.map(store => 
      `  <url>
    <loc>https://couponmia.com/store/${store.alias}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    ).join('\n\n');

    // Replace the old top stores section with new one
    const topStoresStart = sitemapContent.indexOf('  <!-- Top 5 Popular Stores -->');
    const topStoresEnd = sitemapContent.indexOf('  <!-- Blog Posts -->');
    
    if (topStoresStart === -1 || topStoresEnd === -1) {
      throw new Error('Could not find top stores section in sitemap.xml');
    }

    const beforeTopStores = sitemapContent.substring(0, topStoresStart);
    const afterTopStores = sitemapContent.substring(topStoresEnd);
    
    const newSitemapContent = beforeTopStores + 
      `  <!-- Top 5 Popular Stores -->
${topStoresXml}

` + afterTopStores;

    return newSitemapContent;
  }

  // Write updated sitemap to file
  writeSitemap(sitemapContent) {
    try {
      // Create backup
      const backupPath = this.sitemapPath + '.backup';
      fs.copyFileSync(this.sitemapPath, backupPath);
      console.log(`💾 Created backup: ${backupPath}`);

      // Write new sitemap
      fs.writeFileSync(this.sitemapPath, sitemapContent, 'utf8');
      console.log('✅ Successfully updated sitemap.xml');
    } catch (error) {
      console.error('❌ Error writing sitemap.xml:', error);
      throw error;
    }
  }

  // Main execution function
  async run() {
    console.log('🚀 Starting Sitemap Popular Stores Update...');
    console.log('='.repeat(60));
    
    const startTime = Date.now();
    
    try {
      // 1. Get top popular stores from database
      const topStores = await this.getTopPopularStores();
      
      // 2. Read current sitemap
      const currentSitemap = this.readSitemap();
      
      // 3. Update sitemap with new top stores
      const updatedSitemap = this.updateSitemap(currentSitemap, topStores);
      
      // 4. Write updated sitemap
      this.writeSitemap(updatedSitemap);
      
      const duration = (Date.now() - startTime) / 1000;
      console.log(`\n🎉 Sitemap update completed successfully in ${duration.toFixed(2)}s`);
      
      return {
        success: true,
        topStores: topStores.map(store => ({
          name: store.name,
          alias: store.alias,
          score: store.popularityScore
        })),
        duration
      };
    } catch (error) {
      console.error('❌ Sitemap update failed:', error);
      throw error;
    }
  }
}

// Handle script execution
async function main() {
  const updater = new SitemapPopularStoresUpdater();
  
  try {
    await updater.run();
  } catch (error) {
    console.error('❌ Unexpected error during sitemap update:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = SitemapPopularStoresUpdater;
