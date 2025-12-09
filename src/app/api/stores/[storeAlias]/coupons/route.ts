import { NextRequest, NextResponse } from 'next/server';
import { getStoreByAlias, getStoreCoupons } from '@/lib/api';
import { storeCache, couponCache } from '@/lib/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeAlias: string }> }
) {
  try {
    const { storeAlias } = await params;

    if (!storeAlias) {
      return NextResponse.json(
        { error: 'Store alias is required', coupons: [] },
        { status: 400 }
      );
    }

    // Generate cache key for this store's data
    const storeCacheKey = `store:${storeAlias}`;
    const couponCacheKey = `coupons:${storeAlias}`;

    // Check cache for store
    let store = storeCache.get(storeCacheKey);
    let fromCache = false;

    if (!store) {
      // Get store information from database
      store = await getStoreByAlias(storeAlias);

      if (!store) {
        return NextResponse.json(
          { error: 'Store not found', coupons: [] },
          { status: 404 }
        );
      }

      // Cache the store data
      storeCache.set(storeCacheKey, store);
    } else {
      fromCache = true;
    }

    // Check cache for coupons
    let coupons = couponCache.get(couponCacheKey);

    if (!coupons) {
      // Get coupons for the store from database
      coupons = await getStoreCoupons(store.id);

      // Cache the coupons data (shorter TTL for freshness)
      couponCache.set(couponCacheKey, coupons);
    } else {
      fromCache = true;
    }

    return NextResponse.json({
      store: {
        id: store.id,
        name: store.name,
        alias: store.alias,
        logo_url: store.logo_url
      },
      coupons,
      cached: fromCache
    });
  } catch (error) {
    console.error('Store coupons API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', coupons: [] },
      { status: 500 }
    );
  }
}