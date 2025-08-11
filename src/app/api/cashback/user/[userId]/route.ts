import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = createClient();
    const { userId } = await params;
    
    // Get user cashback summary
    const { data: user } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        total_cashback_earned,
        total_cashback_withdrawn,
        total_cashback_pending,
        referral_code
      `)
      .eq('id', userId)
      .single();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get recent transactions
    const { data: transactions } = await supabase
      .from('cashback_transactions')
      .select(`
        id,
        order_amount,
        cashback_amount,
        cashback_rate,
        status,
        purchased_at,
        confirmed_at,
        stores(name, logo_url),
        coupons(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Get pending payouts
    const { data: payouts } = await supabase
      .from('cashback_payouts')
      .select('id, amount, method, status, requested_at')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false })
      .limit(5);
    
    return NextResponse.json({
      user,
      transactions: transactions || [],
      payouts: payouts || [],
      availableBalance: user.total_cashback_earned - user.total_cashback_withdrawn - user.total_cashback_pending
    });
    
  } catch (error) {
    console.error('Get user cashback error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user cashback data' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { action, ...data } = await request.json();
    const supabase = createClient();
    const { userId } = await params;
    
    switch (action) {
      case 'request_payout':
        const { amount, method, paymentDetails } = data;
        
        // Verify user has sufficient balance
        const { data: user } = await supabase
          .from('users')
          .select('total_cashback_earned, total_cashback_withdrawn, total_cashback_pending')
          .eq('id', userId)
          .single();
        
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        const availableBalance = user.total_cashback_earned - user.total_cashback_withdrawn - user.total_cashback_pending;
        
        if (amount > availableBalance) {
          return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }
        
        // Create payout request
        const { data: payout } = await supabase
          .from('cashback_payouts')
          .insert({
            user_id: userId,
            amount,
            method,
            payment_details: paymentDetails,
            status: 'requested'
          })
          .select()
          .single();
        
        // Update user pending amount
        await supabase
          .from('users')
          .update({ total_cashback_pending: user.total_cashback_pending + amount })
          .eq('id', userId);
        
        return NextResponse.json({ success: true, payout });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Update user cashback error:', error);
    return NextResponse.json(
      { error: 'Failed to update user cashback' },
      { status: 500 }
    );
  }
}