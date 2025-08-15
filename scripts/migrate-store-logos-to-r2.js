#!/usr/bin/env node

/**
 * Store Logo Migration Script
 * 
 * This script migrates store logos to Cloudflare R2:
 * 1. Finds stores with logo_url not starting with R2 domains
 * 2. Downloads logos to temp directory
 * 3. Uploads to Cloudflare R2
 * 4. Updates database with new R2 URLs
 * 
 * Automatically skips logos already hosted on:
 * - R2_ENDPOINT (from environment variable)
 * - https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev (hardcoded R2 domain)
 * 
 * Usage:
 * node scripts/migrate-store-logos-to-r2.js [options]
 * 
 * Options:
 * --limit N     Process only N stores (default: all)
 * --dry-run     Show what would be processed without making changes
 * --force       Re-process logos even if they're already on R2
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

// AWS SDK for R2 (Cloudflare R2 is S3-compatible)
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

// Environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const R2_ENDPOINT = process.env.R2_ENDPOINT || '';
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

// Script configuration
const TEMP_DIR = path.join(__dirname, '../temp/logos');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
const TIMEOUT = 30000; // 30 seconds

// Initialize clients
let supabase;
let r2Client;

/**
 * Validate environment variables
 */
function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  // Initialize clients
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  console.log('✅ Environment validated');
}

/**
 * Parse command line arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    limit: null,
    dryRun: false,
    force: false,
    storeName: null
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--limit':
        options.limit = parseInt(args[++i]) || null;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--store':
        options.storeName = args[++i];
        break;
      case '--help':
        console.log(`
Store Logo Migration Script

Usage: node scripts/migrate-store-logos-to-r2.js [options]

Options:
  --limit N       Process only N stores (default: all)
  --store NAME    Process only specific store by name or alias
  --dry-run       Show what would be processed without making changes
  --force         Re-process logos even if they're already on R2
  --help          Show this help message

The script automatically skips logos already on R2 domains:
- R2_ENDPOINT (from environment variable)
- https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev

Examples:
  node scripts/migrate-store-logos-to-r2.js --dry-run
  node scripts/migrate-store-logos-to-r2.js --limit 10
  node scripts/migrate-store-logos-to-r2.js --store "amazon"
  node scripts/migrate-store-logos-to-r2.js --force
        `);
        process.exit(0);
    }
  }

  return options;
}

/**
 * Get stores with non-R2 logos
 */
async function getStoresToMigrate(options) {
  console.log('📋 Fetching stores to migrate...');
  
  let query = supabase
    .from('stores')
    .select('id, name, alias, logo_url')
    .not('logo_url', 'is', null)
    .neq('logo_url', '');

  // Filter by store name if specified
  if (options.storeName) {
    query = query.or(`name.ilike.%${options.storeName}%,alias.ilike.%${options.storeName}%`);
    console.log(`🔍 Filtering for store: ${options.storeName}`);
  }

  // Filter out R2 URLs unless force flag is used
  if (!options.force) {
    // Skip URLs that start with R2_ENDPOINT or the hardcoded R2 domain
    if (R2_ENDPOINT) {
      query = query.not('logo_url', 'like', `${R2_ENDPOINT}%`);
    }
    // Also skip the hardcoded R2 domain
    query = query.not('logo_url', 'like', 'https://pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev%');
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data: stores, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch stores: ${error.message}`);
  }

  if (options.storeName && stores.length === 0) {
    throw new Error(`No stores found matching: ${options.storeName}`);
  }

  console.log(`📊 Found ${stores.length} stores to process`);
  return stores;
}

/**
 * Create temp directory
 */
async function ensureTempDirectory() {
  try {
    await fs.access(TEMP_DIR);
  } catch {
    await fs.mkdir(TEMP_DIR, { recursive: true });
    console.log(`📁 Created temp directory: ${TEMP_DIR}`);
  }
}

/**
 * Download image from URL
 */
async function downloadImage(url, filepath, forceHttp = false) {
  return new Promise((resolve, reject) => {
    // Convert HTTP URLs to HTTPS for better security, unless forceHttp is true
    let downloadUrl = url;
    if (url.startsWith('http://') && !forceHttp) {
      downloadUrl = url.replace('http://', 'https://');
      console.log(`   🔄 Converting HTTP to HTTPS: ${downloadUrl}`);
    }

    const timeout = setTimeout(() => {
      reject(new Error(`Download timeout after ${TIMEOUT}ms`));
    }, TIMEOUT);

    // Choose appropriate module based on protocol
    const isHttps = downloadUrl.startsWith('https://');
    const httpModule = isHttps ? https : http;

    const request = httpModule.get(downloadUrl, { timeout: TIMEOUT }, (response) => {
      clearTimeout(timeout);

      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`   🔄 Following redirect to: ${response.headers.location}`);
        return downloadImage(response.headers.location, filepath, forceHttp).then(resolve).catch(reject);
      }

      // Check response status
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      // Check content type
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        reject(new Error(`Invalid content type: ${contentType}`));
        return;
      }

      // Check file size
      const contentLength = parseInt(response.headers['content-length'] || '0');
      if (contentLength > MAX_FILE_SIZE) {
        reject(new Error(`File too large: ${contentLength} bytes`));
        return;
      }

      const file = require('fs').createWriteStream(filepath);
      let downloadedBytes = 0;

      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        if (downloadedBytes > MAX_FILE_SIZE) {
          file.destroy();
          reject(new Error(`File too large: ${downloadedBytes} bytes`));
          return;
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve({
          size: downloadedBytes,
          contentType
        });
      });

      file.on('error', (err) => {
        fs.unlink(filepath).catch(() => {}); // Clean up on error
        reject(err);
      });
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Request timeout after ${TIMEOUT}ms`));
    });

    request.on('error', (err) => {
      clearTimeout(timeout);
      // If HTTPS conversion failed, try with HTTP
      if (downloadUrl.startsWith('https://') && url.startsWith('http://') && !forceHttp) {
        console.log(`   🔄 HTTPS failed, retrying with HTTP: ${url}`);
        return downloadImage(url, filepath, true).then(resolve).catch(reject);
      }
      reject(err);
    });
  });
}

/**
 * Get file extension from URL or content type
 */
function getFileExtension(url, contentType) {
  // Try to get extension from URL
  const urlExt = path.extname(new URL(url).pathname).toLowerCase();
  if (SUPPORTED_FORMATS.includes(urlExt)) {
    return urlExt;
  }

  // Fallback to content type
  const typeMap = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg'
  };

  return typeMap[contentType] || '.jpg';
}

/**
 * Upload image to R2
 */
async function uploadToR2(filepath, key, contentType) {
  const fileContent = await fs.readFile(filepath);

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000', // 1 year cache
  });

  await r2Client.send(command);
  
  const r2Url = R2_ENDPOINT ? `${R2_ENDPOINT}/${key}` : `https://${R2_BUCKET_NAME}.r2.dev/${key}`;
  return r2Url;
}

/**
 * Update store logo URL in database
 */
async function updateStoreLogoUrl(storeId, newUrl) {
  const { error } = await supabase
    .from('stores')
    .update({ logo_url: newUrl })
    .eq('id', storeId);

  if (error) {
    throw new Error(`Failed to update store ${storeId}: ${error.message}`);
  }
}

/**
 * Process a single store
 */
async function processStore(store, options) {
  const { id, name, alias, logo_url } = store;
  
  console.log(`\n🏪 Processing: ${name} (${alias})`);
  console.log(`   Current URL: ${logo_url}`);

  if (options.dryRun) {
    console.log(`   ✅ [DRY RUN] Would migrate logo for ${name}`);
    return { success: true, dryRun: true };
  }

  try {
    // Generate filename
    const ext = getFileExtension(logo_url, 'image/jpeg');
    const filename = `store-logos/${alias}${ext}`;
    const filepath = path.join(TEMP_DIR, `${alias}${ext}`);

    // Download image
    console.log(`   ⬇️  Downloading...`);
    const downloadInfo = await downloadImage(logo_url, filepath);
    console.log(`   ✅ Downloaded ${downloadInfo.size} bytes`);

    // Upload to R2
    console.log(`   ⬆️  Uploading to R2...`);
    const r2Url = await uploadToR2(filepath, filename, downloadInfo.contentType);
    console.log(`   ✅ Uploaded to: ${r2Url}`);

    // Update database
    console.log(`   📝 Updating database...`);
    await updateStoreLogoUrl(id, r2Url);
    console.log(`   ✅ Database updated`);

    // Clean up temp file
    await fs.unlink(filepath);

    return { 
      success: true, 
      oldUrl: logo_url, 
      newUrl: r2Url,
      size: downloadInfo.size
    };

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    
    // Clean up temp file on error
    const ext = getFileExtension(logo_url, 'image/jpeg');
    const filepath = path.join(TEMP_DIR, `${alias}${ext}`);
    try {
      await fs.unlink(filepath);
    } catch {}

    return { 
      success: false, 
      error: error.message,
      storeId: id,
      storeName: name
    };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Store Logo Migration to R2\n');

  try {
    // Parse arguments
    const options = parseArguments();
    
    if (options.dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    }

    // Validate environment
    validateEnvironment();

    // Create temp directory
    await ensureTempDirectory();

    // Get stores to migrate
    const stores = await getStoresToMigrate(options);

    if (stores.length === 0) {
      console.log('✅ No stores need migration');
      return;
    }

    // Process stores
    const results = {
      total: stores.length,
      success: 0,
      failed: 0,
      errors: [],
      totalSize: 0
    };

    console.log(`\n📦 Processing ${stores.length} stores...\n`);

    for (const store of stores) {
      const result = await processStore(store, options);
      
      if (result.success) {
        results.success++;
        if (result.size) {
          results.totalSize += result.size;
        }
      } else {
        results.failed++;
        results.errors.push({
          store: result.storeName,
          error: result.error
        });
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`   Total stores: ${results.total}`);
    console.log(`   Successful: ${results.success}`);
    console.log(`   Failed: ${results.failed}`);
    
    if (results.totalSize > 0) {
      const totalMB = (results.totalSize / 1024 / 1024).toFixed(2);
      console.log(`   Total size migrated: ${totalMB} MB`);
    }

    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(({ store, error }) => {
        console.log(`   - ${store}: ${error}`);
      });
    }

    console.log('\n✅ Migration completed');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  main,
  processStore,
  validateEnvironment
};