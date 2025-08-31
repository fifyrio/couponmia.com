#!/usr/bin/env node

/**
 * ========================================
 * 🚀 COUPONMIA CATEGORY MANAGEMENT SYSTEM
 * ========================================
 * 
 * 综合类别管理脚本 - 整合三个核心功能：
 * 1. 商店类别分类 (AI驱动)
 * 2. 类别横幅图片生成 (Replicate AI)
 * 3. 类别FAQ生成 (AI/模板驱动)
 * 
 * 工作流程：
 * Step 1: 分析和分类商店到合适的类别 (categorize-stores)
 * Step 2: 为类别生成专业横幅图片 (generate-images)  
 * Step 3: 为类别创建相关FAQ内容 (generate-faqs)
 * 
 * 使用方法:
 *   node scripts/manage-categories.js workflow [options]     # 完整工作流程
 *   node scripts/manage-categories.js categorize [options]   # 仅分类商店
 *   node scripts/manage-categories.js images [options]       # 仅生成图片
 *   node scripts/manage-categories.js faqs [options]         # 仅生成FAQ
 *   node scripts/manage-categories.js status                 # 系统状态检查
 * 
 * Environment Variables Required:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   OPENROUTER_API_KEY (for AI categorization and FAQ generation)
 *   REPLICATE_API_TOKEN (for image generation)
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT
 * 
 * @author CouponMia Development Team
 * @version 2.0.0
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const Replicate = require('replicate');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// ==========================================
// 🔧 SYSTEM CONFIGURATION
// ==========================================

const CONFIG = {
  // API Rate Limiting
  delays: {
    openai: 3000,      // 3s between OpenAI calls
    replicate: 5000,   // 5s between Replicate calls
    database: 500      // 0.5s between DB operations
  },
  
  // Batch Processing
  batches: {
    stores: 10,        // Store categorization batch size
    aiAnalysis: 5,     // AI analysis batch size
    images: 1,         // Image generation (sequential)
    faqs: 1           // FAQ generation (sequential)
  },
  
  // Quality Control
  retries: {
    ai: 3,            // Max AI API retries
    image: 2,         // Max image generation retries
    database: 3       // Max database operation retries
  }
};

// ==========================================
// 🌐 CLIENT INITIALIZATION
// ==========================================

// Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// OpenAI Client (via OpenRouter)
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://couponmia.com',
    'X-Title': 'CouponMia Category Management'
  }
});

// Replicate Client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

// Cloudflare R2 Client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

// ==========================================
// 🏗️ CORE CATEGORY MANAGEMENT CLASS
// ==========================================

class CategoryManagementSystem {
  constructor() {
    this.stats = {
      storesProcessed: 0,
      storesCategorized: 0,
      imagesGenerated: 0,
      faqsCreated: 0,
      errors: 0,
      startTime: Date.now()
    };
    
    // Predefined category system
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
    
    // Category-specific templates
    this.categoryTemplates = this.initializeCategoryTemplates();
    this.imagePromptStyles = this.initializeImagePromptStyles();
    this.faqTemplates = this.initializeFAQTemplates();
  }

  // ==========================================
  // 📊 SYSTEM STATUS & VALIDATION
  // ==========================================

  async checkSystemStatus() {
    console.log('\n🔍 =========================');
    console.log('🔍 SYSTEM STATUS CHECK');
    console.log('🔍 =========================\n');
    
    const checks = {
      database: false,
      openai: false,
      replicate: false,
      r2Storage: false
    };
    
    // Database connectivity
    try {
      const { data, error } = await supabase.from('categories').select('count').limit(1);
      checks.database = !error;
      console.log(`📦 Database: ${checks.database ? '✅ Connected' : '❌ Failed'}`);
    } catch (error) {
      console.log('📦 Database: ❌ Connection failed');
    }
    
    // OpenAI API
    try {
      if (process.env.OPENROUTER_API_KEY) {
        checks.openai = true;
        console.log('🧠 OpenAI API: ✅ Key configured');
      } else {
        console.log('🧠 OpenAI API: ⚠️  Key missing');
      }
    } catch (error) {
      console.log('🧠 OpenAI API: ❌ Configuration failed');
    }
    
    // Replicate API
    try {
      if (process.env.REPLICATE_API_TOKEN) {
        checks.replicate = true;
        console.log('🎨 Replicate API: ✅ Token configured');
      } else {
        console.log('🎨 Replicate API: ⚠️  Token missing');
      }
    } catch (error) {
      console.log('🎨 Replicate API: ❌ Configuration failed');
    }
    
    // R2 Storage
    try {
      if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID) {
        checks.r2Storage = true;
        console.log('☁️  R2 Storage: ✅ Credentials configured');
      } else {
        console.log('☁️  R2 Storage: ⚠️  Credentials missing');
      }
    } catch (error) {
      console.log('☁️  R2 Storage: ❌ Configuration failed');
    }
    
    // Summary
    const readyCount = Object.values(checks).filter(Boolean).length;
    console.log(`\n📋 System Readiness: ${readyCount}/4 services ready`);
    
    if (readyCount < 4) {
      console.log('⚠️  Some services are not configured. Check environment variables.');
    } else {
      console.log('🎉 All systems ready for category management!');
    }
    
    return checks;
  }

  // ==========================================
  // 🏪 STORE CATEGORIZATION MODULE
  // ==========================================

  async categorizeStores(options = {}) {
    console.log('\n🏪 =========================');
    console.log('🏪 STORE CATEGORIZATION');
    console.log('🏪 =========================\n');
    
    const limit = options.limit || null;
    const useAI = options.ai !== false; // AI enabled by default
    const specificStore = options.store || null;
    
    try {
      let stores;
      
      if (specificStore) {
        stores = await this.getSpecificStore(specificStore);
      } else {
        stores = await this.getStoresWithOffers(limit);
      }
      
      console.log(`📊 Found ${stores.length} stores to categorize`);
      
      let processedCount = 0;
      let skippedCount = 0;
      
      // Process stores in batches
      for (let i = 0; i < stores.length; i += CONFIG.batches.stores) {
        const batch = stores.slice(i, i + CONFIG.batches.stores);
        console.log(`\n📦 Processing batch ${Math.floor(i / CONFIG.batches.stores) + 1}/${Math.ceil(stores.length / CONFIG.batches.stores)}`);
        
        const beforeCategorized = this.stats.storesCategorized;
        
        if (useAI) {
          await this.categorizeBatchWithAI(batch);
        } else {
          await this.categorizeBatchWithFallback(batch);
        }
        
        const afterCategorized = this.stats.storesCategorized;
        const batchCategorized = afterCategorized - beforeCategorized;
        const batchSkipped = batch.length - batchCategorized;
        
        processedCount += batch.length;
        skippedCount += batchSkipped;
        
        // Rate limiting
        if (i + CONFIG.batches.stores < stores.length) {
          console.log(`⏱️  Waiting ${CONFIG.delays.openai / 1000}s before next batch...`);
          await this.delay(CONFIG.delays.openai);
        }
      }
      
      console.log(`\n✅ Store categorization completed!`);
      console.log(`   📊 Processed: ${processedCount} stores`);  
      console.log(`   ✅ Categorized: ${this.stats.storesCategorized} stores`);
      console.log(`   ⏭️  Skipped: ${skippedCount} stores (only 'Other' category)`);
      this.stats.storesProcessed += processedCount;
      
    } catch (error) {
      console.error('❌ Error in store categorization:', error);
      this.stats.errors++;
      throw error;
    }
  }

  async getStoresWithOffers(limit = null) {
    let query = supabase
      .from('stores')
      .select('id, name, website, description')
      .gt('active_offers_count', 0)
      .order('active_offers_count', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // console.log('🔍 Sample store data:', data?.slice(0, 1)); // Debug log
    return data || [];
  }

  async getSpecificStore(storeName) {
    const { data, error } = await supabase
      .from('stores')
      .select('id, name, website, description')
      .ilike('name', `%${storeName}%`);
    
    if (error) throw error;
    return data || [];
  }

  async categorizeBatchWithAI(stores) {
    const storeDescriptions = stores.map(store => ({
      id: store.id,
      name: store.name,
      website: store.website,
      description: store.description || ''
    }));
    
    try {
      const prompt = this.generateCategorizationPrompt(storeDescriptions);
      const response = await this.callOpenAI(prompt);
      const categories = this.parseCategorizationResponse(response);
      
      await this.updateStoreCategories(categories);
      
    } catch (error) {
      console.error('AI categorization failed, using fallback:', error);
      await this.categorizeBatchWithFallback(stores);
    }
  }

  generateCategorizationPrompt(stores) {
    return `Analyze these stores and categorize them into one of these categories: ${this.predefinedCategories.join(', ')}.

Stores to analyze:
${stores.map(store => `- ID: ${store.id}, Name: ${store.name}, Website: ${store.website}, Description: ${store.description || 'N/A'}`).join('\n')}

Return a JSON array with this exact format (use the actual UUID provided for each store):
[
  {"store_id": "actual-uuid-from-above", "categories": ["Primary Category", "Secondary Category"]},
  ...
]

IMPORTANT:
- Use the exact UUID provided for each store (e.g., "${stores[0]?.id}")
- Each store should have 1-2 categories maximum
- Choose the most specific category first, then broader if needed
- If a store only fits "Other" category, DO NOT include it in the response
- Only return stores that can be meaningfully categorized`;
  }

  // ==========================================
  // 🎨 IMAGE GENERATION MODULE
  // ==========================================

  async generateCategoryImages(options = {}) {
    console.log('\n🎨 =========================');
    console.log('🎨 CATEGORY IMAGE GENERATION');
    console.log('🎨 =========================\n');
    
    const specificCategory = options.category || null;
    const regenerate = options.force || false;
    
    try {
      let categories;
      
      if (specificCategory) {
        categories = await this.getSpecificCategory(specificCategory);
      } else {
        categories = await this.getCategoriesForImageGeneration(regenerate);
      }
      
      console.log(`📊 Found ${categories.length} categories for image generation`);
      
      // Process categories sequentially (image generation is resource-intensive)
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        console.log(`\n🎨 Processing category ${i + 1}/${categories.length}: ${category.name}`);
        
        try {
          const imageUrl = await this.generateCategoryImage(category);
          if (imageUrl) {
            await this.updateCategoryImage(category.id, imageUrl);
            this.stats.imagesGenerated++;
            console.log(`✅ Generated image for ${category.name}: ${imageUrl}`);
          }
        } catch (error) {
          console.error(`❌ Failed to generate image for ${category.name}:`, error);
          this.stats.errors++;
        }
        
        // Rate limiting
        if (i < categories.length - 1) {
          console.log(`⏱️  Waiting ${CONFIG.delays.replicate / 1000}s before next image...`);
          await this.delay(CONFIG.delays.replicate);
        }
      }
      
      console.log(`\n✅ Image generation completed! Generated ${this.stats.imagesGenerated} images.`);
      
    } catch (error) {
      console.error('❌ Error in image generation:', error);
      this.stats.errors++;
      throw error;
    }
  }

  async getCategoriesForImageGeneration(regenerate = false) {
    let query = supabase.from('categories').select('*').order('name');
    
    if (!regenerate) {
      query = query.is('image', null); // Only categories without images
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  }

  async generateCategoryImage(category) {
    const styleDescription = this.imagePromptStyles[category.slug] || 
      `${category.name.toLowerCase()} related products, modern commercial style`;
    
    const prompt = `A professional, modern banner image representing ${category.name} category. 
${styleDescription}. 
High quality, commercial photography style, clean composition, modern aesthetic, 
suitable for e-commerce website banner. 16:9 aspect ratio, vibrant colors.`;
    
    console.log(`🎨 Generating image for "${category.name}" with prompt style: ${styleDescription}`);
    
    try {
      const output = await replicate.run("black-forest-labs/flux-schnell", {
        input: {
          prompt: prompt,
          width: 1280,
          height: 720,
          num_outputs: 1,
          guidance_scale: 3.5,
          num_inference_steps: 4
        }
      });
      
      const imageUrl = Array.isArray(output) ? output[0] : output;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from Replicate');
      }
      
      // Upload to R2 and return public URL
      const publicUrl = await this.uploadImageToR2(imageUrl, category.slug);
      return publicUrl;
      
    } catch (error) {
      console.error(`Image generation failed for ${category.name}:`, error);
      return null;
    }
  }

  async uploadImageToR2(imageUrl, categorySlug) {
    try {
      // Download image
      const response = await fetch(imageUrl);
      const imageBuffer = Buffer.from(await response.arrayBuffer());
      
      // Upload to R2
      const key = `categories/${categorySlug}-banner.webp`;
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: imageBuffer,
        ContentType: 'image/webp'
      });
      
      await r2Client.send(command);
      
      // Return public URL
      // Check if R2_ENDPOINT already includes protocol
      const baseUrl = process.env.R2_ENDPOINT.startsWith('http') 
        ? process.env.R2_ENDPOINT 
        : `https://${process.env.R2_ENDPOINT}`;
      return `${baseUrl}/${key}`;
      
    } catch (error) {
      console.error('R2 upload failed:', error);
      return null;
    }
  }

  // ==========================================
  // ❓ ENHANCED FAQ GENERATION MODULE
  // ==========================================

  async generateCategoryFAQs(options = {}) {
    console.log('\n❓ =========================');
    console.log('❓ ENHANCED FAQ GENERATION');
    console.log('❓ =========================\n');
    
    const specificCategory = options.category || null;
    const useAI = options.ai !== false; // Default to AI enabled
    const force = options.force || false;
    const limit = options.limit || null;
    
    try {
      console.log('🚀 Using Enhanced FAQ Generation System v2.0');
      console.log('📋 Content modules: FAQs, About, Applications, Tools, Tips');
      
      let categories;
      
      if (specificCategory) {
        categories = await this.getSpecificCategory(specificCategory);
      } else {
        categories = await this.getCategoriesForFAQGeneration(limit);
      }
      
      console.log(`📊 Found ${categories.length} categories for enhanced FAQ generation`);
      
      // Process categories sequentially  
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        console.log(`\n❓ Processing category ${i + 1}/${categories.length}: ${category.name}`);
        
        try {
          const faqsCreated = await this.generateEnhancedFAQsForCategory(category, useAI, force);
          this.stats.faqsCreated += faqsCreated;
          console.log(`✅ Created ${faqsCreated} enhanced FAQ items for ${category.name}`);
        } catch (error) {
          console.error(`❌ Failed to generate enhanced FAQs for ${category.name}:`, error);
          this.stats.errors++;
        }
        
        // Rate limiting for AI requests
        if (i < categories.length - 1) {
          const delay = useAI ? CONFIG.delays.ai : CONFIG.delays.database;
          console.log(`⏱️  Waiting ${delay / 1000}s before next category...`);
          await this.delay(delay);
        }
      }
      
      console.log(`\n✅ Enhanced FAQ generation completed! Created ${this.stats.faqsCreated} FAQ items.`);
      
    } catch (error) {
      console.error('❌ Error in enhanced FAQ generation:', error);
      this.stats.errors++;
      throw error;
    }
  }

  async getCategoriesForFAQGeneration(limit = null) {
    // Get categories that don't have FAQs yet
    let query = supabase
      .from('categories')
      .select(`
        *,
        category_faqs!inner(count)
      `)
      .order('name');
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) {
      // Fallback: get all categories if the join fails
      const { data: allCategories } = await supabase.from('categories').select('*').order('name');
      return allCategories || [];
    }
    
    // Filter categories with < 5 FAQs
    return (data || []).filter(category => !category.category_faqs || category.category_faqs.length < 5);
  }

  async generateEnhancedFAQsForCategory(category, useAI = true, force = false) {
    // Check if enhanced content already exists
    if (!force) {
      const { data: existingFaqs } = await supabase
        .from('category_faqs')
        .select('id, content_type')
        .eq('category_id', category.id)
        .eq('is_active', true);
      
      const hasEnhancedContent = existingFaqs?.some(faq => 
        (faq.content_type === 'content') || (existingFaqs.length >= 8)
      );
      
      if (hasEnhancedContent) {
        console.log(`⏭️  Category ${category.name} already has enhanced content. Skipping...`);
        return 0;
      }
    }
    
    let faqContent = null;
    
    if (useAI) {
      // Try AI generation first
      try {
        console.log(`🤖 Generating AI-powered enhanced content for ${category.name}...`);
        faqContent = await this.generateEnhancedFAQsWithAI(category);
      } catch (error) {
        console.log(`⚠️  AI generation failed for ${category.name}, using fallback templates`);
      }
    }
    
    // Fallback to templates if AI failed or not requested
    if (!faqContent) {
      console.log(`📋 Using fallback templates for ${category.name}...`);
      faqContent = this.generateEnhancedFallbackContent(category);
    }
    
    // Save enhanced content
    return await this.saveEnhancedFAQContent(category, faqContent);
  }

  // ==========================================
  // 🔄 COMPLETE WORKFLOW ORCHESTRATION
  // ==========================================

  async runCompleteWorkflow(options = {}) {
    console.log('\n🚀 =================================');
    console.log('🚀 CATEGORY MANAGEMENT WORKFLOW');
    console.log('🚀 =================================\n');
    
    const startTime = Date.now();
    this.stats.startTime = startTime;
    
    try {
      // Step 1: System status check
      console.log('📋 Step 1: System Status Check');
      const systemCheck = await this.checkSystemStatus();
      
      // Step 2: Store categorization
      if (systemCheck.database && systemCheck.openai) {
        console.log('\n📋 Step 2: Store Categorization');
        await this.categorizeStores(options);
      } else {
        console.log('\n⏭️  Step 2: Skipped - Missing dependencies');
      }
      
      // Step 3: Image generation
      if (systemCheck.database && systemCheck.replicate && systemCheck.r2Storage) {
        console.log('\n📋 Step 3: Category Image Generation');
        await this.generateCategoryImages(options);
      } else {
        console.log('\n⏭️  Step 3: Skipped - Missing dependencies');
      }
      
      // Step 4: FAQ generation
      if (systemCheck.database) {
        console.log('\n📋 Step 4: Category FAQ Generation');
        await this.generateCategoryFAQs(options);
      } else {
        console.log('\n⏭️  Step 4: Skipped - Missing dependencies');
      }
      
      // Final report
      this.generateFinalReport(startTime);
      
    } catch (error) {
      console.error('\n❌ Workflow failed:', error);
      this.stats.errors++;
      throw error;
    }
  }

  generateFinalReport(startTime) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    console.log('\n📊 =========================');
    console.log('📊 WORKFLOW COMPLETION REPORT');
    console.log('📊 =========================\n');
    
    console.log(`⏱️  Total Duration: ${duration}s`);
    console.log(`🏪 Stores Processed: ${this.stats.storesProcessed}`);
    console.log(`📂 Stores Categorized: ${this.stats.storesCategorized}`);
    console.log(`🎨 Images Generated: ${this.stats.imagesGenerated}`);
    console.log(`❓ FAQs Created: ${this.stats.faqsCreated}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    
    if (this.stats.errors === 0) {
      console.log('\n🎉 All operations completed successfully!');
    } else {
      console.log('\n⚠️  Some operations failed. Check logs above for details.');
    }
  }

  // ==========================================
  // 🛠️ UTILITY METHODS
  // ==========================================

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async callOpenAI(prompt, retries = CONFIG.retries.ai, useOnlineSearch = false) {
    try {
      const requestBody = {
        model: useOnlineSearch ? "openai/gpt-4o:online" : "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides accurate information about product categories and shopping deals."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      };

      // Add online search plugins if requested
      if (useOnlineSearch) {
        requestBody.plugins = [{
          id: "web",
          max_results: 3,
          search_prompt: "Latest information about brands, companies, and tools"
        }];
      }

      const response = await openai.chat.completions.create(requestBody);
      
      return response.choices[0].message.content.trim();
    } catch (error) {
      if (retries > 0) {
        console.log(`⚠️  OpenAI call failed, retrying... (${retries} attempts left)`);
        await this.delay(2000);
        return this.callOpenAI(prompt, retries - 1, useOnlineSearch);
      }
      throw error;
    }
  }

  // Template initialization methods (simplified for space)
  initializeCategoryTemplates() {
    return {
      'technology': ['Electronics & Tech'],
      'fashion': ['Fashion & Apparel'],
      'food': ['Food & Dining'],
      'travel': ['Travel & Hospitality'],
      'health': ['Health & Beauty'],
      'home': ['Home & Garden'],
      'sports': ['Sports & Outdoors'],
      'automotive': ['Automotive'],
      'software': ['Software & Services'],
      'ai-software': ['AI Software']
    };
  }

  initializeImagePromptStyles() {
    return {
      'ai-software': 'futuristic AI interfaces, neural networks, machine learning visualizations',
      'technology': 'modern gadgets, smartphones, laptops, tech devices',
      'fashion': 'stylish clothing, fashion models, trendy outfits',
      'food-dining': 'delicious food, restaurant ambiance, culinary presentation',
      'travel': 'exotic destinations, luggage, travel scenes',
      'health-beauty': 'wellness products, skincare, beauty items'
    };
  }

  initializeFAQTemplates() {
    return {
      generic: [
        {
          question: "How can I find the best {category} deals?",
          answer: "Browse our curated collection of {category} coupons and deals. We update our offers daily and verify each code to ensure they work."
        },
        {
          question: "Are {category} coupon codes verified?",
          answer: "Yes! Our team verifies all {category} coupon codes regularly. We remove expired codes and mark working deals."
        }
      ]
    };
  }

  async getSpecificCategory(categorySlug) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', categorySlug);
    
    if (error) throw error;
    return data || [];
  }

  parseCategorizationResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.log('🔍 Raw AI response:', response);
      return [];
    }
  }

  async updateStoreCategories(categories) {
    for (const categoryData of categories) {
      try {
        // Find or create categories (skip 'Other' category)
        const categoryNames = categoryData.categories.filter(name => 
          name && name.toLowerCase() !== 'other'
        );
        
        if (categoryNames.length === 0) {
          console.log(`⏭️  Skipping store ${categoryData.store_id}: only 'Other' category assigned`);
          continue;
        }
        
        for (const categoryName of categoryNames) {
          await this.assignStoreToCategory(categoryData.store_id, categoryName);
        }
        this.stats.storesCategorized++;
      } catch (error) {
        console.error(`Failed to update categories for store ${categoryData.store_id}:`, error);
        this.stats.errors++;
      }
    }
  }

  async assignStoreToCategory(storeId, categoryName) {
    // Find or create category
    let { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();

    if (!category) {
      // Create category if it doesn't exist
      const slug = categoryName.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');

      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({ name: categoryName, slug })
        .select('id')
        .single();

      if (error) {
        console.error(`Failed to create category ${categoryName}:`, error);
        return;
      }
      category = newCategory;
    }

    // Assign store to category
    const { error } = await supabase
      .from('store_categories')
      .upsert({ 
        store_id: storeId, 
        category_id: category.id 
      }, { 
        onConflict: 'store_id,category_id' 
      });

    if (error) {
      console.error(`Failed to assign store to category:`, error);
    }
  }

  async categorizeBatchWithFallback(stores) {
    for (const store of stores) {
      try {
        // Simple keyword-based categorization
        const categories = this.categorizeByKeywords(store.name, store.website, store.description)
          .filter(name => name && name.toLowerCase() !== 'other');
        
        if (categories.length === 0) {
          console.log(`⏭️  Skipping store ${store.name}: only 'Other' category from fallback`);
          continue;
        }
        
        for (const categoryName of categories) {
          await this.assignStoreToCategory(store.id, categoryName);
        }
        
        this.stats.storesCategorized++;
      } catch (error) {
        console.error(`Fallback categorization failed for ${store.name}:`, error);
        this.stats.errors++;
      }
    }
  }

  categorizeByKeywords(name, website, description) {
    const text = `${name} ${website} ${description}`.toLowerCase();
    
    const keywords = {
      'Fashion & Apparel': ['fashion', 'clothing', 'apparel', 'shoes', 'dress', 'shirt', 'pants'],
      'Electronics & Tech': ['tech', 'electronic', 'computer', 'phone', 'laptop', 'gadget'],
      'Health & Beauty': ['health', 'beauty', 'cosmetic', 'skincare', 'wellness', 'pharmacy'],
      'Food & Dining': ['food', 'restaurant', 'dining', 'delivery', 'kitchen', 'recipe'],
      'Travel & Hospitality': ['travel', 'hotel', 'flight', 'vacation', 'booking', 'tourism'],
      'Home & Garden': ['home', 'garden', 'furniture', 'decor', 'kitchen', 'bedroom'],
      'Sports & Outdoors': ['sport', 'outdoor', 'fitness', 'exercise', 'athletic', 'gym'],
      'Automotive': ['car', 'auto', 'vehicle', 'parts', 'repair', 'automotive'],
      'AI Software': ['ai', 'artificial intelligence', 'machine learning', 'neural'],
      'Software & Services': ['software', 'app', 'service', 'tool', 'platform', 'saas']
    };

    const matches = [];
    for (const [category, terms] of Object.entries(keywords)) {
      if (terms.some(term => text.includes(term))) {
        matches.push(category);
      }
    }

    return matches.length > 0 ? matches.slice(0, 2) : ['Other'];
  }

  async updateCategoryImage(categoryId, imageUrl) {
    const { error } = await supabase
      .from('categories')
      .update({ image: imageUrl })
      .eq('id', categoryId);

    if (error) {
      throw new Error(`Failed to update category image: ${error.message}`);
    }
  }

  async generateEnhancedFAQsWithAI(category) {
    const prompt = `Generate comprehensive, category-specific content for the "${category.name}" category on CouponMia.com.

    IMPORTANT: Research and use ONLY brands, companies, and tools that are ACTUALLY relevant to ${category.name}. 
    Do NOT use generic retailers like Amazon/Walmart unless they are specifically major players in ${category.name}.

    Category: ${category.name}

    Create 5 content modules with category-specific information:
    1. FAQ - Traditional Q&A about deals and coupons for ${category.name}
    2. About - What ${category.name} encompasses, ACTUAL major brands in this space
    3. Applications - Real-world use cases with companies that ACTUALLY use ${category.name}
    4. Tools - Apps/platforms SPECIFICALLY for ${category.name} (not generic shopping tools)
    5. Tips - Money-saving strategies SPECIFIC to ${category.name} purchases

    Research Requirements:
    - For ${category.name}, identify the ACTUAL major brands, companies, and market leaders
    - Find REAL tools, apps, and platforms that are specifically designed for ${category.name}
    - Mention only companies that genuinely operate in the ${category.name} space
    - If ${category.name} is "AI Software", mention OpenAI, Microsoft Azure AI, Google AI, etc. - NOT Walmart
    - If ${category.name} is "Fashion", mention Nike, Zara, H&M, etc. - be category-specific

    Return JSON with this exact structure:
    {
      "faq": [
        {"question": "How can I find the best ${category.name} deals?", "answer": "Category-specific answer with relevant brands and steps"}
      ],
      "about": {
        "content": "What ${category.name} really encompasses. Mention the ACTUAL major companies in this field (research current market leaders). Include market size, growth trends, and key industry players that are genuinely relevant to ${category.name}. Write 2-3 informative paragraphs."
      },
      "applications": {
        "content": "How ${category.name} is actually used by different types of organizations. Include specific examples with companies that REALLY use ${category.name} products/services. Cover different use cases and market segments that are genuinely relevant. Write 2-3 paragraphs with real examples."
      },
      "tools": {
        "content": "Apps, platforms, and tools that are SPECIFICALLY designed for ${category.name}. Research and mention actual tools that ${category.name} users would use. Include specialized platforms, comparison sites, and apps that are relevant to this category. Write 2-3 paragraphs about category-specific tools."
      },
      "tips": {
        "content": "Money-saving strategies that are specifically effective for ${category.name} purchases. Include timing advice, comparison methods, and deal-finding techniques that work well for this particular category. Mention any category-specific discount patterns or seasonal trends. Write 2-3 paragraphs with actionable advice."
      }
    }

    Requirements:
    - Research current information about ${category.name} industry
    - Use only genuinely relevant brand names and companies
    - Be specific to ${category.name} - avoid generic retail mentions
    - Each section should be 200-300 words
    - Focus on category-specific, useful information
    - Write in an authoritative, knowledgeable tone`;

    try {
      const response = await this.callOpenAI(prompt, CONFIG.retries.ai, true); // Enable online search
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      return JSON.parse(jsonMatch[0]);
      
    } catch (error) {
      console.error(`Enhanced AI FAQ generation failed for ${category.name}:`, error);
      throw error;
    }
  }

  generateEnhancedFallbackContent(category) {
    return {
      faq: [
        {
          question: `How can I find the best ${category.name} deals?`,
          answer: `Browse our curated collection of ${category.name} coupons and deals. Check major retailers like Amazon, Walmart, and Target for seasonal sales. Use price comparison tools like Google Shopping and sign up for store newsletters to receive exclusive offers first.`
        },
        {
          question: `Are ${category.name} coupon codes verified?`,
          answer: `Yes! Our team verifies all ${category.name} coupon codes regularly using automated testing systems. We partner with retailers to ensure accuracy and remove expired codes immediately. If a code doesn't work, please report it for instant updates.`
        },
        {
          question: `How often do you add new ${category.name} deals?`,
          answer: `We add new ${category.name} deals multiple times daily through automated monitoring of major retailers. Our system tracks price changes, new promotions, and flash sales across platforms like Amazon, Best Buy, and other top merchants.`
        }
      ],
      about: {
        content: `${category.name} represents a specialized market segment with its own unique characteristics and leading companies. This category encompasses various products and services that cater to specific consumer needs and industry requirements. The market has evolved significantly with technological advances and changing consumer preferences. Industry leaders continue to innovate while new players enter the market with fresh approaches. Growth trends vary based on seasonal patterns, technological developments, and consumer demand shifts within this particular category.`
      },
      applications: {
        content: `${category.name} serves various use cases across different market segments and industries. Organizations utilize these products and services to meet specific operational needs, enhance efficiency, and deliver value to their customers. The applications range from individual consumer use to enterprise-level implementations, each with distinct requirements and benefits. Different industries adopt ${category.name} solutions based on their unique challenges and opportunities. The versatility of offerings in this category makes it suitable for diverse applications, from small-scale personal use to large-scale commercial deployments.`
      },
      tools: {
        content: `Popular tools for ${category.name} include apps and platforms designed to maximize savings and streamline shopping. Honey provides automatic coupon application and price tracking, while Rakuten offers cashback rewards through their shopping portal. Capital One Shopping delivers price comparison and deal alerts, and RetailMeNot specializes in coupon codes and cashback offers. Browser extensions like the Honey extension automatically test coupons at checkout, Capital One Shopping provides real-time price comparisons, and InvisibleHand alerts users to better prices while browsing. Mobile apps such as Ibotta offer grocery and retail cashback rewards, Checkout51 enables mobile receipt scanning for rebates, and Flipp provides digital flyers and price matching tools.`
      },
      tips: {
        content: `Save money on ${category.name} purchases with proven timing strategies. Shop during major sales events like Black Friday, Cyber Monday, and end-of-season clearances for maximum savings. Use price tracking tools like Honey, CamelCamelCamel, and Keepa to identify optimal purchase timing, and monitor retailer cycles as many stores follow predictable markdown schedules. Combine multiple savings methods by stacking store coupons with manufacturer offers, using cashback apps like Rakuten, Ibotta, and TopCashback simultaneously, and layering credit card rewards with store promotions. Smart shopping tactics include comparing prices across Google Shopping, PriceGrabber, and Shopping.com, checking multiple retailers including Amazon, Best Buy, Walmart, and Target, setting up price alerts on apps like Honey and CamelCamelCamel, and following social media for exclusive flash sales and promo codes.`
      }
    };
  }

  async saveEnhancedFAQContent(category, content) {
    let totalSaved = 0;
    
    // Clear existing FAQs if force updating
    await supabase
      .from('category_faqs')
      .update({ is_active: false })
      .eq('category_id', category.id);
    
    let displayOrder = 1;
    
    try {
      // Save content sections FIRST (higher priority display)
      const sections = [
        { key: 'about', title: 'About {categoryName}', order: 1 },
        { key: 'applications', title: 'Applications of {categoryName} in Various Industries', order: 2 },
        { key: 'tools', title: 'Unique & Intriguing {categoryName} Apps/Tools', order: 3 },
        { key: 'tips', title: '{categoryName} Saving Tips & Tricks', order: 4 }
      ];
      
      for (const section of sections) {
        if (content[section.key] && content[section.key].content) {
          const { error } = await supabase
            .from('category_faqs')
            .insert({
              category_id: category.id,
              question: section.title.replace('{categoryName}', category.name),
              answer: content[section.key].content,
              display_order: section.order,
              content_type: 'content',
              section_title: section.title,
              is_active: true
            });
          
          if (!error) totalSaved++;
        }
      }

      // Save FAQ Q&A items LAST (lower priority display)
      if (content.faq && content.faq.length > 0) {
        let faqOrder = 10; // Start FAQ items at order 10 to ensure they appear after content sections
        for (const faq of content.faq) {
          const { error } = await supabase
            .from('category_faqs')
            .insert({
              category_id: category.id,
              question: faq.question,
              answer: faq.answer,
              display_order: faqOrder++,
              content_type: 'faq',
              section_title: 'Frequently Asked Questions',
              is_active: true
            });
          
          if (!error) totalSaved++;
        }
      }
      
      console.log(`💾 Saved ${totalSaved} enhanced FAQ items for ${category.name}`);
      return totalSaved;
      
    } catch (error) {
      console.error(`Failed to save enhanced FAQ content for ${category.name}:`, error);
      return 0;
    }
  }

  async generateFAQsWithAI(category, existingFaqs = []) {
    const existingQuestions = existingFaqs.map(faq => faq.question);
    
    const prompt = `Generate 5 unique, helpful FAQ questions and answers for the "${category.name}" category on a coupon website.

Category: ${category.name}
Avoid these existing questions: ${existingQuestions.join(', ')}

Requirements:
- Questions should be specific to ${category.name} deals/coupons
- Answers should be helpful and encourage engagement
- Each answer should be 1-3 sentences
- Focus on common customer concerns

Return JSON array:
[
  {
    "question": "Question text here",
    "answer": "Answer text here"
  }
]`;

    try {
      const response = await this.callOpenAI(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const faqs = JSON.parse(jsonMatch[0]);
      
      return faqs.map((faq, index) => ({
        category_id: category.id,
        question: faq.question,
        answer: faq.answer,
        display_order: (existingFaqs?.length || 0) + index + 1
      }));
      
    } catch (error) {
      console.error(`AI FAQ generation failed for ${category.name}:`, error);
      return [];
    }
  }

  generateFAQsFromTemplates(category, existingFaqs = []) {
    const templates = [
      {
        question: `How can I find the best ${category.name} deals?`,
        answer: `Browse our curated collection of ${category.name} coupons and deals. We update our offers daily and verify each code to ensure they work. Look for highlighted deals for the most savings.`
      },
      {
        question: `Are ${category.name} coupon codes verified?`,
        answer: `Yes! Our team verifies all ${category.name} coupon codes regularly. We remove expired codes and mark working deals. If a code doesn't work, please report it so we can update our listings.`
      },
      {
        question: `How often do you add new ${category.name} deals?`,
        answer: `We add new ${category.name} deals multiple times daily! Our automated system monitors retailers and adds verified offers as soon as they become available.`
      },
      {
        question: `Can I get notifications for new ${category.name} deals?`,
        answer: `Absolutely! Sign up for our email alerts to get notified when new ${category.name} deals are available. You can also bookmark this page and check back regularly for updates.`
      },
      {
        question: `What should I do if a ${category.name} coupon doesn't work?`,
        answer: `If a coupon code doesn't work, first check the expiration date and terms. Make sure you meet minimum purchase requirements. If it still doesn't work, please report it to us so we can verify and update the offer.`
      }
    ];

    return templates.slice(0, 5).map((template, index) => ({
      category_id: category.id,
      question: template.question,
      answer: template.answer,
      display_order: (existingFaqs?.length || 0) + index + 1
    }));
  }
}

// ==========================================
// 🚀 MAIN EXECUTION LOGIC
// ==========================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  // Parse options
  const options = {};
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--limit=')) options.limit = parseInt(arg.split('=')[1]);
    if (arg.startsWith('--category=')) options.category = arg.split('=')[1];
    if (arg.startsWith('--store=')) options.store = arg.split('=')[1];
    if (arg === '--ai') options.ai = true;
    if (arg === '--force') options.force = true;
  }
  
  const manager = new CategoryManagementSystem();
  
  try {
    switch (command) {
      case 'workflow':
        await manager.runCompleteWorkflow(options);
        break;
        
      case 'categorize':
        await manager.categorizeStores(options);
        break;
        
      case 'images':
        await manager.generateCategoryImages(options);
        break;
        
      case 'faqs':
        await manager.generateCategoryFAQs(options);
        break;
        
      case 'status':
        await manager.checkSystemStatus();
        break;
        
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('\n💥 Fatal Error:', error);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🚀 CouponMia Category Management System v2.0.0

COMMANDS:
  workflow          Run complete category management workflow
  categorize        Categorize stores into appropriate categories
  images           Generate category banner images
  faqs             Generate category FAQ content
  status           Check system status and configuration

OPTIONS:
  --limit=N        Limit number of items to process
  --category=slug  Process specific category only
  --store=name     Process specific store only (categorize command)
  --ai             Use AI for enhanced processing
  --force          Force regenerate existing content

EXAMPLES:
  node scripts/manage-categories.js workflow --limit=50 --ai
  node scripts/manage-categories.js categorize --store="Nike" --ai
  node scripts/manage-categories.js images --category=technology --force
  node scripts/manage-categories.js faqs --ai --limit=10
  node scripts/manage-categories.js status

ENVIRONMENT VARIABLES:
  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (required)
  OPENROUTER_API_KEY (for AI features)
  REPLICATE_API_TOKEN (for image generation)
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT (for image storage)
`);
}

// Execute if called directly
if (require.main === module) {
  main();
}

module.exports = { CategoryManagementSystem };