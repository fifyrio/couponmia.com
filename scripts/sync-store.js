#!/usr/bin/env node

require('dotenv').config();

const { exec } = require('child_process');
const { promisify } = require('util');
const { createClient } = require('@supabase/supabase-js');

const execAsync = promisify(exec);

// Supabase配置
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

class StoreSyncOrchestrator {
  constructor(storeName) {
    this.storeName = storeName;
    this.logPrefix = `[Store Sync: ${storeName}]`;
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} ${this.logPrefix} ${message}`;
    
    if (type === 'error') {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }

    // Optional: Log to database for audit trail
    try {
      await supabase.from('sync_logs').insert({
        sync_type: 'store_webhook',
        details: { store: this.storeName, message, type },
        status: type === 'error' ? 'error' : 'running'
      });
    } catch (dbError) {
      console.error('Failed to log to database:', dbError.message);
    }
  }

  async executeScript(script, description) {
    await this.log(`Starting: ${description}`);
    
    try {
      const { stdout, stderr } = await execAsync(script);
      
      if (stderr) {
        await this.log(`Warning in ${description}: ${stderr}`, 'warning');
      }
      
      await this.log(`Completed: ${description}`);
      return { success: true, output: stdout };
      
    } catch (error) {
      await this.log(`Error in ${description}: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async validateStore() {
    await this.log('Validating store exists in database');
    
    try {
      const { data: store, error } = await supabase
        .from('stores')
        .select('id, name, alias')
        .or(`name.ilike.%${this.storeName}%,alias.ilike.%${this.storeName}%`)
        .single();

      if (error || !store) {
        throw new Error(`Store "${this.storeName}" not found in database`);
      }

      await this.log(`Found store: ${store.name} (${store.alias})`);
      return store;
      
    } catch (error) {
      await this.log(`Store validation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async syncStore() {
    try {
      await this.log('Starting store synchronization process');
      
      // Step 1: Validate store exists
      const store = await this.validateStore();
      
      // Step 2: Migrate store logo to R2 for this specific store
      await this.executeScript(
        `node scripts/migrate-store-logos-to-r2.js --store "${this.storeName}"`,
        'Migrate store logo to R2'
      );

      // Step 3: Analyze store data for this specific store
      await this.executeScript(
        `node scripts/sync-data.js analyze "${this.storeName}"`,
        'Analyze store data'
      );

      // Step 4: Update store popularity for this specific store
      await this.executeScript(
        `node scripts/sync-data.js popularity "${this.storeName}"`,
        'Update store popularity'
      );

      // Step 5: Analyze similar stores for this specific store
      await this.executeScript(
        `node scripts/analyze-similar-stores.js single "${store.alias}"`,
        'Analyze similar stores'
      );

      // Step 6: Generate store FAQs for this specific store by alias
      await this.executeScript(
        `node scripts/generate-store-faqs.js single "${store.alias}"`,
        'Generate store FAQs'
      );

      await this.log('Store synchronization completed successfully');
      
      // Log completion to database
      await supabase.from('sync_logs').insert({
        sync_type: 'store_webhook',
        status: 'completed',
        success_count: 1,
        error_count: 0,
        details: { store: this.storeName, alias: store.alias }
      });

      return { success: true, store };
      
    } catch (error) {
      await this.log(`Store synchronization failed: ${error.message}`, 'error');
      
      // Log error to database
      await supabase.from('sync_logs').insert({
        sync_type: 'store_webhook',
        status: 'error',
        success_count: 0,
        error_count: 1,
        details: { store: this.storeName, error: error.message }
      });

      throw error;
    }
  }
}

// Main execution
async function main() {
  const storeName = process.argv[2];
  
  if (!storeName) {
    console.error('Usage: node scripts/sync-store.js "store-name"');
    process.exit(1);
  }

  const orchestrator = new StoreSyncOrchestrator(storeName);
  
  try {
    await orchestrator.syncStore();
    console.log('Store sync completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Store sync failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { StoreSyncOrchestrator };