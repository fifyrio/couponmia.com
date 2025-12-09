#!/usr/bin/env node

/**
 * Store Processing Queue
 * Executes a series of scripts in sequence for a specific store
 *
 * Usage: node scripts/process-store.js <store-name>
 * Example: node scripts/process-store.js stealthwriter
 */

const { execSync } = require('child_process');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, total, title) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`STEP ${step}/${total}: ${title}`, colors.bright + colors.cyan);
  log('='.repeat(60), colors.cyan);
}

function executeScript(command, description) {
  try {
    log(`\n▶ Executing: ${command}`, colors.blue);
    execSync(command, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8'
    });
    log(`✓ ${description} completed successfully`, colors.green);
    return true;
  } catch (error) {
    log(`✗ ${description} failed with exit code ${error.status}`, colors.red);
    return false;
  }
}

async function processStore(storeName) {
  const startTime = Date.now();

  log('\n' + '█'.repeat(60), colors.bright + colors.blue);
  log(`  STORE PROCESSING QUEUE`, colors.bright + colors.blue);
  log(`  Store: ${storeName}`, colors.bright + colors.blue);
  log('█'.repeat(60) + '\n', colors.bright + colors.blue);

  // Define the processing queue
  const queue = [
    {
      command: `node scripts/migrate-store-logos-to-r2.js --store '${storeName}'`,
      description: 'Migrate store logo to R2 storage'
    },
    {
      command: `node scripts/sync-data.js analyze '${storeName}'`,
      description: 'Analyze store discounts and generate ratings'
    },
    {
      command: `node scripts/sync-data.js popularity '${storeName}'`,
      description: 'Update store popularity score'
    },
    {
      command: `node scripts/analyze-similar-stores.js single '${storeName}'`,
      description: 'Generate AI-powered similar store recommendations'
    },
    {
      command: `node scripts/generate-store-faqs.js by-name '${storeName}'`,
      description: 'Generate AI-powered store FAQs'
    }
  ];

  const results = [];

  // Execute each script in sequence
  for (let i = 0; i < queue.length; i++) {
    const { command, description } = queue[i];
    logStep(i + 1, queue.length, description);

    const success = executeScript(command, description);
    results.push({ step: i + 1, description, success });

    if (!success) {
      log(`\n⚠ Script failed but continuing with remaining tasks...`, colors.yellow);
    }
  }

  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log('\n' + '█'.repeat(60), colors.bright + colors.cyan);
  log('  PROCESSING SUMMARY', colors.bright + colors.cyan);
  log('█'.repeat(60), colors.cyan);

  results.forEach(({ step, description, success }) => {
    const status = success ? '✓' : '✗';
    const color = success ? colors.green : colors.red;
    log(`  ${status} Step ${step}: ${description}`, color);
  });

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  log('\n' + '-'.repeat(60), colors.cyan);
  log(`  Total Steps: ${queue.length}`, colors.bright);
  log(`  Successful: ${successCount}`, colors.green);
  log(`  Failed: ${failCount}`, failCount > 0 ? colors.red : colors.green);
  log(`  Duration: ${duration}s`, colors.blue);
  log('█'.repeat(60) + '\n', colors.cyan);

  if (failCount === 0) {
    log(`✓ All processing steps completed successfully for "${storeName}"`, colors.bright + colors.green);
  } else {
    log(`⚠ Processing completed with ${failCount} failed step(s)`, colors.yellow);
  }
}

// Main execution
const storeName = process.argv[2];

if (!storeName) {
  log('Error: Store name is required', colors.red);
  log('\nUsage: node scripts/process-store.js <store-name>', colors.yellow);
  log('Example: node scripts/process-store.js stealthwriter\n', colors.yellow);
  process.exit(1);
}

processStore(storeName).catch(error => {
  log(`\nFatal error: ${error.message}`, colors.red);
  process.exit(1);
});
