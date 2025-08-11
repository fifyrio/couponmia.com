-- Cashback System Database Schema
-- Add these tables to your existing database

-- User accounts for cashback tracking
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  password_hash character varying, -- NULL for OAuth users
  is_verified boolean DEFAULT false,
  verification_token character varying,
  total_cashback_earned numeric DEFAULT 0,
  total_cashback_withdrawn numeric DEFAULT 0,
  total_cashback_pending numeric DEFAULT 0,
  referral_code character varying UNIQUE,
  referred_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.users(id)
);

-- Cashback transactions
CREATE TABLE public.cashback_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  store_id uuid NOT NULL,
  coupon_id uuid,
  order_amount numeric NOT NULL,
  cashback_amount numeric NOT NULL,
  cashback_rate numeric NOT NULL,
  status character varying NOT NULL CHECK (status IN ('pending', 'confirmed', 'paid', 'rejected')),
  transaction_id character varying, -- External affiliate transaction ID
  order_reference character varying, -- Store order reference
  clicked_at timestamp with time zone,
  purchased_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  paid_at timestamp with time zone,
  expires_at timestamp with time zone,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cashback_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT cashback_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT cashback_transactions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT cashback_transactions_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id)
);

-- Cashback payouts
CREATE TABLE public.cashback_payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  method character varying NOT NULL CHECK (method IN ('paypal', 'bank_transfer', 'gift_card')),
  payment_details jsonb NOT NULL,
  status character varying NOT NULL CHECK (status IN ('requested', 'processing', 'completed', 'failed')),
  requested_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  completed_at timestamp with time zone,
  notes text,
  CONSTRAINT cashback_payouts_pkey PRIMARY KEY (id),
  CONSTRAINT cashback_payouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Store cashback rates (overrides default commission rates)
CREATE TABLE public.store_cashback_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  cashback_rate numeric NOT NULL, -- Percentage of commission shared with users
  min_order_amount numeric DEFAULT 0,
  max_cashback_amount numeric,
  is_active boolean DEFAULT true,
  valid_from timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT store_cashback_rates_pkey PRIMARY KEY (id),
  CONSTRAINT store_cashback_rates_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- Click tracking for attribution
CREATE TABLE public.click_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  store_id uuid NOT NULL,
  coupon_id uuid,
  ip_address inet,
  user_agent text,
  referrer text,
  session_id character varying,
  affiliate_url text NOT NULL,
  clicked_at timestamp with time zone DEFAULT now(),
  CONSTRAINT click_tracking_pkey PRIMARY KEY (id),
  CONSTRAINT click_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT click_tracking_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT click_tracking_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id)
);

-- Referral tracking
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  bonus_amount numeric DEFAULT 5.00,
  status character varying NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'paid')),
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT referrals_pkey PRIMARY KEY (id),
  CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.users(id),
  CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES public.users(id)
);

-- Indexes for performance
CREATE INDEX idx_cashback_transactions_user_id ON public.cashback_transactions(user_id);
CREATE INDEX idx_cashback_transactions_status ON public.cashback_transactions(status);
CREATE INDEX idx_cashback_transactions_created_at ON public.cashback_transactions(created_at);
CREATE INDEX idx_click_tracking_user_id ON public.click_tracking(user_id);
CREATE INDEX idx_click_tracking_clicked_at ON public.click_tracking(clicked_at);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_referral_code ON public.users(referral_code);