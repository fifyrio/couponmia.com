#!/usr/bin/env node

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// Supabase配置
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// OpenRouter配置
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://couponmia.com',
    'X-Title': 'CouponMia.com',
  },
});

class FAQGenerator {
  constructor() {
    this.batchSize = 10; // 每批处理的商家数量
    this.delayBetweenRequests = 2000; // API请求间隔
  }

  // FAQ模板，按商家类型分类
  getFAQTemplates() {
    return {
      // 通用优惠券问题（适用所有商家）
      coupon_general: [
        "I'm Not Sure How To Activate My [Store] Promo Codes, Can You Help?",
        "Why Don't The [Store] Promo Codes Work?",
        "How To Get More [Store] Promo Codes?",
        "Are The [Store] Promo Codes Tested?",
        "Is There A Limit To How Many [Store] Promo Codes I Can Use?",
        "How Do I Go About Activating My [Store] Discount Codes?",
        "Could You Clarify Why The [Store] Discount Codes Don't Work?",
        "Want To Increase Your [Store] Discount Codes Stash?",
        "Are [Store] Discount Codes Checked For Validity?",
        "Do I Have To Choose Between [Store] Discount Codes?"
      ],
      
      // 电商/购物类
      ecommerce: [
        "What payment methods does [Store] accept?",
        "What is [Store]'s return and refund policy?",
        "How long does [Store] shipping take?",
        "Does [Store] offer free shipping?",
        "How can I track my [Store] order?",
        "What should I do if my [Store] order is delayed?",
        "Does [Store] have a customer loyalty program?",
        "Can I modify or cancel my [Store] order after placing it?"
      ],
      
      // 服务类（出租车、酒店等）
      service: [
        "What areas does [Store] cover for their services?",
        "How can I book with [Store]?",
        "What payment methods does [Store] accept?",
        "Is there a cancellation policy if my plans change?",
        "Can I schedule services in advance with [Store]?",
        "What measures is [Store] taking for customer safety?",
        "Does [Store] offer services for special occasions or events?",
        "How do I contact [Store] customer support?"
      ],
      
      // 科技/软件类
      tech: [
        "What devices are compatible with [Store]?",
        "Does [Store] offer technical support?",
        "What is [Store]'s software update policy?",
        "How do I set up my [Store] account?",
        "What security measures does [Store] implement?",
        "Does [Store] offer training or tutorials?",
        "What happens if I encounter technical issues with [Store]?",
        "Does [Store] provide data backup services?"
      ]
    };
  }

  // 根据商家名称和描述判断类型
  categorizeStore(store) {
    const name = store.name.toLowerCase();
    const description = (store.description || '').toLowerCase();
    const category = (store.category || '').toLowerCase();
    
    // 服务类关键词
    const serviceKeywords = ['taxi', 'cab', 'ride', 'hotel', 'travel', 'booking', 'transport', 'delivery', 'restaurant'];
    // 科技类关键词  
    const techKeywords = ['software', 'app', 'tech', 'digital', 'cloud', 'saas', 'platform', 'system'];
    
    const text = `${name} ${description} ${category}`;
    
    if (serviceKeywords.some(keyword => text.includes(keyword))) {
      return 'service';
    } else if (techKeywords.some(keyword => text.includes(keyword))) {
      return 'tech';
    } else {
      return 'ecommerce'; // 默认为电商类
    }
  }

  // 使用AI生成FAQ答案
  async generateFAQAnswers(storeName, questions, storeInfo) {
    const prompt = `You are a helpful assistant generating FAQ answers for "${storeName}". 

Store Information:
- Name: ${storeName}
- Description: ${storeInfo.description || 'Online store'}
- Category: ${storeInfo.category || 'General'}
- Website: ${storeInfo.website || 'N/A'}

Please provide helpful, professional answers for the following questions. Each answer should be 2-3 sentences and specific to ${storeName} when possible. If you don't have specific information about the store, provide general helpful guidance that would apply to most stores of this type.

Questions and answers should be in the format:
Q: [question]
A: [answer]

Questions:
${questions.map((q, i) => `${i + 1}. ${q.replace(/\[Store\]/g, storeName)}`).join('\n')}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful customer service assistant that provides clear, professional, and informative answers to frequently asked questions about online stores and services.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error(`AI生成FAQ失败 ${storeName}:`, error.message);
      return null;
    }
  }

  // 解析AI返回的FAQ内容
  parseFAQResponse(response, questions, storeName) {
    if (!response) return [];

    const faqs = [];
    const lines = response.split('\n');
    let currentQ = '';
    let currentA = '';
    let isAnswer = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('Q:')) {
        // 保存上一个FAQ
        if (currentQ && currentA) {
          faqs.push({
            question: currentQ.replace(/^Q:\s*/, '').trim(),
            answer: currentA.replace(/^A:\s*/, '').trim()
          });
        }
        
        currentQ = trimmedLine;
        currentA = '';
        isAnswer = false;
      } else if (trimmedLine.startsWith('A:')) {
        currentA = trimmedLine;
        isAnswer = true;
      } else if (isAnswer && trimmedLine) {
        currentA += ' ' + trimmedLine;
      }
    }

    // 添加最后一个FAQ
    if (currentQ && currentA) {
      faqs.push({
        question: currentQ.replace(/^Q:\s*/, '').trim(),
        answer: currentA.replace(/^A:\s*/, '').trim()
      });
    }

    // 如果解析失败，使用默认答案
    if (faqs.length === 0) {
      return questions.map((q, i) => ({
        question: q.replace(/\[Store\]/g, storeName),
        answer: `Please contact ${storeName} customer service for specific information about this question.`
      }));
    }

    return faqs;
  }

  // 为单个商家生成FAQ
  async generateStoreFAQs(store) {
    console.log(`为商家 ${store.name} 生成FAQ...`);

    const storeType = this.categorizeStore(store);
    const templates = this.getFAQTemplates();
    
    // 合并通用优惠券问题和特定类型问题
    const questions = [
      ...templates.coupon_general.slice(0, 6), // 选择6个通用优惠券问题
      ...templates[storeType].slice(0, 6) // 选择6个特定类型问题
    ];

    // 使用AI生成答案
    const aiResponse = await this.generateFAQAnswers(store.name, questions, {
      description: store.description,
      category: store.category,
      website: store.website
    });

    // 解析AI返回的内容
    const faqs = this.parseFAQResponse(aiResponse, questions, store.name);

    // 保存到数据库
    let savedCount = 0;
    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i];
      
      try {
        const { error } = await supabase
          .from('faqs')
          .insert({
            store_id: store.id,
            question: faq.question,
            answer: faq.answer,
            display_order: i + 1,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error(`保存FAQ失败 ${store.name}:`, error.message);
        } else {
          savedCount++;
        }
      } catch (error) {
        console.error(`保存FAQ异常 ${store.name}:`, error);
      }
    }

    console.log(`✅ ${store.name}: 生成${faqs.length}个FAQ，保存${savedCount}个`);
    return { generated: faqs.length, saved: savedCount };
  }

  // 批量处理所有商家
  async generateAllFAQs(limit = null) {
    console.log('开始为有活跃优惠券的商家批量生成FAQ...');

    // 获取没有FAQ且有活跃优惠券的商家
    let query = supabase
      .from('stores')
      .select(`
        id, 
        name, 
        description, 
        category, 
        website,
        active_offers_count,
        faqs!left(count)
      `)
      .gt('active_offers_count', 0) // 只处理有活跃优惠券的商家
      .order('name');
    
    if (limit) {
      query = query.limit(limit);
    }

    const { data: stores, error } = await query;

    if (error) {
      console.error('获取商家列表失败:', error);
      return;
    }

    // 过滤出没有FAQ的商家
    const storesWithoutFAQs = stores.filter(store => 
      !store.faqs || store.faqs.length === 0 || store.faqs[0]?.count === 0
    );

    console.log(`找到${storesWithoutFAQs.length}个需要生成FAQ的商家`);

    let totalGenerated = 0;
    let totalSaved = 0;
    let processedCount = 0;

    for (const store of storesWithoutFAQs) {
      try {
        const result = await this.generateStoreFAQs(store);
        totalGenerated += result.generated;
        totalSaved += result.saved;
        processedCount++;

        // API请求限制延迟
        if (processedCount % this.batchSize === 0) {
          console.log(`已处理 ${processedCount}/${storesWithoutFAQs.length} 个商家，休息一下...`);
          await new Promise(resolve => setTimeout(resolve, this.delayBetweenRequests * 2));
        } else {
          await new Promise(resolve => setTimeout(resolve, this.delayBetweenRequests));
        }

      } catch (error) {
        console.error(`处理商家 ${store.name} 失败:`, error);
      }
    }

    console.log('\n🎉 FAQ批量生成完成!');
    console.log(`📊 统计: 处理${processedCount}个商家，生成${totalGenerated}个FAQ，成功保存${totalSaved}个`);
  }

  // 重新生成特定商家的FAQ
  async regenerateStoreFAQs(storeId) {
    console.log(`重新生成商家ID ${storeId} 的FAQ...`);

    // 获取商家信息
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      console.error('获取商家信息失败:', storeError);
      return;
    }

    // 检查商家是否有活跃优惠券
    if (!store.active_offers_count || store.active_offers_count === 0) {
      console.log(`跳过商家 ${store.name}: 没有活跃优惠券`);
      return;
    }

    // 删除现有FAQ
    const { error: deleteError } = await supabase
      .from('faqs')
      .delete()
      .eq('store_id', storeId);

    if (deleteError) {
      console.error('删除现有FAQ失败:', deleteError);
      return;
    }

    // 生成新的FAQ
    const result = await this.generateStoreFAQs(store);
    console.log(`✅ 重新生成完成: ${result.generated}个FAQ，保存${result.saved}个`);
  }

  // 清理所有FAQ（危险操作）
  async clearAllFAQs() {
    console.log('⚠️  清理所有FAQ...');
    
    const { error } = await supabase
      .from('faqs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有记录

    if (error) {
      console.error('清理FAQ失败:', error);
    } else {
      console.log('✅ 所有FAQ已清理完成');
    }
  }
}

// 命令行执行
async function main() {
  const generator = new FAQGenerator();
  
  const command = process.argv[2] || 'generate';
  const param = process.argv[3];
  
  try {
    switch (command) {
      case 'generate':
        const limit = param ? parseInt(param) : null;
        await generator.generateAllFAQs(limit);
        break;
      case 'regenerate':
        if (!param) {
          console.error('请提供商家ID: node generate-store-faqs.js regenerate <store_id>');
          process.exit(1);
        }
        await generator.regenerateStoreFAQs(param);
        break;
      case 'clear':
        await generator.clearAllFAQs();
        break;
      case 'test':
        // 测试单个商家
        if (!param) {
          console.error('请提供商家ID: node generate-store-faqs.js test <store_id>');
          process.exit(1);
        }
        await generator.regenerateStoreFAQs(param);
        break;
      default:
        console.log(`
使用方法:
  node generate-store-faqs.js generate [limit]     # 为所有商家生成FAQ，可选限制数量
  node generate-store-faqs.js regenerate <id>      # 重新生成指定商家的FAQ  
  node generate-store-faqs.js test <id>            # 测试单个商家FAQ生成
  node generate-store-faqs.js clear                # 清理所有FAQ（危险）
        `);
        break;
    }
  } catch (error) {
    console.error('执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = FAQGenerator;