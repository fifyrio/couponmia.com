import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      storeId, 
      couponId, 
      orderAmount, 
      transactionId, 
      orderReference 
    } = await request.json();
    
    const supabase = createClient();
    
    // Get store cashback rate or use default commission rate
    const { data: store } = await supabase
      .from('stores')
      .select(`
        id,
        name,
        commission_rate_data,
        store_cashback_rates!inner(cashback_rate, is_active, valid_from, valid_until)
      `)
      .eq('id', storeId)
      .eq('store_cashback_rates.is_active', true)
      .single();
    
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    // Calculate cashback rate
    let cashbackRate = 2.0; // Default 2% cashback
    
    if (store.store_cashback_rates?.length > 0) {
      const rate = store.store_cashback_rates[0];
      const now = new Date();
      const validFrom = rate.valid_from ? new Date(rate.valid_from) : null;
      const validUntil = rate.valid_until ? new Date(rate.valid_until) : null;
      
      if ((!validFrom || now >= validFrom) && (!validUntil || now <= validUntil)) {
        cashbackRate = rate.cashback_rate;
      }
    } else if (store.commission_rate_data) {
      // Use 50% of commission rate as cashback
      try {
        const commissionData = JSON.parse(store.commission_rate_data);
        if (commissionData.rate) {
          cashbackRate = commissionData.rate * 0.5;
        }
      } catch {
        console.log('Failed to parse commission rate data');
      }
    }
    
    const cashbackAmount = (orderAmount * cashbackRate) / 100;
    
    // Create cashback transaction
    const { data: transaction, error } = await supabase
      .from('cashback_transactions')
      .insert({
        user_id: userId,
        store_id: storeId,
        coupon_id: couponId,
        order_amount: orderAmount,
        cashback_amount: cashbackAmount,
        cashback_rate: cashbackRate,
        status: 'pending',
        transaction_id: transactionId,
        order_reference: orderReference,
        purchased_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days
      })
      .select()
      .single();
    
    if (error) {
      console.error('Transaction creation error:', error);
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
    
    // Update user's pending cashback
    await supabase.rpc('update_user_pending_cashback', {
      user_id: userId,
      amount: cashbackAmount
    });
    
    return NextResponse.json({ 
      success: true,
      transaction,
      cashbackAmount,
      cashbackRate
    });
    
  } catch (error) {
    console.error('Cashback transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to process cashback transaction' },
      { status: 500 }
    );
  }
}