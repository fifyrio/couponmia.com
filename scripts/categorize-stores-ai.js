#!/usr/bin/env node

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://couponmia.com',
    'X-Title': 'CouponMia.com',
  },
});

class StoreCategorizationService {
  constructor() {
    this.batchSize = 10;
    this.aiBatchSize = 5; // AI批量分析数量
    this.delay = 3000; // 3秒间隔避免API限制
    this.aiCallCount = 0; // 统计AI调用次数
    this.fallbackCount = 0; // 统计回退分类次数
    
    // 预设分类体系
    this.predefinedCategories = [
      'Fashion & Apparel',
      'Electronics & Tech', 
      'Home & Garden',
      'Health & Beauty',
      'Sports & Outdoors',
      'Travel & Hospitality',
      'Food & Dining',
      'Software & Services',
      'AI Software',
      'Automotive',
      'Other'
    ];
  }

  // 获取有促销的商家
  async getStoresWithOffers(limit = null) {
    console.log('🔍 Fetching stores with active promotions...');
    
    let query = supabase
      .from('stores')
      .select('id, name, alias, description, website, category')
      .gt('active_offers_count', 0)
      .order('active_offers_count', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch stores: ${error.message}`);
    }
    
    console.log(`📊 Found ${data?.length || 0} stores with active promotions`);
    return data || [];
  }

  // 按名称搜索商家
  async getStoreByName(storeName) {
    console.log(`🔍 Searching for store: "${storeName}"`);
    
    // 尝试精确匹配
    let { data, error } = await supabase
      .from('stores')
      .select('id, name, alias, description, website, category, active_offers_count')
      .ilike('name', storeName)
      .single();
    
    if (!error && data) {
      console.log(`✅ Found exact match: ${data.name}`);
      return data;
    }
    
    // 尝试模糊匹配
    const { data: fuzzyResults, error: fuzzyError } = await supabase
      .from('stores')
      .select('id, name, alias, description, website, category, active_offers_count')
      .ilike('name', `%${storeName}%`)
      .limit(5);
    
    if (fuzzyError) {
      throw new Error(`Failed to search stores: ${fuzzyError.message}`);
    }
    
    if (!fuzzyResults || fuzzyResults.length === 0) {
      throw new Error(`No stores found matching "${storeName}"`);
    }
    
    if (fuzzyResults.length === 1) {
      console.log(`✅ Found fuzzy match: ${fuzzyResults[0].name}`);
      return fuzzyResults[0];
    }
    
    // 多个匹配结果，显示选项
    console.log(`🔍 Found ${fuzzyResults.length} possible matches:`);
    fuzzyResults.forEach((store, index) => {
      console.log(`  ${index + 1}. ${store.name} (${store.active_offers_count} offers)`);
    });
    
    throw new Error(`Multiple stores found. Please be more specific with the store name.`);
  }

  // AI批量分析商家分类 - 减少API调用次数
  async analyzeBatchStoreCategories(stores) {
    if (stores.length === 0) return {};

    const storesList = stores.map((store, index) => 
      `${index + 1}. Name: ${store.name}
   Website: ${store.website}
   Description: ${store.description}
   Current Category: ${store.category || 'None'}`
    ).join('\n\n');

    const prompt = `Analyze these ${stores.length} stores and categorize each into 1-2 most relevant categories.

Available Categories: ${this.predefinedCategories.join(', ')}

Stores to analyze:
${storesList}

Instructions:
1. For each store, select 1-2 most relevant categories based on business type
2. Consider store name, website domain, and description  
3. Pay special attention to AI-related services - use "AI Software" for AI tools, voice generators, chatbots, etc.
4. Return ONLY a JSON object where keys are store indices (1-${stores.length}) and values are arrays of category names
5. Use exact category names from the available list
6. If unsure, use "Other"

Required JSON format:
{
  "1": ["Category Name"],
  "2": ["Category1", "Category2"],
  ...
}`;

    try {
      this.aiCallCount++; // 增加AI调用计数
      
      const response = await openai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0]?.message?.content?.trim();
      const results = JSON.parse(content);
      
      // 转换结果格式并验证分类
      const storeResults = {};
      stores.forEach((store, index) => {
        const storeIndex = (index + 1).toString();
        const categories = results[storeIndex] || ['Other'];
        
        // 验证返回的分类是否在预设列表中
        const validCategories = categories.filter(cat => 
          this.predefinedCategories.includes(cat)
        );
        
        storeResults[store.id] = validCategories.length > 0 ? validCategories : ['Other'];
        console.log(`  → AI suggested for ${store.name}: ${storeResults[store.id].join(', ')}`);
      });
      
      return storeResults;
      
    } catch (error) {
      console.error(`  ❌ AI batch analysis failed:`, error.message);
      this.fallbackCount += stores.length; // 增加回退计数
      
      // 回退到单独分类每个商家
      const fallbackResults = {};
      stores.forEach(store => {
        const fallbackCategory = this.getFallbackCategory(store);
        fallbackResults[store.id] = [fallbackCategory];
        console.log(`  → Fallback for ${store.name}: ${fallbackCategory}`);
      });
      
      return fallbackResults;
    }
  }

  // 简单规则的回退分类方法
  getFallbackCategory(store) {
    const name = store.name.toLowerCase();
    const website = store.website.toLowerCase();
    const description = (store.description || '').toLowerCase();
    const text = `${name} ${website} ${description}`;

    // 基于关键词的简单分类 - 按优先级排序
    
    // AI Software (check first - most specific)
    if (text.match(/\bai\b|artificial intelligence|machine learning|neural|chatbot|gpt|openai|claude|llm|elevenlabs|midjourney|stability|replicate|anthropic/)) {
      return 'AI Software';
    }
    
    // Fashion & Apparel
    if (text.match(/fashion|clothing|apparel|wear|dress|shirt|shoe|bag|style|outfit|cloth|garment|accessory|jewelry|jewellery|watch/)) {
      return 'Fashion & Apparel';
    }
    
    // Electronics & Tech
    if (text.match(/electronic|tech|computer|phone|gadget|device|software|digital|mobile|laptop|tablet|gaming/)) {
      return 'Electronics & Tech';
    }
    
    // Health & Beauty
    if (text.match(/health|beauty|cosmetic|skincare|medical|wellness|nuxe|makeup|fragrance|perfume|spa|care|lotion/)) {
      return 'Health & Beauty';
    }
    
    // Sports & Outdoors  
    if (text.match(/sport|fitness|outdoor|gym|athletic|exercise|reebok|nike|adidas|mpg|running|yoga|bike/)) {
      return 'Sports & Outdoors';
    }
    
    // Food & Dining
    if (text.match(/food|restaurant|dining|eat|meal|grocery|instacart|kitchen|cook|recipe|pet.*food|raw.*paw/)) {
      return 'Food & Dining';
    }
    
    // Home & Garden
    if (text.match(/home|garden|furniture|decor|house|living|bedroom|bathroom|kitchen|interior|design/)) {
      return 'Home & Garden';
    }
    
    // Travel & Hospitality
    if (text.match(/travel|hotel|flight|vacation|booking|trip|airline|resort|cruise|tour/)) {
      return 'Travel & Hospitality';
    }
    
    // Automotive
    if (text.match(/auto|car|vehicle|motor|tire|parts|automotive|garage|mechanic/)) {
      return 'Automotive';
    }
    
    // Software & Services (for apps, tools, etc.)
    if (text.match(/app|service|tool|platform|software|digital|online|web|cloud|subscription/)) {
      return 'Software & Services';
    }
    
    // Special cases based on domain patterns
    if (website.match(/toy|game|play/)) {
      return 'Other'; // Could be toys/games
    }
    
    if (website.match(/pet|animal|vet/)) {
      return 'Other'; // Pet supplies
    }
    
    return 'Other';
  }

  // 获取或创建分类
  async getOrCreateCategory(categoryName) {
    // 先检查分类是否存在
    const { data: existingCategory, error: selectError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('name', categoryName)
      .single();
    
    if (existingCategory) {
      return existingCategory;
    }
    
    // 如果查询出错且不是"没找到"错误，返回null
    if (selectError && selectError.code !== 'PGRST116') {
      console.error(`Failed to query category ${categoryName}:`, selectError.message);
      return null;
    }
    
    // 创建新分类
    const slug = categoryName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({ name: categoryName, slug })
      .select('id, name, slug')
      .single();
    
    if (error) {
      // 如果是重复键错误，再次尝试查询（可能是并发创建）
      if (error.code === '23505') {
        const { data: retryCategory } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('name', categoryName)
          .single();
        
        if (retryCategory) {
          return retryCategory;
        }
      }
      
      console.error(`Failed to create category ${categoryName}:`, error.message);
      return null;
    }
    
    console.log(`  ✅ Created new category: ${categoryName}`);
    return newCategory;
  }

  // 更新商家分类关联
  async updateStoreCategories(storeId, categories) {
    // 过滤掉'Other'分类
    const validCategories = categories.filter(cat => cat !== 'Other');
    
    if (validCategories.length === 0) {
      console.log(`  ⏭️  Skipping - no meaningful categories (only 'Other')`);
      return false; // 返回false表示跳过
    }
    
    // 删除现有分类关联
    await supabase
      .from('store_categories')
      .delete()
      .eq('store_id', storeId);
    
    // 添加新的分类关联
    const insertPromises = validCategories.map(async (categoryName) => {
      const category = await this.getOrCreateCategory(categoryName);
      
      if (category) {
        const { error } = await supabase
          .from('store_categories')
          .insert({
            store_id: storeId,
            category_id: category.id
          });
        
        if (error) {
          console.error(`Failed to link store to category ${categoryName}:`, error.message);
        }
      }
    });
    
    await Promise.all(insertPromises);
    return true; // 返回true表示成功处理
  }

  // 处理单个商家 - 使用预分析结果
  async processStore(store, preAnalyzedCategories) {
    console.log(`\n🏪 Processing: ${store.name}`);
    
    try {
      // 使用预分析的分类结果
      const suggestedCategories = preAnalyzedCategories || [this.getFallbackCategory(store)];
      
      // 更新数据库
      const wasUpdated = await this.updateStoreCategories(store.id, suggestedCategories);
      
      if (wasUpdated) {
        const validCategories = suggestedCategories.filter(cat => cat !== 'Other');
        console.log(`  ✅ Updated categories: ${validCategories.join(', ')}`);
        return { success: true, store: store.name, categories: validCategories, skipped: false };
      } else {
        return { success: true, store: store.name, categories: [], skipped: true };
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to process ${store.name}:`, error.message);
      return { success: false, store: store.name, error: error.message };
    }
  }

  // 批量处理商家 - 优化AI调用
  async processBatch(stores) {
    const results = [];
    
    for (let i = 0; i < stores.length; i += this.batchSize) {
      const batch = stores.slice(i, i + this.batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i/this.batchSize) + 1}/${Math.ceil(stores.length/this.batchSize)} (${batch.length} stores)`);
      
      // AI批量分析 - 减少API调用次数
      const aiAnalysisResults = {};
      
      // 将batch分成更小的AI批次
      for (let j = 0; j < batch.length; j += this.aiBatchSize) {
        const aiBatch = batch.slice(j, j + this.aiBatchSize);
        console.log(`🤖 AI analyzing ${aiBatch.length} stores...`);
        
        try {
          const batchAnalysis = await this.analyzeBatchStoreCategories(aiBatch);
          Object.assign(aiAnalysisResults, batchAnalysis);
          
          // AI调用间延迟
          if (j + this.aiBatchSize < batch.length) {
            console.log(`⏱️  AI cooldown 1s...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`AI batch analysis error, using fallback for ${aiBatch.length} stores`);
          // 使用回退分类
          aiBatch.forEach(store => {
            aiAnalysisResults[store.id] = [this.getFallbackCategory(store)];
          });
        }
      }
      
      // 处理商家 - 使用预分析结果
      const batchResults = [];
      for (const store of batch) {
        const categories = aiAnalysisResults[store.id];
        const result = await this.processStore(store, categories);
        batchResults.push(result);
      }
      
      results.push(...batchResults);
      
      // 批次间延迟
      if (i + this.batchSize < stores.length) {
        console.log(`⏱️  Waiting ${this.delay/1000}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
    
    return results;
  }

  // 打印最终摘要
  printSummary(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const skipped = successful.filter(r => r.skipped);
    const categorized = successful.filter(r => !r.skipped);
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 CATEGORIZATION SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Successfully processed: ${successful.length}`);
    console.log(`🏷️  Categorized: ${categorized.length}`);
    console.log(`⏭️  Skipped (Other only): ${skipped.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`📈 Total stores: ${results.length}`);
    console.log(`🤖 AI API calls: ${this.aiCallCount}`);
    console.log(`🔄 Fallback classifications: ${this.fallbackCount}`);
    console.log(`💡 API efficiency: ${this.aiCallCount > 0 ? Math.round((results.length - this.fallbackCount) / this.aiCallCount * 100) / 100 : 0} stores per API call`);
    
    if (failed.length > 0) {
      console.log(`\n❌ Failed stores:`);
      failed.forEach(f => console.log(`  - ${f.store}: ${f.error}`));
    }
    
    if (skipped.length > 0) {
      console.log(`\n⏭️  Skipped stores (no meaningful categories):`);
      skipped.forEach(s => console.log(`  - ${s.store}`));
    }
    
    // 统计分类分布 - 只统计有意义的分类
    const categoryStats = {};
    categorized.forEach(result => {
      result.categories.forEach(cat => {
        if (cat !== 'Other') {
          categoryStats[cat] = (categoryStats[cat] || 0) + 1;
        }
      });
    });
    
    if (Object.keys(categoryStats).length > 0) {
      console.log(`\n📊 Category distribution:`);
      Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
          console.log(`  - ${category}: ${count} stores`);
        });
    } else {
      console.log(`\nℹ️  No meaningful categories were assigned to any stores.`);
    }
    
    console.log(`${'='.repeat(60)}\n`);
  }

  // 分析单个商家
  async runSingleStore(storeName) {
    const startTime = Date.now();
    console.log(`🌟 Starting Single Store Categorization at ${new Date().toISOString()}`);
    
    try {
      // 搜索商家
      const store = await this.getStoreByName(storeName);
      
      console.log(`📋 Store Information:`);
      console.log(`  Name: ${store.name}`);
      console.log(`  Website: ${store.website}`);
      console.log(`  Active Offers: ${store.active_offers_count}`);
      console.log(`  Current Category: ${store.category || 'None'}`);
      
      // AI分析单个商家
      console.log(`\n🤖 AI analyzing single store...`);
      const aiAnalysisResults = await this.analyzeBatchStoreCategories([store]);
      
      // 处理商家
      const categories = aiAnalysisResults[store.id];
      const result = await this.processStore(store, categories);
      
      // 打印结果
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📊 SINGLE STORE CATEGORIZATION RESULT`);
      console.log(`${'='.repeat(60)}`);
      console.log(`🏪 Store: ${store.name}`);
      console.log(`✅ Success: ${result.success ? 'Yes' : 'No'}`);
      
      if (result.success) {
        if (result.skipped) {
          console.log(`⏭️  Result: Skipped (no meaningful categories)`);
        } else {
          console.log(`🏷️  Categories: ${result.categories.join(', ')}`);
        }
      } else {
        console.log(`❌ Error: ${result.error}`);
      }
      
      console.log(`🤖 AI API calls: ${this.aiCallCount}`);
      console.log(`🔄 Used fallback: ${this.fallbackCount > 0 ? 'Yes' : 'No'}`);
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`⏱️  Duration: ${duration}s`);
      console.log(`${'='.repeat(60)}\n`);
      
      process.exit(result.success ? 0 : 1);
      
    } catch (error) {
      console.error('💥 Error:', error.message);
      process.exit(1);
    }
  }

  // 主执行函数
  async run(limit = null) {
    const startTime = Date.now();
    console.log(`🌟 Starting AI Store Categorization at ${new Date().toISOString()}`);
    
    try {
      // 获取商家数据
      const stores = await this.getStoresWithOffers(limit);
      
      if (stores.length === 0) {
        console.log('ℹ️  No stores with active promotions found.');
        return;
      }
      
      // 批量处理
      const results = await this.processBatch(stores);
      
      // 打印摘要
      this.printSummary(results);
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`🎉 Categorization completed in ${duration}s`);
      
      // 成功率检查
      const successRate = results.filter(r => r.success).length / results.length;
      process.exit(successRate >= 0.8 ? 0 : 1);
      
    } catch (error) {
      console.error('💥 Critical error:', error);
      process.exit(1);
    }
  }
}

// 脚本执行入口
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 没有参数，分析所有有促销的商家
    const service = new StoreCategorizationService();
    service.run();
  } else if (args[0] === 'single' || args[0] === 'store') {
    // 分析单个商家: node script.js single "store-name"
    if (!args[1]) {
      console.error('❌ Please provide store name: node scripts/categorize-stores-ai.js single "Store Name"');
      process.exit(1);
    }
    
    const service = new StoreCategorizationService();
    service.runSingleStore(args[1]);
  } else {
    // 第一个参数是数字，表示限制数量
    const limit = parseInt(args[0]);
    
    if (isNaN(limit) || limit <= 0) {
      console.error('❌ Usage:');
      console.error('  node scripts/categorize-stores-ai.js              # Analyze all stores with active offers');
      console.error('  node scripts/categorize-stores-ai.js 50           # Analyze first 50 stores');  
      console.error('  node scripts/categorize-stores-ai.js single "Nike" # Analyze specific store by name');
      process.exit(1);
    }
    
    const service = new StoreCategorizationService();
    service.run(limit);
  }
}

module.exports = StoreCategorizationService;