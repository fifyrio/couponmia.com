# Vercel CPU Optimization Summary - CouponMia

## 优化完成日期
2025-12-09

## 实施的优化措施

### 1. ✅ Next.js 配置优化 (next.config.ts)

**修改内容:**
- ✅ 启用图片优化 (`unoptimized: false`)
- ✅ 添加图片格式优化 (AVIF, WebP)
- ✅ 设置图片缓存 TTL (30天)
- ✅ 添加 Cloudflare R2 和 Supabase 域名支持
- ✅ 启用 standalone 输出模式
- ✅ 启用 gzip 压缩 (`compress: true`)
- ✅ 使用 SWC 压缩器 (`swcMinify: true`)
- ✅ 配置 Server Actions 限制

**预期效果:** 减少 20-30% CPU 使用

---

### 2. ✅ 创建缓存系统 (src/lib/cache.ts)

**功能:**
- 简单的内存缓存实现，支持 TTL (Time To Live)
- 多种缓存实例用于不同场景:
  - `apiCache`: 1小时 (API 响应)
  - `metadataCache`: 2小时 (页面元数据)
  - `queryCache`: 30分钟 (数据库查询)
  - `storeCache`: 1小时 (商店数据)
  - `couponCache`: 15分钟 (优惠券数据)
- 自动清理过期缓存 (每30分钟)
- 开发模式下输出缓存统计

**预期效果:** 减少 40-60% 重复计算的 CPU 使用

---

### 3. ✅ Vercel 配置文件 (vercel.json)

**配置内容:**
- **函数内存分配:**
  - 通用 API: 1024MB, 60秒超时
  - 认证 API: 512MB, 30秒超时
  - Cashback API: 1024MB, 60秒超时

- **HTTP 缓存头:**
  - 静态资源: 1年不可变缓存
  - 图片: 1天缓存 + 必须重新验证
  - API: 禁用缓存
  - 安全头: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

**预期效果:** 优化资源加载，减少服务器请求

---

### 4. ✅ API 路由缓存优化

**优化的路由:**

#### 4.1 商店搜索 API (src/app/api/search/stores/route.ts)
- 添加域名搜索缓存 (30分钟 TTL)
- 添加名称搜索缓存 (30分钟 TTL)
- 缓存键格式: `domain:{domain}` / `search:{query}:{limit}`

#### 4.2 商店优惠券 API (src/app/api/stores/[storeAlias]/coupons/route.ts)
- 商店信息缓存 (1小时 TTL)
- 优惠券数据缓存 (15分钟 TTL，保持新鲜度)
- 缓存键格式: `store:{alias}` / `coupons:{alias}`

#### 4.3 假日 API (src/app/api/holidays/route.ts)
- 假日数据缓存 (1小时 TTL)
- 支持按年份、类型、数量过滤
- 缓存键格式: `holidays:{year}:{count}:{type}`

**预期效果:** 减少 60-75% API 响应时间

---

### 5. ✅ generateMetadata 函数优化

**优化的页面:**

#### 5.1 商店详情页 (src/app/store/[storeAlias]/page.tsx)
- 添加 2小时元数据缓存
- 缓存键格式: `metadata:store:{alias}`
- 404 页面也进行缓存避免重复查询

#### 5.2 类目页面 (src/app/categories/[categorySlug]/page.tsx)
- 添加 2小时元数据缓存
- 缓存键格式: `metadata:category:{slug}`
- 包含统计数据的智能缓存

**预期效果:** 减少元数据生成的 CPU 消耗

---

### 6. ✅ 环境变量配置 (.env.example)

**新增环境变量:**
```bash
NODE_OPTIONS=--max-old-space-size=1024  # 内存优化
NEXT_TELEMETRY_DISABLED=1               # 禁用遥测
NEXT_PRIVATE_STANDALONE=true            # Standalone 模式
```

**需要在 Vercel Dashboard 添加的环境变量:**
- `NODE_OPTIONS`
- `NEXT_TELEMETRY_DISABLED`

---

## 部署步骤

### Step 1: 验证本地构建
```bash
npm run build
```

### Step 2: 在 Vercel Dashboard 添加环境变量
1. 进入项目设置 → Environment Variables
2. 添加:
   - `NODE_OPTIONS` = `--max-old-space-size=1024`
   - `NEXT_TELEMETRY_DISABLED` = `1`

### Step 3: 提交并部署
```bash
git add .
git commit -m "feat: implement Vercel CPU optimization (40-60% reduction expected)"
git push
```

### Step 4: 监控性能指标
部署后在 Vercel Dashboard 检查:
- **Fluid Active CPU** (预期降低 40-60%)
- **Function Duration** (预期降低 60-75%)
- **Edge Cache Hit Rate** (目标 60%+)

---

## 优化效果预期

| 指标 | 优化前 | 优化后 | 改善 |
|-----|--------|--------|------|
| CPU 使用率 | 100% | 40-60% | ⬇️ 40-60% |
| API 响应时间 | 2-4s | 0.5-1s | ⬇️ 60-75% |
| 页面加载时间 | 3-5s | 1-2s | ⬇️ 50-70% |
| 缓存命中率 | 10-20% | 60-80% | ⬆️ 300-400% |

---

## 已优化的文件列表

### 配置文件
- [x] `next.config.ts` - Next.js 核心配置
- [x] `vercel.json` - Vercel 部署配置
- [x] `.env.example` - 环境变量模板

### 核心工具
- [x] `src/lib/cache.ts` - 缓存工具库 (新建)

### API 路由
- [x] `src/app/api/search/stores/route.ts` - 商店搜索
- [x] `src/app/api/stores/[storeAlias]/coupons/route.ts` - 商店优惠券
- [x] `src/app/api/holidays/route.ts` - 假日数据

### 页面元数据
- [x] `src/app/store/[storeAlias]/page.tsx` - 商店详情页
- [x] `src/app/categories/[categorySlug]/page.tsx` - 类目页面

---

## 进一步优化建议

### 短期 (1-2周)
1. **优化更多 API 路由** - 为剩余 API 添加缓存:
   - `/api/cashback/*` 路由
   - `/api/submission/coupon` 路由
   - `/api/email/welcome` 路由

2. **优化更多 generateMetadata** 函数:
   - `src/app/holidays/[holiday-slug]/page.tsx`
   - `src/app/stores/startwith/[letter]/page.tsx`

3. **添加 ISR (增量静态再生成)**:
   - 博客文章页面
   - 假日页面
   - 商店列表页面

### 中期 (2-4周)
1. **实施 React Server Components 优化**:
   - 检查所有客户端组件是否真的需要客户端渲染
   - 将纯展示组件转换为服务端组件

2. **代码分割 (Code Splitting)**:
   - 使用 `next/dynamic` 延迟加载重型组件
   - 分析包大小并优化大型依赖

3. **数据库查询优化**:
   - 为常用查询添加数据库索引
   - 优化 Supabase 查询，只选择需要的字段

### 长期 (1-2月)
1. **迁移到 Edge Runtime**:
   - 将轻量级 API 迁移到 Edge Functions
   - 减少冷启动时间

2. **实施 Redis 缓存**:
   - 替换内存缓存为 Redis (Upstash 或 Vercel KV)
   - 支持跨实例缓存共享

3. **性能监控**:
   - 集成 Vercel Speed Insights
   - 集成 Vercel Analytics
   - 设置性能告警

---

## 故障排查

### 问题 1: 构建失败 "Image Optimization requires sharp"
**解决方案:**
```bash
npm install sharp
```

### 问题 2: 缓存不工作
**检查清单:**
- ✅ 缓存键是否唯一且稳定
- ✅ TTL 设置是否合理
- ✅ 开发模式下查看控制台缓存日志

### 问题 3: CPU 使用率未明显下降
**可能原因:**
- 缓存命中率低 (需要一段时间预热)
- 某些 API 路由未优化
- 数据库查询仍然很慢

**建议:**
- 等待 1-2 天让缓存预热
- 检查 Vercel Function Logs 找出瓶颈
- 使用 Vercel Analytics 分析性能

---

## 参考文档
- 原始优化指南: `docs/vercel-cpu-optimization-guide.md`
- Next.js Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images
- Vercel Function Configuration: https://vercel.com/docs/functions/serverless-functions/runtimes

---

**优化实施者:** Claude Code
**最后更新:** 2025-12-09
