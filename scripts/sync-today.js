#!/usr/bin/env node

/**
 * Daily Sync Script - sync-today.js
 * 
 * Executes all daily synchronization and analysis tasks in the correct order:
 * 1. Migrate store logos to R2 storage
 * 2. Analyze store discounts and generate ratings/reviews
 * 3. Update store popularity scores
 * 4. Generate similar store recommendations
 * 5. Generate store-specific FAQs
 * 6. Sync holiday coupons
 */

const { execSync } = require('child_process');
const path = require('path');

class TodaySyncService {
  constructor() {
    this.startTime = Date.now();
    this.taskResults = [];
  }

  // Execute a command with proper error handling and logging
  async executeTask(taskName, command, description) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 ${taskName}: ${description}`);
    console.log(`${'='.repeat(60)}`);
    
    const taskStartTime = Date.now();
    
    try {
      // Execute the command with stdio inheritance for real-time output
      execSync(command, { 
        stdio: 'inherit', 
        cwd: path.join(__dirname, '..'),
        timeout: 30 * 60 * 1000 // 30 minute timeout
      });
      
      const taskDuration = (Date.now() - taskStartTime) / 1000;
      
      console.log(`\n✅ ${taskName} completed successfully in ${taskDuration}s`);
      
      this.taskResults.push({
        task: taskName,
        status: 'success',
        duration: taskDuration
      });
      
      return true;
    } catch (error) {
      const taskDuration = (Date.now() - taskStartTime) / 1000;
      
      console.error(`\n❌ ${taskName} failed after ${taskDuration}s:`);
      console.error(error.message);
      
      this.taskResults.push({
        task: taskName,
        status: 'failed',
        duration: taskDuration,
        error: error.message
      });
      
      return false;
    }
  }

  // Print final summary
  printSummary() {
    const totalDuration = (Date.now() - this.startTime) / 1000;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 DAILY SYNC SUMMARY - Total Time: ${Math.round(totalDuration)}s`);
    console.log(`${'='.repeat(80)}`);
    
    let successCount = 0;
    let failedCount = 0;
    
    this.taskResults.forEach((result, index) => {
      const icon = result.status === 'success' ? '✅' : '❌';
      const duration = Math.round(result.duration);
      
      console.log(`${index + 1}. ${icon} ${result.task} (${duration}s)`);
      
      if (result.status === 'success') {
        successCount++;
      } else {
        failedCount++;
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log(`\n📈 Results: ${successCount} successful, ${failedCount} failed`);
    
    if (failedCount === 0) {
      console.log(`🎉 All daily sync tasks completed successfully!`);
    } else {
      console.log(`⚠️  Some tasks failed. Please check the logs above.`);
    }
    
    console.log(`${'='.repeat(80)}\n`);
  }

  // Main execution function
  async run() {
    console.log(`🌅 Starting Daily Sync Process at ${new Date().toISOString()}`);
    
    const tasks = [
      {
        name: "Store Logo Migration",
        command: "npm run sync:migrate-store-logos",
        description: "Migrate store logos to Cloudflare R2 storage"
      },
      {
        name: "Store Analysis & Ratings",
        command: "npm run sync:analyze", 
        description: "Analyze store discounts and generate ratings/reviews"
      },
      {
        name: "Store Popularity Scoring",
        command: "npm run sync:popularity",
        description: "Update store popularity scores and featured flags"
      },
      {
        name: "Similar Stores Analysis",
        command: "npm run analyze:similar-stores",
        description: "Generate AI-powered similar store recommendations"
      },
      {
        name: "Store FAQ Generation", 
        command: "npm run analyze:generate-faqs",
        description: "Generate AI-powered store-specific FAQs"
      },
      {
        name: "Holiday Coupons Sync",
        command: "npm run sync:holiday-coupons",
        description: "Sync holiday-themed coupons to database"
      }
    ];

    let continueExecution = true;
    
    for (const task of tasks) {
      if (!continueExecution) {
        console.log(`⏭️  Skipping remaining tasks due to previous failure`);
        break;
      }
      
      const success = await this.executeTask(task.name, task.command, task.description);
      
      // For critical tasks, stop execution on failure
      // You can modify this logic based on which tasks are critical
      if (!success && ['Store Analysis & Ratings', 'Store Popularity Scoring'].includes(task.name)) {
        console.log(`🛑 Critical task failed, stopping execution`);
        continueExecution = false;
      }
    }
    
    this.printSummary();
    
    // Exit with error code if any task failed
    const hasFailures = this.taskResults.some(result => result.status === 'failed');
    process.exit(hasFailures ? 1 : 0);
  }
}

// Handle script execution
async function main() {
  const syncService = new TodaySyncService();
  
  try {
    await syncService.run();
  } catch (error) {
    console.error('❌ Unexpected error during daily sync:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = TodaySyncService;