# 数据同步脚本使用说明

## 概述

这个脚本用于从 BrandReward API 同步数据到 Supabase 数据库，包括广告商（stores）和优惠券（coupons）数据。

## 环境配置

1. 设置环境变量：
```bash
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
export API_USER=""
export API_KEY=""
```

2. 安装依赖：
```bash
npm install
```

3. 运行数据库更新（如果需要）：
```bash
# 在 Supabase SQL Editor 中运行 database-schema-updates.sql
```

## 使用方法

### 完整同步（推荐）
```bash
npm run sync
# 或
node sync-data.js
```

### 分别同步

仅同步广告商数据：
```bash
npm run sync:stores
```

仅同步优惠券数据：
```bash
npm run sync:coupons
```

更新商家热门度：
```bash
npm run sync:popularity
```

分析商家折扣信息：
```bash
npm run sync:analyze
```

清理过期优惠券：
```bash
npm run sync:cleanup
```

## 数据映射

### Advertiser API → Stores 表
- `ID` → `external_id`
- `Name` → `name` 和 `alias`
- `Image` → `logo_url`
- `LinkUrl[0]` → `url`
- `CommissionRate` → `commission_rate_data` (JSON)
- `Countries` → `countries_data` (JSON)
- `Domains` → `domains_data` (JSON)
- `CommissionModel` → `commission_model_data` (JSON)

### Content Feed API → Coupons 表
- `LinkID` → `external_id`
- `AdvertiserID` → `store_id` (通过关联)
- `Title` → `title`
- `Description` → `description`
- `CouponCode` → `code`
- `KeyTitle` → `discount_value`
- `LinkUrl` → `url`
- `EndDate` → `expires_at`
- `ShippingCountry` → `countries`

## 定时任务设置

建议设置定时任务定期同步数据：

```bash
# 每天凌晨2点同步
0 2 * * * cd /path/to/project && npm run sync

# 每小时清理过期优惠券
0 * * * * cd /path/to/project && npm run sync:cleanup
```

## 注意事项

1. 首次运行前确保数据库表结构已更新
2. Service Key 需要有相应表的读写权限
3. API 限流：脚本已包含适当的延迟处理
4. 重复数据：使用 upsert 避免重复插入
5. 错误处理：失败的记录会跳过并记录日志

## 监控和日志

脚本会输出详细的同步进度和结果统计，包括：
- 成功同步的记录数
- 失败的记录数
- 跳过的记录数（无对应关联的优惠券）
- 总耗时

## 故障排除

1. 检查环境变量是否正确设置
2. 确认 Supabase Anon Key 权限（需要对相关表有写入权限）
3. 验证网络连接到 API 端点
4. 查看控制台输出的错误信息

只更新单个商家:
"""
node scripts/migrate-store-logos-to-r2.js --store 'stealthwriter'
node scripts/sync-data.js analyze 'stealthwriter'
node scripts/sync-data.js popularity 'stealthwriter'
node scripts/analyze-similar-stores.js single 'stealthwriter'
node scripts/generate-store-faqs.js by-name 'stealthwriter'
"""

命令行选项

  # 基础用法
  npm run process:popular-stores                         # 处理所有热门商家

  # 高级选项
  npm run process:popular-stores -- --limit=10           # 只处理前 10 个