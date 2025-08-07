#!/usr/bin/env node

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// Supabase配置
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// OpenAI配置
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class SimilarStoreAnalyzer {
  constructor() {
    this.batchSize = 10; // 每次处理的商家数量
    this.maxSimilarStores = 6; // 每个商家最多推荐6个相似店铺
    this.delay = 2000; // API调用间隔，避免超出限制
  }

  // 获取所有商家数据
  async getAllStores() {
    const { data, error } = await supabase
      .from('stores')
      .select(`
        id,
        name,
        alias,
        description,
        website,
        category,
        active_offers_count,
        is_featured,
        domains_data,
        countries_data
      `)
      .order('active_offers_count', { ascending: false });

    if (error) {
      throw new Error(`获取商家数据失败: ${error.message}`);
    }

    return data || [];
  }

  // 使用AI分析相似商家
  async analyzeSimilarStores(targetStore, allStores) {
    try {
      // 过滤掉自己
      const candidateStores = allStores.filter(store => store.id !== targetStore.id);
      
      // 构建prompt
      const prompt = this.buildAnalysisPrompt(targetStore, candidateStores);
      
      console.log(`正在分析 ${targetStore.name} 的相似商家...`);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的电商分析师，擅长分析商家之间的相似性和关联性。请基于商家的类别、域名、国家、优惠券数量等因素来判断相似度。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const aiResponse = response.choices[0].message.content;
      return this.parseAIResponse(aiResponse, candidateStores);
      
    } catch (error) {
      console.error(`AI分析失败 (${targetStore.name}):`, error.message);
      return [];
    }
  }

  // 构建分析prompt
  buildAnalysisPrompt(targetStore, candidateStores) {
    // 提取目标商家信息
    const targetInfo = {
      name: targetStore.name,
      category: targetStore.category || '未知',
      website: targetStore.website,
      domains: targetStore.domains_data ? JSON.parse(targetStore.domains_data) : [],
      countries: targetStore.countries_data ? JSON.parse(targetStore.countries_data) : [],
      offers: targetStore.active_offers_count || 0,
      featured: targetStore.is_featured
    };

    // 候选商家信息（只提供前50个，避免prompt过长）
    const candidates = candidateStores.slice(0, 50).map((store, index) => {
      const domains = store.domains_data ? JSON.parse(store.domains_data) : [];
      const countries = store.countries_data ? JSON.parse(store.countries_data) : [];
      
      return `${index + 1}. ${store.name}
   - 别名: ${store.alias}
   - 类别: ${store.category || '未知'}
   - 网站: ${store.website}
   - 域名: ${domains.slice(0, 3).join(', ')}
   - 国家: ${countries.slice(0, 5).join(', ')}
   - 优惠券数: ${store.active_offers_count || 0}
   - 热门: ${store.is_featured ? '是' : '否'}`;
    }).join('\n\n');

    return `请为以下目标商家分析最相似的商家：

目标商家信息：
- 名称: ${targetInfo.name}
- 类别: ${targetInfo.category}
- 网站: ${targetInfo.website}
- 域名: ${targetInfo.domains.slice(0, 3).join(', ')}
- 国家: ${targetInfo.countries.slice(0, 5).join(', ')}
- 优惠券数: ${targetInfo.offers}
- 热门商家: ${targetInfo.featured ? '是' : '否'}

候选商家列表：
${candidates}

请基于以下因素分析相似性：
1. 商家类别和业务领域
2. 目标市场和服务国家
3. 网站域名特征
4. 优惠券数量级别
5. 商家规模和知名度

请选择最相似的6个商家，按相似度从高到低排序，并以JSON格式返回：
{
  "similar_stores": [
    {
      "rank": 1,
      "name": "商家名称",
      "alias": "商家别名",  
      "similarity_score": 85,
      "reasons": ["相似原因1", "相似原因2"]
    }
  ]
}`;
  }

  // 解析AI响应
  parseAIResponse(aiResponse, candidateStores) {
    try {
      // 提取JSON部分
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('AI响应中未找到JSON格式数据');
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const similarStores = parsed.similar_stores || [];

      // 验证并转换为包含ID的格式
      const result = [];
      for (const similar of similarStores) {
        const matchedStore = candidateStores.find(
          store => store.name === similar.name || store.alias === similar.alias
        );
        
        if (matchedStore) {
          result.push({
            id: matchedStore.id,
            name: matchedStore.name,
            alias: matchedStore.alias,
            similarity_score: similar.similarity_score || 0,
            reasons: similar.reasons || []
          });
        }
      }

      return result.slice(0, this.maxSimilarStores);
      
    } catch (error) {
      console.error('解析AI响应失败:', error.message);
      return [];
    }
  }

  // 更新数据库中的相似商家关系
  async updateSimilarStores(storeId, similarStores) {
    try {
      // 先删除现有的相似商家关系
      await supabase
        .from('similar_stores')
        .delete()
        .eq('store_id', storeId);

      // 插入新的相似商家关系
      if (similarStores.length > 0) {
        const insertData = similarStores.map(similar => ({
          store_id: storeId,
          similar_store_id: similar.id
        }));

        const { error } = await supabase
          .from('similar_stores')
          .insert(insertData);

        if (error) {
          throw error;
        }
      }

      return true;
    } catch (error) {
      console.error(`更新相似商家失败 (store_id: ${storeId}):`, error.message);
      return false;
    }
  }

  // 清理所有现有的相似商家关系
  async clearAllSimilarStores() {
    console.log('清理所有现有的相似商家关系...');
    const { error } = await supabase
      .from('similar_stores')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有记录

    if (error) {
      console.error('清理失败:', error.message);
      return false;
    }
    return true;
  }

  // 执行完整的相似商家分析
  async analyzeAll(options = {}) {
    const { 
      clearExisting = true,
      limitStores = null,
      skipExisting = false 
    } = options;

    console.log('🤖 开始AI分析相似商家...');
    const startTime = Date.now();

    try {
      // 获取所有商家
      const allStores = await this.getAllStores();
      console.log(`获取到 ${allStores.length} 个商家`);

      // 可选：清理现有数据
      if (clearExisting) {
        await this.clearAllSimilarStores();
      }

      // 限制处理的商家数量（用于测试）
      const storesToProcess = limitStores ? 
        allStores.slice(0, limitStores) : allStores;

      let processedCount = 0;
      let successCount = 0;
      let skipCount = 0;

      // 分批处理商家
      for (let i = 0; i < storesToProcess.length; i += this.batchSize) {
        const batch = storesToProcess.slice(i, i + this.batchSize);
        
        console.log(`\n处理批次 ${Math.floor(i/this.batchSize) + 1}/${Math.ceil(storesToProcess.length/this.batchSize)}`);
        
        for (const store of batch) {
          try {
            // 可选：跳过已有相似商家的店铺
            if (skipExisting) {
              const { data: existing } = await supabase
                .from('similar_stores')
                .select('id')
                .eq('store_id', store.id)
                .limit(1);
              
              if (existing && existing.length > 0) {
                console.log(`⏭️  跳过 ${store.name} (已有相似商家)`);
                skipCount++;
                continue;
              }
            }

            // AI分析相似商家
            const similarStores = await this.analyzeSimilarStores(store, allStores);
            
            if (similarStores.length > 0) {
              // 更新数据库
              const updateSuccess = await this.updateSimilarStores(store.id, similarStores);
              
              if (updateSuccess) {
                successCount++;
                console.log(`✅ ${store.name}: 找到 ${similarStores.length} 个相似商家`);
                
                // 显示相似商家
                similarStores.forEach((similar, index) => {
                  console.log(`   ${index + 1}. ${similar.name} (相似度: ${similar.similarity_score}%)`);
                });
              } else {
                console.log(`❌ ${store.name}: 数据库更新失败`);
              }
            } else {
              console.log(`⚠️  ${store.name}: 未找到相似商家`);
            }
            
            processedCount++;
            
            // API调用间隔
            if (i + 1 < storesToProcess.length) {
              await new Promise(resolve => setTimeout(resolve, this.delay));
            }
            
          } catch (error) {
            console.error(`处理 ${store.name} 时发生错误:`, error.message);
            processedCount++;
          }
        }
      }

      const totalTime = (Date.now() - startTime) / 1000;
      console.log(`\n🎉 相似商家分析完成！`);
      console.log(`⏱️  总耗时: ${totalTime.toFixed(2)}秒`);
      console.log(`📊 处理统计: 总计 ${processedCount}, 成功 ${successCount}, 跳过 ${skipCount}`);

      return {
        processedCount,
        successCount,
        skipCount,
        totalTime
      };

    } catch (error) {
      console.error('分析过程中发生错误:', error.message);
      throw error;
    }
  }

  // 分析单个商家的相似商家
  async analyzeSingleStore(storeAlias) {
    console.log(`🔍 分析单个商家: ${storeAlias}`);
    
    try {
      // 获取目标商家
      const { data: targetStore, error: targetError } = await supabase
        .from('stores')
        .select('*')
        .eq('alias', storeAlias)
        .single();

      if (targetError || !targetStore) {
        throw new Error(`找不到商家: ${storeAlias}`);
      }

      // 获取所有商家
      const allStores = await this.getAllStores();
      
      // AI分析
      const similarStores = await this.analyzeSimilarStores(targetStore, allStores);
      
      if (similarStores.length > 0) {
        // 更新数据库
        const success = await this.updateSimilarStores(targetStore.id, similarStores);
        
        if (success) {
          console.log(`✅ ${targetStore.name}: 分析完成，找到 ${similarStores.length} 个相似商家`);
          similarStores.forEach((similar, index) => {
            console.log(`   ${index + 1}. ${similar.name} (相似度: ${similar.similarity_score}%)`);
          });
          return similarStores;
        } else {
          throw new Error('数据库更新失败');
        }
      } else {
        console.log(`⚠️  ${targetStore.name}: 未找到相似商家`);
        return [];
      }
      
    } catch (error) {
      console.error('单个商家分析失败:', error.message);
      throw error;
    }
  }
}

// 命令行执行
async function main() {
  const analyzer = new SimilarStoreAnalyzer();
  
  const command = process.argv[2] || 'help';
  const arg = process.argv[3];
  
  try {
    switch (command) {
      case 'all':
        // 分析所有商家
        await analyzer.analyzeAll({
          clearExisting: true,
          limitStores: arg ? parseInt(arg) : null
        });
        break;
        
      case 'single':
        // 分析单个商家
        if (!arg) {
          console.error('请提供商家别名，例如: node analyze-similar-stores.js single amazon');
          process.exit(1);
        }
        await analyzer.analyzeSingleStore(arg);
        break;
        
      case 'update':
        // 更新现有商家（不清理，跳过已有的）
        await analyzer.analyzeAll({
          clearExisting: false,
          skipExisting: true,
          limitStores: arg ? parseInt(arg) : null
        });
        break;
        
      case 'clear':
        // 只清理数据
        await analyzer.clearAllSimilarStores();
        console.log('✅ 已清理所有相似商家数据');
        break;
        
      case 'help':
      default:
        console.log(`
AI相似商家分析工具

用法:
  node analyze-similar-stores.js <command> [options]

命令:
  all [limit]     分析所有商家的相似店铺 (可选限制数量)
  single <alias>  分析单个商家的相似店铺
  update [limit]  增量更新，跳过已有相似商家的店铺
  clear           清理所有现有的相似商家数据
  help            显示帮助信息

示例:
  node analyze-similar-stores.js all 10      # 分析前10个商家
  node analyze-similar-stores.js single amazon  # 分析amazon的相似商家
  node analyze-similar-stores.js update          # 增量更新
  
环境变量:
  OPENAI_API_KEY                 OpenAI API密钥
  NEXT_PUBLIC_SUPABASE_URL       Supabase URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY  Supabase匿名密钥
        `);
        break;
    }
  } catch (error) {
    console.error('执行失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = SimilarStoreAnalyzer;