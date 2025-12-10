#!/usr/bin/env node

/**
 * Popular Stores Processing Queue
 * Executes a series of scripts in sequence to update popular/featured stores
 *
 * Usage: npm run process:popular-stores
 * Or: node scripts/process-popular-stores.js
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

async function processPopularStores() {
  const startTime = Date.now();

  log('\n' + '█'.repeat(60), colors.bright + colors.blue);
  log(`  POPULAR STORES PROCESSING QUEUE`, colors.bright + colors.blue);
  log('█'.repeat(60) + '\n', colors.bright + colors.blue);

  // Define the processing queue
  const queue = [
    {
      command: 'node scripts/sync-data.js popularity',
      description: 'Update popularity scores for all stores'
    },
    {
      command: 'node scripts/update-sitemap.js 20',
      description: 'Update sitemap with top 20 featured stores'
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
    log(`✓ All popular stores processing completed successfully`, colors.bright + colors.green);
  } else {
    log(`⚠ Processing completed with ${failCount} failed step(s)`, colors.yellow);
  }
}

// Main execution
processPopularStores().catch(error => {
  log(`\nFatal error: ${error.message}`, colors.red);
  process.exit(1);
});
