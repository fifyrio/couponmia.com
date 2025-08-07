#!/usr/bin/env node

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// API配置
const API_CONFIG = {
  baseUrl: 'http://api.brandreward.com',
  user: process.env.API_USER || 'support@offerslove.com',
  key: process.env.API_KEY || '0c75f311fd21aeb8c4cfd14d770bd7b3',
  outformat: 'json'
};

// Supabase配置 - 需要设置环境变量
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

class DataSyncService {
  constructor() {
    this.pageSize = 100; // 每页数据量
  }

  // 构建API URL
  buildApiUrl(action, page = 1) {
    const params = new URLSearchParams({
      act: action,
      user: API_CONFIG.user,
      key: API_CONFIG.key,
      outformat: API_CONFIG.outformat,
      page: page.toString()
    });
    
    // 为advertiser和content_feed接口添加pagesize参数
    if (action === 'advertiser.advertiser_list' || action === 'links.content_feed') {
      params.append('pagesize', '1000');
    }
    
    return `${API_CONFIG.baseUrl}?${params}`;
  }

  // 获取单页数据
  async fetchPage(action, page) {
    const url = this.buildApiUrl(action, page);
    console.log(`获取数据: ${action} - 第${page}页`);
    
    try {
      const response = await fetch(url);
      const text = await response.text();
      
      // 检查响应是否为有效的JSON
      if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
        console.error(`第${page}页返回非JSON格式:`, text.substring(0, 100));
        return null;
      }
      
      const data = JSON.parse(text);
      return data;
    } catch (error) {
      console.error(`获取第${page}页数据失败:`, error.message);
      return null;
    }
  }

  // 分页获取所有数据
  async fetchAllData(action) {
    let allData = [];
    let currentPage = 1;
    let totalPages = 1;
    let errorCount = 0;
    const maxErrors = 3; // 最多允许3次连续错误
    const isTestMode = process.env.TEST_MODE === 'true';

    do {
      const result = await this.fetchPage(action, currentPage);
      
      if (result && result.response && result.data) {
        totalPages = parseInt(result.response.PageTotal);
        allData = allData.concat(result.data);
        console.log(`已获取 ${allData.length} 条数据，共 ${totalPages} 页`);
        
        // 测试模式：只获取第一页
        if (isTestMode) {
          console.log('🧪 测试模式：只获取第一页数据');
          break;
        }
        
        currentPage++;
        errorCount = 0; // 成功后重置错误计数
      } else {
        errorCount++;
        console.error(`第${currentPage}页获取失败，错误次数: ${errorCount}/${maxErrors}`);
        
        if (errorCount >= maxErrors) {
          console.error(`连续${maxErrors}次错误，停止获取数据`);
          break;
        }
        
        // 有错误时也要继续下一页，可能只是某一页有问题
        currentPage++;
      }
      
      // 添加延迟避免API限流（测试模式下减少延迟）
      const delay = isTestMode ? 1000 : 10000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
    } while (currentPage <= totalPages);

    return allData;
  }

  // 生成URL友好的别名
  generateAlias(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // 计算商家热门程度
  calculatePopularity(advertiser, couponsCount = 0) {
    let score = 0;
    
    // 1. Logo质量评分 (0-25分)
    if (advertiser.Image && advertiser.Image !== '') {
      score += 25; // 有logo
      // 额外检查logo URL质量
      if (advertiser.Image.includes('https://') || advertiser.Image.includes('.png') || advertiser.Image.includes('.jpg')) {
        score += 5; // 高质量logo URL
      }
    }
    
    // 2. 促销数量评分 (0-30分)
    if (couponsCount >= 20) score += 30;
    else if (couponsCount >= 10) score += 25;
    else if (couponsCount >= 5) score += 20;
    else if (couponsCount >= 2) score += 15;
    else if (couponsCount >= 1) score += 10;
    
    // 3. 域名数量评分 (0-15分)
    const domainCount = Array.isArray(advertiser.Domains) ? advertiser.Domains.length : 0;
    if (domainCount >= 3) score += 15;
    else if (domainCount >= 2) score += 10;
    else if (domainCount >= 1) score += 5;
    
    // 4. 支持国家数量评分 (0-15分)
    const countryCount = Array.isArray(advertiser.Countries) ? advertiser.Countries.length : 0;
    if (countryCount >= 10) score += 15;
    else if (countryCount >= 5) score += 12;
    else if (countryCount >= 3) score += 8;
    else if (countryCount >= 1) score += 5;
    
    // 5. 佣金模式多样性评分 (0-10分)
    const commissionCount = Array.isArray(advertiser.CommissionModel) ? advertiser.CommissionModel.length : 0;
    if (commissionCount >= 3) score += 10;
    else if (commissionCount >= 2) score += 7;
    else if (commissionCount >= 1) score += 5;
    
    // 6. 品牌知名度评分 (0-5分) - 基于品牌名长度和常见词汇
    const name = advertiser.Name.toLowerCase();
    const famousBrands = ['amazon', 'apple', 'google', 'microsoft', 'nike', 'adidas', 'walmart', 'target', 'samsung', 'sony'];
    if (famousBrands.some(brand => name.includes(brand))) {
      score += 5;
    } else if (name.length <= 10 && /^[a-z]+$/.test(name.replace(/\s/g, ''))) {
      score += 3; // 简洁的品牌名
    }
    
    // 总分100分，>=70分为popular
    return {
      score: Math.min(score, 100),
      isPopular: score >= 70,
      details: {
        hasLogo: advertiser.Image && advertiser.Image !== '',
        couponsCount,
        domainCount,
        countryCount,
        commissionCount
      }
    };
  }

  // 同步广告商数据到stores表
  async syncStores() {
    console.log('开始同步广告商数据...');
    
    const advertisers = await this.fetchAllData('advertiser.advertiser_list');
    console.log(`获取到 ${advertisers.length} 个广告商`);

    let successCount = 0;
    let errorCount = 0;

    for (const advertiser of advertisers) {
      try {
        const storeData = {
          external_id: advertiser.ID,
          name: advertiser.Name,
          alias: this.generateAlias(advertiser.Name),
          logo_url: advertiser.Image,
          description: `${advertiser.Name} offers and coupons`,
          website: Array.isArray(advertiser.Domains) && advertiser.Domains.length > 0 
            ? advertiser.Domains[0] : advertiser.Name,
          url: Array.isArray(advertiser.LinkUrl) && advertiser.LinkUrl.length > 0 
            ? advertiser.LinkUrl[0] : '#',
          commission_rate_data: advertiser.CommissionRate ? 
            JSON.stringify({rate: advertiser.CommissionRate}) : null,
          countries_data: advertiser.Countries ? 
            JSON.stringify(advertiser.Countries) : null,
          domains_data: advertiser.Domains ? 
            JSON.stringify(advertiser.Domains) : null,
          commission_model_data: advertiser.CommissionModel ? 
            JSON.stringify(advertiser.CommissionModel) : null,
          category: Array.isArray(advertiser.Category) && advertiser.Category.length > 0 
            ? advertiser.Category[0] : null,
          updated_at: new Date().toISOString()
        };

        // 先检查是否存在
        const { data: existing } = await supabase
          .from('stores')
          .select('id')
          .eq('external_id', advertiser.ID)
          .single();

        let error = null;
        if (existing) {
          // 更新现有记录
          const { error: updateError } = await supabase
            .from('stores')
            .update(storeData)
            .eq('external_id', advertiser.ID);
          error = updateError;
        } else {
          // 插入新记录
          const { error: insertError } = await supabase
            .from('stores')
            .insert(storeData);
          error = insertError;
        }

        if (error) {
          console.error(`插入store失败 ${advertiser.Name}:`, error);
          errorCount++;
        } else {
          successCount++;
          if (successCount % 10 === 0) {
            console.log(`已同步 ${successCount} 个stores`);
          }
        }
      } catch (error) {
        console.error(`处理advertiser ${advertiser.Name} 失败:`, error);
        errorCount++;
      }
    }

    console.log(`Stores同步完成: 成功 ${successCount}, 失败 ${errorCount}`);
    return { successCount, errorCount };
  }

  // 同步优惠券数据到coupons表
  async syncCoupons() {
    console.log('开始同步优惠券数据...');
    
    const offers = await this.fetchAllData('links.content_feed');
    console.log(`获取到 ${offers.length} 个优惠券`);

    // 先获取所有stores的external_id映射
    const { data: stores } = await supabase
      .from('stores')
      .select('id, external_id');
    
    const storeMap = new Map();
    stores?.forEach(store => {
      storeMap.set(store.external_id, store.id);
    });

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const offer of offers) {
      try {
        const storeId = storeMap.get(offer.AdvertiserID);
        if (!storeId) {
          skippedCount++;
          continue; // 跳过没有对应store的优惠券
        }

        const couponType = offer.CouponCode && offer.CouponCode.trim() !== '' 
          ? 'code' : 'deal';

        const couponData = {
          store_id: storeId,
          external_id: offer.LinkID,
          title: offer.Title || 'Special Offer',
          subtitle: offer.KeyTitle || '',
          code: couponType === 'code' ? offer.CouponCode : null,
          type: couponType,
          discount_value: offer.KeyTitle || '',
          description: offer.Description || offer.Title || '',
          url: offer.LinkUrl,
          expires_at: this.parseDate(offer.EndDate),
          is_active: this.isOfferActive(offer.StartDate, offer.EndDate),
          countries: offer.ShippingCountry || null,
          updated_at: new Date().toISOString()
        };

        // 先检查是否存在
        const { data: existing } = await supabase
          .from('coupons')
          .select('id')
          .eq('external_id', offer.LinkID)
          .single();

        let error = null;
        if (existing) {
          // 更新现有记录
          const { error: updateError } = await supabase
            .from('coupons')
            .update(couponData)
            .eq('external_id', offer.LinkID);
          error = updateError;
        } else {
          // 插入新记录
          const { error: insertError } = await supabase
            .from('coupons')
            .insert(couponData);
          error = insertError;
        }

        if (error) {
          console.error(`插入coupon失败 ${offer.Title}:`, error);
          errorCount++;
        } else {
          successCount++;
          if (successCount % 50 === 0) {
            console.log(`已同步 ${successCount} 个coupons`);
          }
        }
      } catch (error) {
        console.error(`处理offer ${offer.Title} 失败:`, error);
        errorCount++;
      }
    }

    console.log(`Coupons同步完成: 成功 ${successCount}, 失败 ${errorCount}, 跳过 ${skippedCount}`);
    return { successCount, errorCount, skippedCount };
  }

  // 安全解析日期
  parseDate(dateString) {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date.toISOString();
    } catch (error) {
      return null;
    }
  }

  // 判断优惠券是否激活
  isOfferActive(startDate, endDate) {
    const now = new Date();
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    if (start && now < new Date(start)) return false;
    if (end && now > new Date(end)) return false;
    return true;
  }

  // 执行完整同步
  async syncAll() {
    console.log('开始完整数据同步...');
    const startTime = Date.now();

    try {
      // 1. 首先同步stores（不评分）
      const storesResult = await this.syncStores();
      
      // 2. 然后同步coupons
      const couponsResult = await this.syncCoupons();

      // 3. 最后根据完整数据更新商家热门度评分
      const popularityResult = await this.updateStorePopularity();

      const totalTime = (Date.now() - startTime) / 1000;
      console.log(`\n🎉 完整同步完成！总耗时: ${totalTime}秒`);
      console.log(`📊 Stores: 成功 ${storesResult.successCount}, 失败 ${storesResult.errorCount}`);
      console.log(`🎫 Coupons: 成功 ${couponsResult.successCount}, 失败 ${couponsResult.errorCount}, 跳过 ${couponsResult.skippedCount}`);
      console.log(`🔥 热门度: 更新 ${popularityResult?.updatedCount || 0} 个商家, 其中 ${popularityResult?.popularCount || 0} 个热门`);

      return {
        stores: storesResult,
        coupons: couponsResult,
        popularity: popularityResult,
        totalTime
      };
    } catch (error) {
      console.error('同步过程中发生错误:', error);
      throw error;
    }
  }

  // 更新商家热门程度评分
  async updateStorePopularity() {
    console.log('开始更新商家热门程度评分...');
    
    // 获取所有商家和对应的原始数据
    const { data: storesWithCoupons } = await supabase
      .from('stores')
      .select(`
        id,
        external_id,
        name,
        commission_rate_data,
        countries_data,
        domains_data,
        commission_model_data,
        coupons(count)
      `);

    if (!storesWithCoupons) {
      console.error('获取商家数据失败');
      return;
    }

    let updatedCount = 0;
    let popularCount = 0;

    for (const store of storesWithCoupons) {
      try {
        // 构造advertiser对象用于评分算法
        const advertiserData = {
          ID: store.external_id,
          Name: store.name,
          Image: '', // 从logo_url获取
          Countries: store.countries_data ? JSON.parse(store.countries_data) : [],
          Domains: store.domains_data ? JSON.parse(store.domains_data) : [],
          CommissionModel: store.commission_model_data ? JSON.parse(store.commission_model_data) : [],
          CommissionRate: store.commission_rate_data ? 
            JSON.parse(store.commission_rate_data).rate : null
        };

        // 获取logo信息
        const { data: logoData } = await supabase
          .from('stores')
          .select('logo_url')
          .eq('id', store.id)
          .single();
        
        if (logoData) {
          advertiserData.Image = logoData.logo_url || '';
        }

        // 计算优惠券数量
        const couponsCount = store.coupons?.[0]?.count || 0;

        // 计算热门程度
        const popularity = this.calculatePopularity(advertiserData, couponsCount);

        // 更新商家的featured状态
        const { error } = await supabase
          .from('stores')
          .update({ 
            is_featured: popularity.isPopular,
            active_offers_count: couponsCount
          })
          .eq('id', store.id);

        if (error) {
          console.error(`更新商家 ${store.name} 热门度失败:`, error);
        } else {
          updatedCount++;
          if (popularity.isPopular) {
            popularCount++;
            console.log(`🔥 热门商家: ${store.name} (得分: ${popularity.score}, 优惠券: ${couponsCount})`);
          }
        }
      } catch (error) {
        console.error(`处理商家 ${store.name} 评分失败:`, error);
      }
    }

    console.log(`商家热门度更新完成: 更新 ${updatedCount} 个商家, 其中 ${popularCount} 个热门商家`);
    return { updatedCount, popularCount };
  }

  // 解析折扣值
  parseDiscount(discountText) {
    if (!discountText) return null;
    
    const text = discountText.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // 百分比折扣匹配
    const percentMatch = text.match(/(\d+)%\s*off/);
    if (percentMatch) {
      return {
        type: 'percent',
        value: parseInt(percentMatch[1]),
        original: discountText
      };
    }
    
    // 固定金额折扣匹配 ($10 off, £5 off, etc.)
    const amountMatch = text.match(/([£$€¥]?\d+(?:\.\d{2})?)\s*off/);
    if (amountMatch) {
      const value = parseFloat(amountMatch[1].replace(/[£$€¥]/g, ''));
      return {
        type: 'amount',
        value: value,
        original: discountText
      };
    }
    
    // Buy X Get Y 匹配
    const bxgyMatch = text.match(/buy\s*(\d+)\s*get\s*(\d+)/);
    if (bxgyMatch) {
      return {
        type: 'bxgy',
        buy: parseInt(bxgyMatch[1]),
        get: parseInt(bxgyMatch[2]),
        original: discountText
      };
    }
    
    // Up to XX% off 匹配
    const uptoMatch = text.match(/up\s*to\s*(\d+)%/);
    if (uptoMatch) {
      return {
        type: 'upto_percent',
        value: parseInt(uptoMatch[1]),
        original: discountText
      };
    }
    
    return {
      type: 'other',
      original: discountText
    };
  }

  // 分析商家的所有促销折扣
  async analyzeStoreDiscounts() {
    console.log('开始分析商家促销折扣...');
    
    // 获取所有商家
    const { data: stores } = await supabase
      .from('stores')
      .select('id, external_id, name');
    
    if (!stores) {
      console.error('获取商家列表失败');
      return;
    }
    
    let processedCount = 0;
    
    for (const store of stores) {
      try {
        // 获取该商家的所有促销
        const { data: coupons } = await supabase
          .from('coupons')
          .select('discount_value, type')
          .eq('store_id', store.id)
          .eq('is_active', true);
        
        if (!coupons || coupons.length === 0) {
          continue;
        }
        
        const discounts = [];
        const percentDiscounts = [];
        const amountDiscounts = [];
        
        // 解析所有折扣
        for (const coupon of coupons) {
          const parsed = this.parseDiscount(coupon.discount_value);
          if (parsed) {
            discounts.push(parsed);
            
            if (parsed.type === 'percent' || parsed.type === 'upto_percent') {
              percentDiscounts.push(parsed.value);
            } else if (parsed.type === 'amount') {
              amountDiscounts.push(parsed.value);
            }
          }
        }
        
        // 计算统计信息
        const analysis = {
          total_offers: coupons.length,
          parsed_discounts: discounts.length,
          min_percent: percentDiscounts.length > 0 ? Math.min(...percentDiscounts) : null,
          max_percent: percentDiscounts.length > 0 ? Math.max(...percentDiscounts) : null,
          avg_percent: percentDiscounts.length > 0 ? 
            Math.round(percentDiscounts.reduce((a, b) => a + b, 0) / percentDiscounts.length) : null,
          min_amount: amountDiscounts.length > 0 ? Math.min(...amountDiscounts) : null,
          max_amount: amountDiscounts.length > 0 ? Math.max(...amountDiscounts) : null,
          discount_types: [...new Set(discounts.map(d => d.type))],
          best_offer: this.getBestOffer(discounts),
          analyzed_at: new Date().toISOString()
        };
        
        // 更新商家的折扣分析数据
        const { error } = await supabase
          .from('stores')
          .update({ 
            discount_analysis: analysis,
            updated_at: new Date().toISOString()
          })
          .eq('id', store.id);
        
        if (error) {
          console.error(`更新商家 ${store.name} 折扣分析失败:`, error);
        } else {
          processedCount++;
          if (analysis.max_percent && analysis.max_percent >= 50) {
            console.log(`💰 高折扣商家: ${store.name} (最高${analysis.max_percent}%)`);
          }
        }
        
        // 避免请求过快
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`分析商家 ${store.name} 失败:`, error);
      }
    }
    
    console.log(`折扣分析完成: 处理了 ${processedCount} 个商家`);
  }
  
  // 获取最优惠券
  getBestOffer(discounts) {
    if (discounts.length === 0) return null;
    
    // 优先级：百分比折扣 > 固定金额折扣 > 其他
    const percentOffers = discounts.filter(d => d.type === 'percent' || d.type === 'upto_percent');
    if (percentOffers.length > 0) {
      const best = percentOffers.reduce((max, current) => 
        current.value > max.value ? current : max
      );
      return best.original;
    }
    
    const amountOffers = discounts.filter(d => d.type === 'amount');
    if (amountOffers.length > 0) {
      const best = amountOffers.reduce((max, current) => 
        current.value > max.value ? current : max
      );
      return best.original;
    }
    
    return discounts[0].original;
  }

  // 清理过期的优惠券
  async cleanupExpiredCoupons() {
    console.log('清理过期优惠券...');
    
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: false })
      .lt('expires_at', new Date().toISOString())
      .eq('is_active', true);

    if (error) {
      console.error('清理过期优惠券失败:', error);
    } else {
      console.log('过期优惠券清理完成');
    }
  }
}

// 命令行执行
async function main() {
  const syncService = new DataSyncService();
  
  const command = process.argv[2] || 'all';
  
  try {
    switch (command) {
      case 'stores':
        await syncService.syncStores();
        break;
      case 'coupons':
        await syncService.syncCoupons();
        break;
      case 'popularity':
        await syncService.updateStorePopularity();
        break;
      case 'analyze':
        await syncService.analyzeStoreDiscounts();
        break;
      case 'cleanup':
        await syncService.cleanupExpiredCoupons();
        break;
      case 'all':
      default:
        await syncService.syncAll();
        await syncService.cleanupExpiredCoupons();
        await syncService.updateStorePopularity();
        await syncService.analyzeStoreDiscounts();
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

module.exports = DataSyncService;