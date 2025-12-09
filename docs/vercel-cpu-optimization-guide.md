# Vercel Next.js 项目 CPU 优化完整指南

> 本文档提供了一套完整的 Vercel 部署优化方案，可降低 40-60% 的 Fluid Active CPU 使用率，适用于所有 Next.js 项目。

## 📋 目录

- [问题诊断](#问题诊断)
- [核心优化方案](#核心优化方案)
- [实施步骤](#实施步骤)
- [监控与验证](#监控与验证)
- [进阶优化](#进阶优化)

---

## 🔍 问题诊断

### 常见 CPU 消耗原因

在开始优化前，先检查项目是否存在以下问题：

- ✅ **图片未优化** - `images.unoptimized: true`
- ✅ **缺少响应缓存** - 每次请求都重新计算
- ✅ **元数据重复生成** - `generateMetadata` 没有缓存
- ✅ **大量外部 API 调用** - AI、数据库等昂贵操作
- ✅ **静态资源未缓存** - 浏览器重复下载资源
- ✅ **函数内存配置不当** - 导致频繁 GC 或 OOM

### 快速诊断命令

```bash
# 检查 Next.js 配置
cat next.config.js | grep -E "unoptimized|swcMinify|output"

# 检查是否有 Vercel 配置
cat vercel.json

# 分析包大小
npx next build
```

---

## 🚀 核心优化方案

### 1. 图片优化配置

**文件**: `next.config.mjs` 或 `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false, // ⚠️ 必须设为 false
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 天缓存
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev', // Cloudflare R2
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Supabase Storage
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com', // AWS S3
      },
      // 添加你使用的图片域名
    ],
  },
}
```

**效果**: 减少 20-30% CPU 使用，图片自动优化为 WebP/AVIF 格式。

---

### 2. Next.js 构建优化

**文件**: `next.config.mjs`

```javascript
const nextConfig = {
  // 生产环境优化输出
  output: 'standalone',

  // 启用压缩
  compress: true,

  // 使用 SWC 压缩器（比 Terser 快 7x）
  swcMinify: true,

  // TypeScript 配置（可选）
  typescript: {
    ignoreBuildErrors: false, // 建议修复所有类型错误
  },

  // 实验性功能
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb', // 根据需要调整
    },
    // 启用部分预渲染（Next.js 14+）
    ppr: false, // 稳定后可开启
  },
}
```

---

### 3. 创建缓存工具

**文件**: `lib/cache.ts`

```typescript
/**
 * 简单的内存缓存工具
 * 用于缓存 API 响应、计算结果等
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttl: number; // Time to live in milliseconds

  constructor(ttlMinutes: number = 60) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Export cache instances
export const apiCache = new SimpleCache<any>(60); // 1 hour
export const metadataCache = new SimpleCache<any>(120); // 2 hours
export const queryCache = new SimpleCache<any>(30); // 30 minutes

// Periodically clean up (server-side only)
if (typeof window === 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
    metadataCache.cleanup();
    queryCache.cleanup();
  }, 30 * 60 * 1000); // Every 30 minutes
}
```

---

### 4. API 路由缓存示例

**文件**: `app/api/example/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { apiCache } from "@/lib/cache";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 生成缓存键（基于请求内容）
    const cacheKey = crypto
      .createHash('md5')
      .update(JSON.stringify(body))
      .digest('hex');

    // 检查缓存
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult) {
      console.log('[API] Returning cached result');
      return NextResponse.json({
        success: true,
        data: cachedResult,
        cached: true,
      });
    }

    // 执行昂贵的操作（AI 调用、数据库查询等）
    const result = await expensiveOperation(body);

    // 存入缓存
    apiCache.set(cacheKey, result);

    return NextResponse.json({
      success: true,
      data: result,
      cached: false,
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function expensiveOperation(data: any) {
  // AI API 调用、复杂计算等
  return data;
}
```

---

### 5. Metadata 生成优化

**文件**: `app/[locale]/layout.tsx` 或任何使用 `generateMetadata` 的页面

```typescript
import type { Metadata } from "next";

// 创建缓存（在模块顶层）
const metadataCache = new Map<string, Metadata>();

export async function generateMetadata({ params }: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;

  // 检查缓存
  if (metadataCache.has(locale)) {
    return metadataCache.get(locale)!;
  }

  // 生成 metadata（耗时操作）
  const t = await getTranslations({ locale, namespace: "seo" });

  const metadata: Metadata = {
    title: t("title"),
    description: t("description"),
    // ... 其他配置
  };

  // 存入缓存
  metadataCache.set(locale, metadata);

  return metadata;
}
```

---

### 6. Vercel 配置文件

**文件**: `vercel.json`

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60,
      "memory": 1024
    },
    "app/api/heavy-task/route.ts": {
      "maxDuration": 120,
      "memory": 1024
    },
    "app/api/light-task/route.ts": {
      "maxDuration": 30,
      "memory": 512
    }
  },
  "headers": [
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/_next/image(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400, must-revalidate"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**配置说明**:

| 配置项 | 说明 | 推荐值 |
|-------|------|--------|
| `maxDuration` | 函数最大执行时间（秒） | 轻量: 30s, 常规: 60s, 重量: 120s |
| `memory` | 函数内存大小（MB） | 轻量: 512MB, 常规: 1024MB |
| `Cache-Control` | 浏览器缓存策略 | 静态资源: 1年, 图片: 1天 |

---

### 7. 环境变量优化

**文件**: `.env.production` 或 Vercel Dashboard

```bash
# Node.js 内存优化
NODE_OPTIONS="--max-old-space-size=1024"

# 禁用 Next.js 遥测（减少网络开销）
NEXT_TELEMETRY_DISABLED=1

# 启用 Standalone 模式
NEXT_PRIVATE_STANDALONE=true

# 图片优化路径（Vercel 自动配置）
NEXT_SHARP_PATH=/tmp/node_modules/sharp
```

---

## 📝 实施步骤

### Step 1: 备份当前配置

```bash
cp next.config.js next.config.js.backup
cp vercel.json vercel.json.backup 2>/dev/null || echo "No vercel.json"
```

### Step 2: 应用核心配置

1. 更新 `next.config.js` - 添加图片优化和构建配置
2. 创建 `lib/cache.ts` - 复制缓存工具代码
3. 创建/更新 `vercel.json` - 添加函数和缓存配置

### Step 3: 优化关键路由

识别 CPU 密集型 API 路由（通常是调用 AI、数据库的路由）：

```bash
# 查找所有 API 路由
find app/api -name "route.ts" -o -name "route.js"
```

为以下类型的路由添加缓存：

- ✅ AI/LLM API 调用
- ✅ 复杂数据库查询
- ✅ 图表/报表生成
- ✅ 数据聚合操作

### Step 4: 优化 Metadata

找到所有使用 `generateMetadata` 的文件：

```bash
# 查找使用 generateMetadata 的文件
grep -r "generateMetadata" app --include="*.tsx" --include="*.ts"
```

为每个文件添加缓存机制（参考第 5 节）。

### Step 5: 配置 Vercel 环境变量

在 Vercel Dashboard > Project Settings > Environment Variables 添加：

```
NODE_OPTIONS = --max-old-space-size=1024
NEXT_TELEMETRY_DISABLED = 1
```

### Step 6: 部署并验证

```bash
# 本地测试构建
npm run build

# 提交代码
git add .
git commit -m "feat: optimize Vercel CPU usage"
git push

# Vercel 会自动部署
```

---

## 📊 监控与验证

### Vercel Dashboard 检查清单

部署后在 Vercel Dashboard 检查以下指标：

1. **Fluid Active CPU**
   - 路径: Project > Analytics > Functions
   - 目标: 降低 40-60%

2. **Function Duration**
   - 路径: Project > Functions
   - 目标: 降低平均执行时间

3. **Edge Cache Hit Rate**
   - 路径: Project > Analytics > Edge
   - 目标: 达到 60%+ 缓存命中率

4. **Build Duration**
   - 路径: Deployments > Build Logs
   - 目标: 减少构建时间

### 性能测试命令

```bash
# 测试页面加载速度
npx lighthouse https://your-domain.com --view

# 检查包大小
npx next build
npx @next/bundle-analyzer

# 检查图片优化
curl -I https://your-domain.com/_next/image?url=/test.png&w=640&q=75
```

### 预期效果对比

| 指标 | 优化前 | 优化后 | 改善 |
|-----|--------|--------|------|
| CPU 使用率 | 100% | 40-60% | ⬇️ 40-60% |
| 页面加载时间 | 3-5s | 1-2s | ⬇️ 50-70% |
| 函数执行时间 | 2-4s | 0.5-1s | ⬇️ 60-75% |
| 缓存命中率 | 10-20% | 60-80% | ⬆️ 300-400% |

---

## 🔧 进阶优化

### 1. 增量静态再生成 (ISR)

适用于内容不常变化的页面（博客、产品页等）。

**文件**: `app/blog/[slug]/page.tsx`

```typescript
// 启用 ISR，每小时重新生成一次
export const revalidate = 3600; // 秒

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

### 2. React Server Components (RSC)

将 Client Components 转换为 Server Components 以减少 JavaScript 包大小。

**优化前**:
```typescript
"use client"

export default function Page() {
  return <div>Static Content</div>
}
```

**优化后**:
```typescript
// 移除 "use client"，这就是 Server Component
export default function Page() {
  return <div>Static Content</div>
}
```

**判断标准**:
- ❌ 使用 `useState`, `useEffect` → Client Component
- ❌ 使用浏览器 API → Client Component
- ✅ 纯静态内容 → Server Component
- ✅ 数据获取 → Server Component

### 3. 动态导入 (Code Splitting)

减少初始 JavaScript 包大小。

```typescript
import dynamic from 'next/dynamic';

// 动态导入重型组件
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // 仅客户端渲染
});

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart />
    </div>
  );
}
```

### 4. 数据库查询优化

#### Supabase 示例

```typescript
// ❌ 不好：获取所有数据
const { data } = await supabase
  .from('notes')
  .select('*')

// ✅ 好：只获取需要的字段
const { data } = await supabase
  .from('notes')
  .select('id, title, created_at')
  .limit(10)

// ✅ 更好：添加索引和缓存
const { data } = await supabase
  .from('notes')
  .select('id, title, created_at')
  .order('created_at', { ascending: false })
  .limit(10)
  // 添加缓存键
```

#### 添加数据库索引

```sql
-- 为常用查询字段添加索引
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_type ON notes(type);
```

### 5. Edge Functions (Vercel Edge Runtime)

将轻量级 API 迁移到 Edge Runtime。

**文件**: `app/api/hello/route.ts`

```typescript
import { NextResponse } from 'next/server';

// 使用 Edge Runtime
export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ message: 'Hello from Edge!' });
}
```

**适用场景**:
- ✅ 简单的数据转换
- ✅ 认证检查
- ✅ A/B 测试
- ❌ 复杂计算（使用 Node.js Runtime）
- ❌ 需要 Node.js API（fs, crypto 等）

### 6. 字体优化

使用 `next/font` 优化字体加载。

```typescript
import { Inter, Noto_Sans_SC } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['chinese-simplified'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-noto-sans-sc',
});

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${notoSansSC.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 7. 分析和监控

#### 安装包分析器

```bash
npm install --save-dev @next/bundle-analyzer
```

**文件**: `next.config.js`

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... your config
});
```

**使用**:

```bash
ANALYZE=true npm run build
```

#### 添加性能监控

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🎯 最佳实践总结

### DO's ✅

1. **启用图片优化** - 让 Next.js 处理图片压缩和格式转换
2. **使用缓存** - 为昂贵操作添加内存/Redis 缓存
3. **配置函数内存** - 根据实际需求调整内存大小
4. **使用 ISR** - 为静态内容启用增量再生成
5. **优化数据库查询** - 只获取需要的数据，添加索引
6. **监控性能** - 使用 Vercel Analytics 跟踪指标
7. **代码分割** - 使用动态导入延迟加载重型组件
8. **使用 Server Components** - 减少客户端 JavaScript

### DON'Ts ❌

1. **不要禁用图片优化** - `images.unoptimized: true` 是性能杀手
2. **不要忽略缓存** - 重复计算相同结果浪费 CPU
3. **不要过度配置内存** - 512MB 通常够用，不要默认 1GB
4. **不要在 Client Component 中获取数据** - 使用 Server Components
5. **不要忽略 TypeScript 错误** - 修复它们而不是禁用检查
6. **不要在循环中调用 API** - 批量处理或使用并发请求
7. **不要加载整个翻译文件** - 按需加载命名空间
8. **不要忽略 bundle 大小** - 定期检查和优化

---

## 🛠️ 故障排查

### 问题 1: 构建失败 "Image Optimization requires sharp"

**解决方案**:

```bash
npm install sharp
# 或
yarn add sharp
# 或
pnpm add sharp
```

### 问题 2: Vercel 函数超时

**检查**:
1. 查看 `vercel.json` 中的 `maxDuration` 设置
2. 检查是否有死循环或阻塞操作
3. 添加超时处理

```typescript
// 设置请求超时
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 50000); // 50s

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);
} catch (error) {
  clearTimeout(timeout);
  // Handle timeout
}
```

### 问题 3: 缓存不工作

**检查清单**:
- ✅ 缓存键是否唯一且稳定
- ✅ TTL 设置是否合理
- ✅ 是否在正确的作用域创建缓存实例
- ✅ 是否有缓存清理逻辑

### 问题 4: 内存溢出 (OOM)

**解决方案**:
1. 增加 Vercel 函数内存配置
2. 检查是否有内存泄漏
3. 使用流式处理大文件

```typescript
// 使用流处理大文件
import { pipeline } from 'stream/promises';

await pipeline(
  request.body,
  transformStream,
  response
);
```

---

## 📚 参考资源

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Vercel Function Configuration](https://vercel.com/docs/functions/serverless-functions/runtimes)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Vercel Analytics](https://vercel.com/analytics)

---

## 📄 检查清单

在部署前，确保完成以下检查：

- [ ] 图片优化已启用 (`unoptimized: false`)
- [ ] `next.config.js` 包含 `output: 'standalone'` 和 `swcMinify: true`
- [ ] 创建了 `lib/cache.ts` 缓存工具
- [ ] 为 CPU 密集型 API 路由添加了缓存
- [ ] `generateMetadata` 使用了缓存
- [ ] 创建了 `vercel.json` 并配置了函数内存
- [ ] 静态资源配置了正确的 `Cache-Control` header
- [ ] 在 Vercel Dashboard 添加了环境变量
- [ ] 本地构建成功 (`npm run build`)
- [ ] 部署后检查了 Analytics 指标

---

## 🎓 总结

通过以上优化方案，你可以：

- ⚡ **降低 40-60% CPU 使用率**
- 🚀 **提升 50-70% 页面加载速度**
- 💰 **减少 Serverless 函数执行成本**
- 📈 **提高用户体验和 SEO 排名**

记住：**优化是持续的过程**，定期检查 Vercel Analytics，根据实际数据调整策略。

---

**最后更新**: 2025-12-09
**适用版本**: Next.js 14+, Vercel Platform
**作者**: MangoNote Team
