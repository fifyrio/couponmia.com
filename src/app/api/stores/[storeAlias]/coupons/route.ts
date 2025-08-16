import { NextRequest, NextResponse } from 'next/server';
import { getStoreByAlias, getStoreCoupons } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { storeAlias: string } }
) {
  try {
    const { storeAlias } = params;

    if (!storeAlias) {
      return NextResponse.json(
        { error: 'Store alias is required', coupons: [] },
        { status: 400 }
      );
    }

    // Get store information
    const store = await getStoreByAlias(storeAlias);
    
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found', coupons: [] },
        { status: 404 }
      );
    }

    // Get coupons for the store
    const coupons = await getStoreCoupons(store.id);
    console.log('ww coupons:', coupons, store.id);
    
    return NextResponse.json({ 
      store: {
        id: store.id,
        name: store.name,
        alias: store.alias,
        logo_url: store.logo_url
      },
      coupons 
    });
  } catch (error) {
    console.error('Store coupons API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', coupons: [] },
      { status: 500 }
    );
  }
}