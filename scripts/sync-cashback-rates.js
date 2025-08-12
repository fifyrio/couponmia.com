#!/usr/bin/env node

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Use service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

class CashbackRateSync {
  constructor() {
    this.defaultCashbackRate = 2.0; // Default 2% cashback
    this.commissionShareRate = 0.5; // Share 50% of commission as cashback
  }

  async syncCashbackRates() {
    console.log('开始同步返现比例...');
    
    try {
      // Get all stores with commission data
      const { data: stores, error } = await supabase
        .from('stores')
        .select('id, name, alias, commission_rate_data, commission_model_data')
        .eq('is_featured', true); // Only sync for featured stores
      
      if (error) {
        console.error('获取店铺数据失败:', error);
        return;
      }
      
      console.log(`找到 ${stores.length} 个特色店铺`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const store of stores) {
        try {
          const cashbackRate = this.calculateCashbackRate(store);
          
          // Check if cashback rate already exists
          const { data: existingRate } = await supabase
            .from('store_cashback_rates')
            .select('id')
            .eq('store_id', store.id)
            .eq('is_active', true)
            .single();
          
          if (!existingRate) {
            // Insert new cashback rate
            const { error: insertError } = await supabase
              .from('store_cashback_rates')
              .insert({
                store_id: store.id,
                cashback_rate: cashbackRate,
                is_active: true,
                valid_from: new Date().toISOString()
              });
            
            if (insertError) {
              console.error(`设置 ${store.name} 返现比例失败:`, insertError);
              errorCount++;
            } else {
              console.log(`✓ ${store.name} (${store.alias}): ${cashbackRate}% 返现`);
              successCount++;
            }
          } else {
            // Update existing cashback rate
            const { error: updateError } = await supabase
              .from('store_cashback_rates')
              .update({ 
                cashback_rate: cashbackRate,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingRate.id);
            
            if (updateError) {
              console.error(`更新 ${store.name} 返现比例失败:`, updateError);
              errorCount++;
            } else {
              console.log(`↻ ${store.name} (${store.alias}): ${cashbackRate}% 返现 (已更新)`);
              successCount++;
            }
          }
          
          // Add delay to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (storeError) {
          console.error(`处理店铺 ${store.name} 时出错:`, storeError);
          errorCount++;
        }
      }
      
      console.log('\n同步完成:');
      console.log(`成功: ${successCount} 个店铺`);
      console.log(`失败: ${errorCount} 个店铺`);
      
    } catch (error) {
      console.error('同步返现比例失败:', error);
    }
  }

  calculateCashbackRate(store) {
    try {
      // Try to use commission rate data
      if (store.commission_rate_data) {
        const commissionData = JSON.parse(store.commission_rate_data);
        if (commissionData.rate && typeof commissionData.rate === 'number') {
          // Share a percentage of commission as cashback
          let cashbackRate = commissionData.rate * this.commissionShareRate;
          
          // Cap maximum cashback rate at 10%
          cashbackRate = Math.min(cashbackRate, 10);
          
          // Ensure minimum 1% cashback
          cashbackRate = Math.max(cashbackRate, 1);
          
          return Math.round(cashbackRate * 100) / 100; // Round to 2 decimal places
        }
      }
      
      // Fallback to default rate
      return this.defaultCashbackRate;
      
    } catch (parseError) {
      console.log(`解析 ${store.name} 佣金数据失败, 使用默认返现比例`);
      return this.defaultCashbackRate;
    }
  }

  // Set special cashback rates for specific store categories
  async setSpecialRates() {
    console.log('设置特殊返现比例...');
    
    const specialRates = [
      { category: 'Fashion', rate: 8.0 },
      { category: 'Electronics', rate: 3.0 },
      { category: 'Travel', rate: 5.0 },
      { category: 'Food & Dining', rate: 6.0 },
      { category: 'Beauty & Health', rate: 7.0 }
    ];
    
    for (const special of specialRates) {
      try {
        // Find stores in this category
        const { data: stores } = await supabase
          .from('stores')
          .select(`
            id, 
            name,
            store_categories!inner(
              categories!inner(name)
            )
          `)
          .eq('store_categories.categories.name', special.category)
          .eq('is_featured', true);
        
        if (stores && stores.length > 0) {
          console.log(`为 ${stores.length} 个${special.category}店铺设置 ${special.rate}% 返现`);
          
          for (const store of stores) {
            await supabase
              .from('store_cashback_rates')
              .upsert({
                store_id: store.id,
                cashback_rate: special.rate,
                is_active: true,
                valid_from: new Date().toISOString()
              }, {
                onConflict: 'store_id'
              });
            
            console.log(`✓ ${store.name}: ${special.rate}% 返现`);
          }
        }
      } catch (error) {
        console.error(`设置 ${special.category} 特殊返现比例失败:`, error);
      }
    }
  }

  // Create database functions for cashback calculations
  async createDatabaseFunctions() {
    console.log('检查数据库函数...');
    
    try {
      // Test if exec_sql function exists by checking for one of our functions
      const { data, error } = await supabase.rpc('get_user_available_cashback', { 
        user_id: '00000000-0000-0000-0000-000000000000' 
      });
      
      if (error && error.code === 'PGRST202') {
        console.log('⚠️  数据库函数尚未创建');
        console.log('请在 Supabase SQL Editor 中运行 database/cashback-functions.sql');
        console.log('或者联系管理员创建必要的数据库函数');
        return;
      }
      
      console.log('✓ 数据库函数已存在');
      
    } catch (error) {
      console.log('⚠️  无法检查数据库函数状态');
      console.log('请确保已在 Supabase 中运行 database/cashback-functions.sql');
      console.log('详细错误:', error.message);
    }
  }
}

// 主程序
async function main() {
  const service = new CashbackRateSync();
  
  const args = process.argv.slice(2);
  const action = args[0] || 'sync';
  
  switch (action) {
    case 'sync':
      await service.syncCashbackRates();
      break;
    case 'special':
      await service.setSpecialRates();
      break;
    case 'functions':
      await service.createDatabaseFunctions();
      break;
    case 'all':
      await service.syncCashbackRates();
      await service.setSpecialRates();
      await service.createDatabaseFunctions();
      break;
    default:
      console.log('用法:');
      console.log('  node sync-cashback-rates.js sync     # 同步所有店铺返现比例');
      console.log('  node sync-cashback-rates.js special  # 设置特殊类别返现比例');
      console.log('  node sync-cashback-rates.js functions # 创建数据库函数');
      console.log('  node sync-cashback-rates.js all      # 执行所有操作');
  }
}

if (require.main === module) {
  main().catch(console.error);
}