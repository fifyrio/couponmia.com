#!/usr/bin/env node

/**
 * Process Popular Stores - Batch Processing Script
 *
 * Fetches all featured stores from the database and processes them sequentially
 * using the process-store.js script for each store.
 *
 * Usage:
 *   node scripts/process-popular-stores.js [--limit=N] [--offset=N] [--dry-run]
 *
 * Options:
 *   --limit=N     Process only N stores (default: all)
 *   --offset=N    Skip first N stores (default: 0)
 *   --dry-run     Show what would be processed without executing
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  log('Error: Missing Supabase credentials in .env file', colors.red);
  log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set', colors.yellow);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse command line arguments
function parseArgs() {
  const args = {
    limit: null,
    offset: 0,
    dryRun: false
  };

  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--limit=')) {
      args.limit = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--offset=')) {
      args.offset = parseInt(arg.split('=')[1]);
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    }
  });

  return args;
}

// Fetch featured stores from database
async function getFeaturedStores(limit = null, offset = 0) {
  try {
    let query = supabase
      .from('stores')
      .select('id, name, alias, is_featured, active_offers_count')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (offset > 0) {
      query = query.range(offset, offset + (limit || 1000) - 1);
    } else if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    log(`Error fetching featured stores: ${error.message}`, colors.red);
    return [];
  }
}

// Process a single store
function processStore(storeName, index, total) {
  try {
    log(`\n${'='.repeat(80)}`, colors.cyan);
    log(`[${index}/${total}] Processing: ${storeName}`, colors.bright + colors.cyan);
    log('='.repeat(80), colors.cyan);

    const command = `npm run process:store "${storeName}"`;

    execSync(command, {
      stdio: 'inherit',
      encoding: 'utf-8'
    });

    log(`✓ Completed: ${storeName}`, colors.green);
    return { success: true, store: storeName };
  } catch (error) {
    log(`✗ Failed: ${storeName} (Exit code: ${error.status})`, colors.red);
    return { success: false, store: storeName, error: error.message };
  }
}

// Main execution
async function main() {
  const startTime = Date.now();
  const args = parseArgs();

  log('\n' + '█'.repeat(80), colors.bright + colors.blue);
  log('  BATCH PROCESS POPULAR STORES', colors.bright + colors.blue);
  log('█'.repeat(80) + '\n', colors.bright + colors.blue);

  // Show configuration
  log('Configuration:', colors.bright);
  log(`  Limit: ${args.limit || 'All'}`, colors.cyan);
  log(`  Offset: ${args.offset}`, colors.cyan);
  log(`  Dry Run: ${args.dryRun ? 'Yes' : 'No'}`, colors.cyan);
  log('');

  // Fetch stores
  log('Fetching featured stores from database...', colors.yellow);
  const stores = await getFeaturedStores(args.limit, args.offset);

  if (stores.length === 0) {
    log('No featured stores found in database', colors.yellow);
    process.exit(0);
  }

  log(`Found ${stores.length} featured store(s)\n`, colors.green);

  // Display store list
  log('Stores to process:', colors.bright);
  stores.forEach((store, index) => {
    const offerCount = store.active_offers_count || 0;
    log(`  ${index + 1}. ${store.name} (${store.alias}) - ${offerCount} offers`, colors.cyan);
  });
  log('');

  // Dry run mode
  if (args.dryRun) {
    log('DRY RUN MODE - No stores will be processed', colors.yellow);
    log(`Would process ${stores.length} store(s)`, colors.yellow);
    process.exit(0);
  }

  // Confirmation prompt (optional - comment out for automatic execution)
  // You can uncomment this if you want manual confirmation
  /*
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    readline.question('Continue with processing? (y/n): ', resolve);
  });
  readline.close();

  if (answer.toLowerCase() !== 'y') {
    log('Aborted by user', colors.yellow);
    process.exit(0);
  }
  */

  // Process stores sequentially
  const results = [];

  for (let i = 0; i < stores.length; i++) {
    const store = stores[i];
    const result = processStore(store.name, i + 1, stores.length);
    results.push(result);

    // Add a small delay between stores to avoid overwhelming the system
    if (i < stores.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log('\n' + '█'.repeat(80), colors.bright + colors.cyan);
  log('  BATCH PROCESSING SUMMARY', colors.bright + colors.cyan);
  log('█'.repeat(80), colors.cyan);

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  log(`\n  Total Stores: ${stores.length}`, colors.bright);
  log(`  Successful: ${successCount}`, colors.green);
  log(`  Failed: ${failCount}`, failCount > 0 ? colors.red : colors.green);
  log(`  Duration: ${duration}s`, colors.blue);

  if (failCount > 0) {
    log('\n  Failed Stores:', colors.red);
    results.filter(r => !r.success).forEach(r => {
      log(`    - ${r.store}`, colors.red);
    });
  }

  log('\n' + '█'.repeat(80) + '\n', colors.cyan);

  process.exit(failCount > 0 ? 1 : 0);
}

// Error handling
process.on('unhandledRejection', (error) => {
  log(`\nUnhandled error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});

// Run main function
main().catch(error => {
  log(`\nFatal error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
