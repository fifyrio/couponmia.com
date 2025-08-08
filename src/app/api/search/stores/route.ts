import { NextRequest, NextResponse } from 'next/server';
import { searchStoresByName } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ stores: [] });
    }

    const stores = await searchStoresByName(query, limit);
    
    return NextResponse.json({ stores });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', stores: [] },
      { status: 500 }
    );
  }
}