-- Cashback System Database Functions
-- Run this SQL directly in Supabase SQL Editor with elevated privileges

-- Function to execute arbitrary SQL (for script automation)
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS text AS $$
BEGIN
  EXECUTE sql;
  RETURN 'Success';
EXCEPTION WHEN OTHERS THEN
  RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user pending cashback
CREATE OR REPLACE FUNCTION update_user_pending_cashback(user_id uuid, amount numeric)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET total_cashback_pending = total_cashback_pending + amount,
      updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to confirm cashback transaction
CREATE OR REPLACE FUNCTION confirm_cashback_transaction(transaction_id uuid)
RETURNS void AS $$
DECLARE
  trans_record record;
BEGIN
  SELECT * INTO trans_record 
  FROM cashback_transactions 
  WHERE id = transaction_id;
  
  IF trans_record.status = 'pending' THEN
    -- Update transaction status
    UPDATE cashback_transactions 
    SET status = 'confirmed',
        confirmed_at = now(),
        updated_at = now()
    WHERE id = transaction_id;
    
    -- Update user totals
    UPDATE users 
    SET total_cashback_earned = total_cashback_earned + trans_record.cashback_amount,
        total_cashback_pending = total_cashback_pending - trans_record.cashback_amount,
        updated_at = now()
    WHERE id = trans_record.user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate cashback for a transaction
CREATE OR REPLACE FUNCTION calculate_cashback(
  store_id_param integer,
  transaction_amount numeric
)
RETURNS numeric AS $$
DECLARE
  cashback_rate numeric;
  cashback_amount numeric;
BEGIN
  -- Get the active cashback rate for the store
  SELECT scr.cashback_rate INTO cashback_rate
  FROM store_cashback_rates scr
  WHERE scr.store_id = store_id_param
    AND scr.is_active = true
    AND scr.valid_from <= now()
    AND (scr.valid_until IS NULL OR scr.valid_until > now())
  ORDER BY scr.valid_from DESC
  LIMIT 1;
  
  -- If no rate found, use default 2%
  IF cashback_rate IS NULL THEN
    cashback_rate := 2.0;
  END IF;
  
  -- Calculate cashback amount
  cashback_amount := transaction_amount * (cashback_rate / 100);
  
  -- Round to 2 decimal places
  RETURN ROUND(cashback_amount, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to get user's available cashback balance
CREATE OR REPLACE FUNCTION get_user_available_cashback(user_id uuid)
RETURNS numeric AS $$
DECLARE
  available_balance numeric;
BEGIN
  SELECT (total_cashback_earned - total_cashback_withdrawn - total_cashback_pending)
  INTO available_balance
  FROM users
  WHERE id = user_id;
  
  RETURN COALESCE(available_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_user_pending_cashback(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_cashback_transaction(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_cashback(integer, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_available_cashback(uuid) TO authenticated;

-- Only grant exec_sql to service_role for security
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;