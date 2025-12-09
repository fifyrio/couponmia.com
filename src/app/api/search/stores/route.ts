import { NextRequest, NextResponse } from 'next/server';
import { searchStoresByName, searchStoreByDomain } from '@/lib/api';
import { queryCache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const domain = searchParams.get('domain');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Domain search for Chrome extension
    if (domain) {
      // Generate cache key for domain search
      const cacheKey = `domain:${domain}`;

      // Check cache
      const cachedStore = queryCache.get(cacheKey);
      if (cachedStore !== null) {
        return NextResponse.json({ store: cachedStore, cached: true });
      }

      const store = await searchStoreByDomain(domain);

      // Store in cache
      queryCache.set(cacheKey, store);

      return NextResponse.json({ store, cached: false });
    }

    // Name search for website
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ stores: [] });
    }

    // Generate cache key for name search
    const cacheKey = `search:${query.toLowerCase()}:${limit}`;

    // Check cache
    const cachedStores = queryCache.get(cacheKey);
    if (cachedStores !== null) {
      return NextResponse.json({ stores: cachedStores, cached: true });
    }

    const stores = await searchStoresByName(query, limit);

    // Store in cache
    queryCache.set(cacheKey, stores);

    return NextResponse.json({ stores, cached: false });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', stores: [] },
      { status: 500 }
    );
  }
}