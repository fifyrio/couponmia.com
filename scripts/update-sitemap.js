const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Fetch featured stores from database using the same logic as homepage PopularStores component
 * Orders by created_at DESC (newest first), same as getFeaturedStores() in api.ts
 * @param {number} limit - Number of stores to fetch (null = fetch all)
 * @returns {Promise<Array>} - Array of store objects
 */
async function fetchTopFeaturedStores(limit = null) {
  try {
    console.log(`Fetching featured stores from database (same logic as homepage)...`);

    let query = supabase
      .from('stores')
      .select('alias, updated_at, name, active_offers_count')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    // Only apply limit if specified
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }

    console.log(`✓ Fetched ${data.length} featured stores (ordered by created_at DESC)`);

    // Show preview of first 10 stores
    if (data.length > 0) {
      console.log('\nPreview of first 10 stores:');
      data.slice(0, 10).forEach((store, index) => {
        console.log(`  ${index + 1}. ${store.name} (${store.alias}) - ${store.active_offers_count || 0} offers`);
      });
      if (data.length > 10) {
        console.log(`  ... and ${data.length - 10} more stores\n`);
      }
    }

    return data;
  } catch (error) {
    console.error('Exception fetching stores:', error);
    throw error;
  }
}

/**
 * Generate sitemap XML for stores
 * @param {Array} stores - Array of store objects
 * @returns {string} - XML string for stores section
 */
function generateStoresXML(stores) {
  const storeUrls = stores.map(store => {
    // Format last modified date (YYYY-MM-DD)
    const lastmod = store.updated_at
      ? new Date(store.updated_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    return `  <url>
    <loc>https://couponmia.com/store/${store.alias}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  });

  return storeUrls.join('\n');
}

/**
 * Update sitemap.xml with new featured stores
 * @param {Array} stores - Array of store objects
 */
async function updateSitemap(stores) {
  try {
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');

    // Read current sitemap
    console.log('Reading current sitemap...');
    let sitemap = fs.readFileSync(sitemapPath, 'utf-8');

    // Generate new stores XML
    const newStoresXML = generateStoresXML(stores);

    // Define markers for the stores section
    const storesStartMarker = '  <!-- Top Featured Stores -->';
    const storesEndMarker = '  <!-- Store Directory Pages (alphabetical) -->';

    // Find the section to replace
    const startIndex = sitemap.indexOf(storesStartMarker);
    const endIndex = sitemap.indexOf(storesEndMarker);

    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Could not find store section markers in sitemap.xml');
    }

    // Replace the stores section
    const beforeStores = sitemap.substring(0, startIndex + storesStartMarker.length);
    const afterStores = sitemap.substring(endIndex);

    sitemap = beforeStores + '\n' + newStoresXML + '\n\n' + afterStores;

    // Write updated sitemap
    console.log('Writing updated sitemap...');
    fs.writeFileSync(sitemapPath, sitemap, 'utf-8');

    console.log(`✓ Successfully updated sitemap with ${stores.length} featured stores`);
    console.log(`✓ Sitemap saved to: ${sitemapPath}`);
  } catch (error) {
    console.error('Error updating sitemap:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('=== Sitemap Update Script Started ===');
    console.log('Using same data query as homepage Popular Stores module\n');

    // Fetch all featured stores (pass null for no limit, or specify a number)
    // To fetch all stores, don't pass a limit or pass null
    const storeLimit = process.argv[2] ? parseInt(process.argv[2]) : null;
    const stores = await fetchTopFeaturedStores(storeLimit);

    if (stores.length === 0) {
      console.log('⚠ No featured stores found. Skipping sitemap update.');
      return;
    }

    // Update sitemap
    await updateSitemap(stores);

    console.log('\n=== Sitemap Update Completed Successfully ===');
  } catch (error) {
    console.error('\n❌ Sitemap update failed:', error.message);
    process.exit(1);
  }
}

// Run main function if script is executed directly
if (require.main === module) {
  main();
}

module.exports = { fetchTopFeaturedStores, updateSitemap };
