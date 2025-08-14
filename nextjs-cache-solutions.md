# NextJS缓存问题诊断和解决方案

## 🔍 问题分析

### 本地环境和生产环境数据不一致的原因：

1. **Static Site Generation (SSG)**
   - 生产环境在构建时生成静态页面
   - 数据被"锁定"在构建时的状态
   - 本地开发环境每次都是动态渲染

2. **NextJS 15 App Router 缓存层级**
   - **Router Cache**: 客户端路由缓存
   - **Full Route Cache**: 服务端路由和页面缓存
   - **Data Cache**: fetch() 和第三方库请求缓存
   - **Request Memoization**: 单个请求周期内的重复请求缓存

3. **Supabase客户端缓存**
   - Supabase JS客户端可能有内置缓存
   - 查询结果可能在一定时间内被缓存

## ✅ 解决方案

### 方案1: 强制动态渲染（已应用）

```typescript
// 在 /store/[storeAlias]/page.tsx 中添加
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

### 方案2: 使用 ISR (Incremental Static Regeneration)

```typescript
// 替代方案1，如果想保持静态生成但定期更新
export const revalidate = 300; // 5分钟重新验证
// 移除 export const dynamic = 'force-dynamic';
```

### 方案3: 在API层面添加缓存控制

```typescript
// 在 src/lib/api.ts 中为每个函数添加
export async function getStoreCoupons(storeId: string) {
  try {
    // 添加随机查询参数或时间戳防止缓存
    const timestamp = Date.now();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('type', { ascending: true })
      .order('is_popular', { ascending: false })
      .order('created_at', { ascending: false });
    
    // 强制刷新Supabase缓存
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching store coupons:', error);
    return [];
  }
}
```

### 方案4: 使用 unstable_noStore

```typescript
import { unstable_noStore as noStore } from 'next/cache';

// 在每个数据获取函数开始时调用
export async function getStoreData(storeAlias: string) {
  noStore(); // 告诉 NextJS 不要缓存这个函数的结果
  
  const store = await getStoreByAlias(storeAlias);
  // ... 其余代码
}
```

## 🔧 调试步骤

### 1. 检查网络请求
```bash
# 开发环境
npm run dev
# 检查 Network 标签页，看是否有实际的数据库请求

# 生产环境  
npm run build
npm run start
# 比较两者的网络请求差异
```

### 2. 添加调试日志
```typescript
// 在 getStoreCoupons 中添加更多日志
console.log('Environment:', process.env.NODE_ENV);
console.log('Timestamp:', new Date().toISOString());
console.log('Store ID:', storeId);
console.log('Fetched coupons count:', data?.length);
```

### 3. 检查Supabase连接
```typescript
// 在 src/lib/supabase.ts 中添加
export const supabaseWithLogging = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      // 禁用连接池缓存
      schema: 'public'
    }
  }
);
```

## 🎯 推荐的最终解决方案

### 对于优惠券数据（经常变化）
```typescript
// page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

### 对于商家信息（不经常变化）
```typescript
// 如果商家信息不经常变化，可以使用ISR
export const revalidate = 3600; // 1小时重新验证
```

### 混合策略
```typescript
// 商家基本信息使用静态生成 + ISR
// 优惠券数据使用客户端获取

// 在 StoreDetailClient 中使用 useEffect 获取优惠券
useEffect(() => {
  async function fetchLatestCoupons() {
    const response = await fetch(`/api/stores/${store.id}/coupons`);
    const latestCoupons = await response.json();
    setCoupons(latestCoupons);
  }
  fetchLatestCoupons();
}, [store.id]);
```

## 🚨 注意事项

1. **性能影响**: `force-dynamic` 会让每个请求都重新渲染，影响性能
2. **SEO考虑**: 动态渲染可能影响首次加载的SEO效果
3. **成本考虑**: 更多的服务器渲染意味着更高的计算成本

## ✨ 验证方法

1. **构建测试**:
```bash
npm run build
npm run start
# 访问 /store/tickets-at-work 检查数据是否最新
```

2. **添加时间戳**:
在页面中显示数据获取时间来验证是否为最新数据

3. **比较环境**:
同时打开本地和生产环境，比较相同商家的优惠券数据