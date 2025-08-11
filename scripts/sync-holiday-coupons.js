const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 初始化 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 节日名称列表（从 holidays.ts 提取）
const HOLIDAYS = [
  // 联邦假日
  { name: "New Year's Day", variations: ["new year", "new years"] },
  { name: "Martin Luther King Jr. Day", variations: ["mlk day", "martin luther king"] },
  { name: "Presidents' Day", variations: ["presidents day", "president day"] },
  { name: "Memorial Day", variations: ["memorial day"] },
  { name: "Independence Day", variations: ["independence day", "july 4th", "4th of july"] },
  { name: "Labor Day", variations: ["labor day"] },
  { name: "Columbus Day", variations: ["columbus day"] },
  { name: "Veterans Day", variations: ["veterans day", "veteran day"] },
  { name: "Thanksgiving Day", variations: ["thanksgiving", "turkey day"] },
  { name: "Christmas Day", variations: ["christmas", "xmas", "holiday season"] },
  { name: "Juneteenth", variations: ["juneteenth"] },

  // 观察性节日
  { name: "Valentine's Day", variations: ["valentine", "valentines", "love day"] },
  { name: "St. Patrick's Day", variations: ["st patrick", "saint patrick", "irish"] },
  { name: "Easter Sunday", variations: ["easter", "easter sunday"] },
  { name: "Mother's Day", variations: ["mother's day", "mothers day", "mom day"] },
  { name: "Father's Day", variations: ["father's day", "fathers day", "dad day"] },
  { name: "Halloween", variations: ["halloween", "trick or treat", "spooky"] },
  { name: "Women's Equality Day", variations: ["women's equality", "womens equality"] },
  { name: "April Fools' Day", variations: ["april fool", "april fools"] },
  { name: "Tax Day", variations: ["tax day"] },
  { name: "Earth Day", variations: ["earth day", "environmental"] },
  { name: "Cinco de Mayo", variations: ["cinco de mayo", "5th of may"] },

  // 购物活动
  { name: "Black Friday", variations: ["black friday", "blackfriday"] },
  { name: "Cyber Monday", variations: ["cyber monday", "cybermonday"] },
  { name: "Boxing Day", variations: ["boxing day"] },
  
  // 其他常见节日/季节
  { name: "Back to School", variations: ["back to school", "school season"] },
  { name: "Summer Sale", variations: ["summer", "summer sale"] },
  { name: "Spring Sale", variations: ["spring", "spring sale"] },
  { name: "Winter Sale", variations: ["winter", "winter sale"] },
  { name: "Fall Sale", variations: ["fall", "autumn", "fall sale"] },
  { name: "End of Year", variations: ["end of year", "year end"] }
];

// 创建搜索模式（正则表达式）
function createSearchPatterns() {
  const patterns = [];
  
  for (const holiday of HOLIDAYS) {
    // 主要名称
    patterns.push({
      holiday: holiday.name,
      pattern: new RegExp(`\\b${holiday.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    });
    
    // 变体名称
    for (const variation of holiday.variations) {
      patterns.push({
        holiday: holiday.name,
        pattern: new RegExp(`\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      });
    }
  }
  
  return patterns;
}

// 检查文本是否包含节日关键词
function findHolidayMatches(text, patterns) {
  if (!text) return [];
  
  const matches = [];
  const foundHolidays = new Set();
  
  for (const { holiday, pattern } of patterns) {
    if (pattern.test(text) && !foundHolidays.has(holiday)) {
      matches.push({
        holiday,
        matchText: text.match(pattern)?.[0] || '',
        confidence: 1.0
      });
      foundHolidays.add(holiday);
    }
  }
  
  return matches;
}

// 全局变量缓存节日数据
let holidayCache = null;

// 获取所有节日数据并缓存
async function getHolidayCache() {
  if (holidayCache) {
    return holidayCache;
  }
  
  try {
    const { data: holidays, error } = await supabase
      .from('holidays')
      .select('id, name, type, holiday_date')
      .eq('is_active', true);
    
    if (error) {
      console.error('获取节日数据失败:', error);
      return {};
    }
    
    // 创建名称到节日信息的映射
    holidayCache = {};
    holidays.forEach(holiday => {
      holidayCache[holiday.name] = {
        id: holiday.id,
        date: holiday.holiday_date,
        type: holiday.type
      };
    });
    
    console.log(`📚 已缓存 ${holidays.length} 个节日数据`);
    return holidayCache;
  } catch (error) {
    console.error('获取节日缓存失败:', error);
    return {};
  }
}

// 获取节日信息
async function getHolidayInfo(holidayName) {
  const cache = await getHolidayCache();
  return cache[holidayName] || { id: null, date: null, type: 'Observance' };
}

// 主同步函数
async function syncHolidayCoupons() {
  console.log('🎄 开始同步节日优惠券...');
  
  try {
    const searchPatterns = createSearchPatterns();
    let processedCount = 0;
    let matchedCount = 0;
    let errorCount = 0;
    
    // 分批获取优惠券数据
    let offset = 0;
    const batchSize = 1000;
    
    while (true) {
      console.log(`📦 获取优惠券批次: ${offset} - ${offset + batchSize}`);
      
      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('id, title, description, store_id')
        .eq('is_active', true)
        .order('id')
        .range(offset, offset + batchSize - 1);
      
      if (error) {
        console.error('获取优惠券数据失败:', error);
        break;
      }
      
      if (!coupons || coupons.length === 0) {
        console.log('✅ 所有优惠券处理完成');
        break;
      }
      
      // 处理当前批次的优惠券
      for (const coupon of coupons) {
        try {
          processedCount++;
          
          // 检查标题中的节日关键词
          const titleMatches = findHolidayMatches(coupon.title, searchPatterns);
          
          // 检查描述中的节日关键词
          const descMatches = findHolidayMatches(coupon.description, searchPatterns);
          
          // 合并所有匹配
          const allMatches = [
            ...titleMatches.map(m => ({ ...m, source: 'title' })),
            ...descMatches.map(m => ({ ...m, source: 'description' }))
          ];
          
          // 如果找到匹配，插入数据库
          if (allMatches.length > 0) {
            console.log(`🎯 优惠券 ID ${coupon.id} 匹配到 ${allMatches.length} 个节日`);
            
            for (const match of allMatches) {
              const holidayInfo = await getHolidayInfo(match.holiday);
              
              // 跳过没有找到的节日
              if (!holidayInfo.id) {
                console.warn(`⚠️  节日 "${match.holiday}" 在数据库中不存在，跳过...`);
                continue;
              }
              
              // 插入节日优惠券记录
              const { error: insertError } = await supabase
                .from('holiday_coupons')
                .upsert({
                  holiday_id: holidayInfo.id,
                  coupon_id: coupon.id,
                  holiday_name: match.holiday,
                  holiday_date: holidayInfo.date,
                  holiday_type: holidayInfo.type,
                  match_source: match.source,
                  match_text: match.matchText,
                  confidence_score: match.confidence,
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'holiday_id,coupon_id'
                });
              
              if (insertError) {
                console.error(`插入节日优惠券记录失败 (优惠券ID: ${coupon.id}, 节日: ${match.holiday}):`, insertError);
                errorCount++;
              } else {
                matchedCount++;
              }
            }
          }
          
          // 每处理100个优惠券显示进度
          if (processedCount % 100 === 0) {
            console.log(`📊 进度: 已处理 ${processedCount} 个优惠券, 匹配 ${matchedCount} 个节日优惠券`);
          }
          
        } catch (error) {
          console.error(`处理优惠券 ID ${coupon.id} 时出错:`, error);
          errorCount++;
        }
      }
      
      offset += batchSize;
      
      // 添加延迟避免过于频繁的API调用
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 节日优惠券同步完成!');
    console.log(`📈 统计信息:`);
    console.log(`   - 处理优惠券总数: ${processedCount}`);
    console.log(`   - 匹配节日优惠券: ${matchedCount}`);
    console.log(`   - 错误数量: ${errorCount}`);
    
    // 显示按节日分组的统计
    const { data: stats } = await supabase
      .from('holiday_coupons')
      .select('holiday_name')
      .order('holiday_name');
    
    // 手动计算统计
    const holidayStats = {};
    if (stats) {
      stats.forEach(item => {
        holidayStats[item.holiday_name] = (holidayStats[item.holiday_name] || 0) + 1;
      });
    }
    
    if (Object.keys(holidayStats).length > 0) {
      console.log('\n📊 节日优惠券分布:');
      const sortedStats = Object.entries(holidayStats)
        .sort(([,a], [,b]) => b - a);
      
      for (const [holidayName, count] of sortedStats) {
        console.log(`   - ${holidayName}: ${count} 个`);
      }
    }
    
  } catch (error) {
    console.error('同步过程中发生错误:', error);
    process.exit(1);
  }
}

// 执行同步
if (require.main === module) {
  syncHolidayCoupons()
    .then(() => {
      console.log('✅ 同步脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 同步脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { syncHolidayCoupons };