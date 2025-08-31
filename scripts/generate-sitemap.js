#!/usr/bin/env node

/**
 * Dynamic Sitemap Generator for CouponMia
 * 
 * This script generates a comprehensive sitemap.xml file that includes:
 * - Static pages (homepage, blog, holidays)
 * - Dynamic category pages from database
 * - Store pages (top featured stores)
 * - Store directory pages (alphabetical)
 * 
 * Usage: node scripts/generate-sitemap.js
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuration
const DOMAIN = 'https://couponmia.com';
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Generate XML entry for a URL
 */
function generateUrlEntry(url, lastmod, changefreq = 'weekly', priority = '0.5') {
  return `  <url>
    <loc>${DOMAIN}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * Get all categories from database
 */
async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('slug, name, created_at')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception getting categories:', error);
    return [];
  }
}

/**
 * Get top featured stores
 */
async function getFeaturedStores(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('alias, name, created_at')
      .eq('is_featured', true)
      .order('active_offers_count', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching featured stores:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception getting featured stores:', error);
    return [];
  }
}

/**
 * Generate complete sitemap XML
 */
async function generateSitemap() {
  console.log('🗺️  Generating dynamic sitemap.xml...');
  
  const currentDate = getCurrentDate();
  const categories = await getCategories();
  const featuredStores = await getFeaturedStores(10);
  
  console.log(`📊 Found ${categories.length} categories`);
  console.log(`🏪 Found ${featuredStores.length} featured stores`);
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
${generateUrlEntry('/', currentDate, 'daily', '1.0')}

  <!-- Main Pages -->
${generateUrlEntry('/blog', currentDate, 'weekly', '0.8')}
${generateUrlEntry('/holidays', currentDate, 'weekly', '0.8')}
${generateUrlEntry('/categories', currentDate, 'weekly', '0.8')}

  <!-- Category Pages -->`;

  // Add category pages
  for (const category of categories) {
    sitemap += '\n' + generateUrlEntry(`/categories/${category.slug}`, currentDate, 'weekly', '0.7');
  }

  sitemap += `\n
  <!-- Top Featured Stores -->`;

  // Add featured store pages
  for (const store of featuredStores) {
    sitemap += '\n' + generateUrlEntry(`/store/${store.alias}`, currentDate, 'weekly', '0.9');
  }

  sitemap += `\n
  <!-- Store Directory Pages (alphabetical) -->`;

  // Add alphabetical store directory pages
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  for (const letter of letters) {
    sitemap += '\n' + generateUrlEntry(`/stores/startwith/${letter}`, currentDate, 'weekly', '0.7');
  }
  sitemap += '\n' + generateUrlEntry('/stores/startwith/other', currentDate, 'weekly', '0.7');

  sitemap += `\n
</urlset>`;

  // Write sitemap to file
  await fs.writeFile(SITEMAP_PATH, sitemap, 'utf8');
  
  const urlCount = (sitemap.match(/<loc>/g) || []).length;
  console.log(`✅ Generated sitemap.xml with ${urlCount} URLs`);
  console.log(`📍 Saved to: ${SITEMAP_PATH}`);
  
  return urlCount;
}

/**
 * Main execution
 */
async function main() {
  try {
    const urlCount = await generateSitemap();
    
    console.log('\n🎉 Sitemap generation completed successfully!');
    console.log(`📈 Total URLs: ${urlCount}`);
    console.log('💡 Remember to submit the updated sitemap to Google Search Console');
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateSitemap };