# 🚀 CouponMia Category Management System v2.0.0

> 综合类别管理脚本 - 整合商店分类、图片生成、FAQ创建的统一解决方案

## 🎯 功能概览

该脚本整合了原先的三个独立脚本：
- `categorize-stores-ai.js` → 智能商店分类
- `generate-category-images.js` → AI图片生成  
- `generate-category-faqs.js` → FAQ内容生成

## 🏗️ 架构设计

### 核心工作流程
```
📊 系统状态检查
    ↓
🏪 商店智能分类 (AI + 关键词回退)
    ↓
🎨 类别横幅图片生成 (Replicate FLUX)
    ↓
❓ 类别FAQ内容生成 (AI + 模板)
    ↓
📋 完整报告生成
```

### 技术栈
- **AI分析**: OpenRouter (GPT-4o-mini)
- **图片生成**: Replicate (FLUX-schnell)
- **存储**: Cloudflare R2
- **数据库**: Supabase PostgreSQL
- **错误处理**: 多重回退机制

## 🚀 使用方法

### 基本命令

```bash
# 系统状态检查
node scripts/manage-categories.js status

# 完整工作流程 (推荐)
node scripts/manage-categories.js workflow --limit=50 --ai

# 单独功能模块
node scripts/manage-categories.js categorize --ai --limit=20
node scripts/manage-categories.js images --force
node scripts/manage-categories.js faqs --ai --limit=10
```

### 高级用法

```bash
# 处理特定商店
node scripts/manage-categories.js categorize --store="Nike" --ai

# 重新生成特定类别图片
node scripts/manage-categories.js images --category=technology --force

# 为特定类别生成FAQ
node scripts/manage-categories.js faqs --category=ai-software --ai

# 小批量测试
node scripts/manage-categories.js workflow --limit=5 --ai
```

## 📊 配置参数

### 系统配置
```javascript
CONFIG = {
  delays: {
    openai: 3000,      // OpenAI调用间隔
    replicate: 5000,   // 图片生成间隔  
    database: 500      // 数据库操作间隔
  },
  batches: {
    stores: 10,        // 商店批量处理数量
    aiAnalysis: 5,     // AI分析批量数量
    images: 1,         // 图片生成(顺序)
    faqs: 1           // FAQ生成(顺序)
  },
  retries: {
    ai: 3,            // AI调用重试次数
    image: 2,         // 图片生成重试次数
    database: 3       // 数据库重试次数
  }
}
```

### 环境变量
```bash
# 必需
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# AI功能 (可选)
OPENROUTER_API_KEY=your_openrouter_key

# 图片生成 (可选)
REPLICATE_API_TOKEN=your_replicate_token
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=your_r2_endpoint
```

## 🎨 功能详解

### 1. 商店智能分类
- **AI驱动**: 使用GPT-4o分析商店特征
- **关键词回退**: 失败时使用关键词匹配
- **批量处理**: 10店铺/批次，智能去重
- **类别映射**: 11个预定义类别体系

### 2. 图片生成系统
- **AI模型**: Replicate FLUX-schnell
- **图片规格**: 1280x720 WebP格式
- **存储**: 自动上传到Cloudflare R2
- **优化**: 类别特定的提示词风格

### 3. FAQ智能生成
- **AI增强**: 根据类别生成专业问答
- **模板回退**: 5个通用FAQ模板
- **内容质量**: 1-3句精准回答
- **SEO优化**: 关键词自然融入

## 📋 输出报告

脚本执行完成后会生成详细报告：

```
📊 WORKFLOW COMPLETION REPORT
📊 =========================

⏱️  Total Duration: 245s
🏪 Stores Processed: 50
📂 Stores Categorized: 47
🎨 Images Generated: 8
❓ FAQs Created: 25
❌ Errors: 2

🎉 All operations completed successfully!
```

## 🔧 故障排除

### 常见问题

1. **API配额超限**
   ```bash
   # 减少批量大小
   node scripts/manage-categories.js workflow --limit=10
   ```

2. **图片生成失败**
   ```bash
   # 检查R2配置
   node scripts/manage-categories.js status
   ```

3. **数据库连接问题**
   ```bash
   # 验证Supabase凭证
   echo $NEXT_PUBLIC_SUPABASE_URL
   ```

### 日志解读
- `✅` 成功操作
- `⚠️` 警告（使用回退）
- `❌` 错误（需要检查）
- `⏭️` 跳过操作
- `⏱️` 等待延迟

## 🚀 最佳实践

### 生产环境
```bash
# 完整工作流程，启用所有AI功能
node scripts/manage-categories.js workflow --ai

# 定期维护（每周）
node scripts/manage-categories.js workflow --force --ai
```

### 开发环境
```bash
# 小批量测试
node scripts/manage-categories.js workflow --limit=5 --ai

# 单功能调试
node scripts/manage-categories.js status
```

### 性能优化
- 使用 `--limit` 参数控制批量大小
- 避免频繁的 `--force` 重新生成
- 监控API配额使用情况
- 定期检查R2存储空间

## 🔄 迁移指南

### 从旧脚本迁移
```bash
# 旧方式 (已弃用)
node scripts/categorize-stores-ai.js
node scripts/generate-category-images.js --all
node scripts/generate-category-faqs.js --ai

# 新方式 (推荐)
node scripts/manage-categories.js workflow --ai
```

### 数据兼容性
- ✅ 与现有数据库完全兼容
- ✅ 支持增量更新
- ✅ 保留现有类别和图片
- ✅ 智能跳过已存在内容

## 📈 未来规划

- [ ] 支持自定义类别体系
- [ ] 添加类别合并功能  
- [ ] 集成更多AI模型选择
- [ ] 实时监控面板
- [ ] 自动化定时任务

---

**维护团队**: CouponMia Development Team  
**版本**: v2.0.0  
**最后更新**: 2024年8月31日