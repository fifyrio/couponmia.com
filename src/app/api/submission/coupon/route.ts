import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      storeName,
      storeId,
      offerUrl,
      offerType,
      expirationDate,
      offerTitle,
      offerDescription,
      couponCode,
      merchantLogoUrl,
      merchantDescription,
      subtitle
    } = body;

    // Validate required fields
    if (!storeName || !offerUrl || !offerTitle || !offerType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(offerUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    let finalStoreId = storeId;

    // If no storeId provided, try to find or create the store
    if (!storeId && storeName) {
      // First, try to find existing store by name
      const { data: existingStore, error: searchError } = await supabase
        .from('stores')
        .select('id, alias')
        .ilike('name', `%${storeName}%`)
        .limit(1);

      if (searchError) {
        console.error('Error searching for store:', searchError);
      } else if (existingStore && existingStore.length > 0) {
        finalStoreId = existingStore[0].id;
      } else {
        // Create a new store entry for user submission
        const storeAlias = storeName
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        // Check if alias already exists
        const { data: existingByAlias } = await supabase
          .from('stores')
          .select('id')
          .eq('alias', storeAlias)
          .limit(1);

        if (existingByAlias && existingByAlias.length > 0) {
          // Use existing store if alias matches
          finalStoreId = existingByAlias[0].id;
        } else {
          // Create new store only if alias doesn't exist
          const storeData: any = {
            name: storeName,
            alias: storeAlias,
            description: merchantDescription || `User submitted store: ${storeName}`,
            website: offerUrl,
            url: offerUrl,
            is_featured: false,
            external_id: `user-submission-${Date.now()}`
          };

          // Add logo URL if provided
          if (merchantLogoUrl) {
            storeData.logo_url = merchantLogoUrl;
          }

          const { data: newStore, error: createError } = await supabase
            .from('stores')
            .insert(storeData)
            .select('id')
            .single();

          if (createError) {
            console.error('Error creating store:', createError);
            return NextResponse.json(
              { error: 'Failed to create store entry' },
              { status: 500 }
            );
          } else {
            finalStoreId = newStore.id;
          }
        }
      }
    }

    // Prepare coupon data
    const couponData = {
      store_id: finalStoreId,
      title: offerTitle,
      subtitle: subtitle || offerDescription || offerTitle,
      code: offerType === 'code' ? couponCode : null,
      type: offerType === 'code' ? 'code' : 'deal',
      discount_value: offerTitle.match(/(\d+%|\$\d+)/)?.[0] || 'Special Offer',
      description: offerDescription || offerTitle,
      url: offerUrl,
      expires_at: expirationDate ? new Date(expirationDate).toISOString() : null,
      is_popular: false,
      is_active: true,
      external_id: `user-submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Insert coupon into database
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .insert(couponData)
      .select()
      .single();

    if (couponError) {
      console.error('Error inserting coupon:', couponError);
      return NextResponse.json(
        { error: 'Failed to submit coupon' },
        { status: 500 }
      );
    }

    // Log the submission for tracking
    await supabase
      .from('sync_logs')
      .insert({
        sync_type: 'user_coupon_submission',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        status: 'completed',
        success_count: 1,
        error_count: 0,
        details: {
          store_name: storeName,
          store_id: finalStoreId,
          coupon_id: coupon.id,
          coupon_title: offerTitle,
          submission_timestamp: new Date().toISOString()
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Coupon submitted successfully',
      coupon_id: coupon.id
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}