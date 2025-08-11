import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { storeId, couponId, userId, sessionId } = await request.json();
    const supabase = createClient();
    
    // Get client IP and user agent
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';
    
    // Get store information to build affiliate URL
    const { data: store } = await supabase
      .from('stores')
      .select('url, affiliate_url')
      .eq('id', storeId)
      .single();
    
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    // Track the click
    const { data: clickData } = await supabase
      .from('click_tracking')
      .insert({
        user_id: userId,
        store_id: storeId,
        coupon_id: couponId,
        ip_address: ip,
        user_agent: userAgent,
        referrer,
        session_id: sessionId,
        affiliate_url: store.affiliate_url || store.url
      })
      .select()
      .single();
    
    // Return the affiliate URL with tracking parameters
    const trackingUrl = new URL(store.affiliate_url || store.url);
    trackingUrl.searchParams.set('cm_click_id', clickData?.id || '');
    if (userId) trackingUrl.searchParams.set('cm_user_id', userId);
    
    return NextResponse.json({ 
      success: true,
      redirectUrl: trackingUrl.toString(),
      clickId: clickData?.id
    });
    
  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}