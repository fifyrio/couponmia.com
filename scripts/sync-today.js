#!/usr/bin/env node

/**
 * Daily Sync Script - sync-today.js
 * 
 * Processes stores updated yesterday by executing targeted operations:
 * 1. Query stores updated yesterday from database
 * 2. For each store, execute in sequence:
 *    - Migrate store logos to R2 storage
 *    - Analyze store discounts and generate ratings/reviews
 *    - Update store popularity scores
 *    - Generate similar store recommendations
 *    - Generate store-specific FAQs
 *    - AI-powered store categorization
 */

const { execSync } = require('child_process');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

class TodaySyncService {
  constructor() {
    this.startTime = Date.now();
    this.taskResults = [];
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  // Get stores updated yesterday
  async getUpdatedStores() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    
    console.log(`📅 Querying stores updated after ${yesterdayDate}...`);
    
    try {
      const { data: stores, error } = await this.supabase
        .from('stores')
        .select('*')
        .gt('updated_at', `${yesterdayDate}T00:00:00`)
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      console.log(`📊 Found ${stores?.length || 0} stores updated yesterday`);
      return stores || [];
    } catch (error) {
      console.error(`❌ Failed to fetch updated stores:`, error);
      throw error;
    }
  }

  // Execute a command with proper error handling and logging
  async executeTask(taskName, command, description, storeName = null) {
    const displayName = storeName ? `${taskName} (${storeName})` : taskName;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 ${displayName}: ${description}`);
    console.log(`${'='.repeat(60)}`);
    
    const taskStartTime = Date.now();
    
    try {
      // Execute the command with stdio inheritance for real-time output
      execSync(command, { 
        stdio: 'inherit', 
        cwd: path.join(__dirname, '..'),
        timeout: 10 * 60 * 1000 // 10 minute timeout per task
      });
      
      const taskDuration = (Date.now() - taskStartTime) / 1000;
      
      console.log(`\n✅ ${displayName} completed successfully in ${taskDuration}s`);
      
      this.taskResults.push({
        task: displayName,
        status: 'success',
        duration: taskDuration
      });
      
      return true;
    } catch (error) {
      const taskDuration = (Date.now() - taskStartTime) / 1000;
      
      console.error(`\n❌ ${displayName} failed after ${taskDuration}s:`);
      console.error(error.message);
      
      this.taskResults.push({
        task: displayName,
        status: 'failed',
        duration: taskDuration,
        error: error.message
      });
      
      return false;
    }
  }

  // Process a single store through all tasks
  async processStore(store) {
    const storeName = store.name;
    const escapedStoreName = storeName.replace(/'/g, "\\'");
    
    console.log(`\n🏪 Processing store: ${storeName} (Updated: ${store.updated_at})`);
    
    const storeTasks = [
      {
        name: "Logo Migration",
        command: `node scripts/migrate-store-logos-to-r2.js --store '${escapedStoreName}'`,
        description: "Migrate store logo to Cloudflare R2 storage"
      },
      {
        name: "Store Analysis",
        command: `node scripts/sync-data.js analyze '${escapedStoreName}'`,
        description: "Analyze store discounts and generate ratings/reviews"
      },
      {
        name: "Popularity Scoring",
        command: `node scripts/sync-data.js popularity '${escapedStoreName}'`,
        description: "Update store popularity scores"
      },
      {
        name: "Similar Stores Analysis",
        command: `node scripts/analyze-similar-stores.js single '${escapedStoreName}'`,
        description: "Generate AI-powered similar store recommendations"
      },
      {
        name: "FAQ Generation",
        command: `node scripts/generate-store-faqs.js by-name '${escapedStoreName}'`,
        description: "Generate AI-powered store-specific FAQs"
      },
      {
        name: "Store Categorization", 
        command: `node scripts/manage-categories.js categorize --store='${escapedStoreName}' --ai`,
        description: "AI-powered store categorization using unified system"
      }
    ];

    let storeSuccessCount = 0;
    
    for (const task of storeTasks) {
      const success = await this.executeTask(
        task.name,
        task.command,
        task.description,
        storeName
      );
      
      if (success) {
        storeSuccessCount++;
      } else {
        console.log(`⚠️  Task failed for ${storeName}, continuing with next task...`);
      }
    }
    
    console.log(`\n📊 Store ${storeName}: ${storeSuccessCount}/${storeTasks.length} tasks completed`);
    
    return storeSuccessCount;
  }

  // Print final summary
  printSummary(processedStores, totalTasks, successfulTasks) {
    const totalDuration = (Date.now() - this.startTime) / 1000;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 DAILY SYNC SUMMARY - Total Time: ${Math.round(totalDuration)}s`);
    console.log(`${'='.repeat(80)}`);
    
    console.log(`🏪 Processed Stores: ${processedStores}`);
    console.log(`📈 Total Tasks: ${totalTasks}`);
    console.log(`✅ Successful Tasks: ${successfulTasks}`);
    console.log(`❌ Failed Tasks: ${totalTasks - successfulTasks}`);
    
    let successCount = 0;
    let failedCount = 0;
    
    this.taskResults.forEach((result, index) => {
      const icon = result.status === 'success' ? '✅' : '❌';
      const duration = Math.round(result.duration);
      
      if (result.status === 'success') {
        successCount++;
      } else {
        failedCount++;
      }
    });
    
    if (failedCount === 0) {
      console.log(`🎉 All daily sync tasks completed successfully!`);
    } else {
      console.log(`⚠️  ${failedCount} tasks failed. Check logs for details.`);
    }
    
    console.log(`${'='.repeat(80)}\n`);
  }

  // Main execution function
  async run() {
    console.log(`🌅 Starting Daily Sync Process at ${new Date().toISOString()}`);
    
    try {
      // Step 1: Run global category management tasks first
      console.log(`\n🚀 Step 1: Global Category Management`);
      await this.executeTask(
        "Category Management",
        "node scripts/manage-categories.js workflow --ai --limit=30",
        "Run unified category management workflow (categorize new stores, generate missing images/FAQs)"
      );
      
      // Step 2: Get stores updated yesterday
      const updatedStores = await this.getUpdatedStores();
      
      if (updatedStores.length === 0) {
        console.log(`ℹ️  No stores were updated yesterday. Skipping store-specific processing.`);
        // But we still ran the category management, so this is not a failure
        this.printSummary(0, 1, 1); // 1 task attempted (category management), 1 successful
        return;
      }
      
      console.log(`\n🚀 Step 2: Store-Specific Processing`);}
      
      let totalTasksCompleted = 0;
      let processedStoresCount = 0;
      
      // Process each store
      for (const store of updatedStores) {
        try {
          const storeTasksCompleted = await this.processStore(store);
          totalTasksCompleted += storeTasksCompleted;
          processedStoresCount++;
        } catch (error) {
          console.error(`❌ Failed to process store ${store.name}:`, error);
        }
      }
      
      // Calculate success rate (6 tasks per store + 1 global category management task)
      const totalTasksAttempted = (processedStoresCount * 6) + 1; // 6 tasks per store + 1 global task
      const successfulTasks = this.taskResults.filter(r => r.status === 'success').length;
      
      this.printSummary(processedStoresCount, totalTasksAttempted, successfulTasks);
      
      // Exit with error code if success rate is low
      const successRate = totalTasksAttempted > 0 ? successfulTasks / totalTasksAttempted : 0;
      process.exit(successRate < 0.5 ? 1 : 0);
      
    } catch (error) {
      console.error('❌ Critical error during daily sync:', error);
      process.exit(1);
    }
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