-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  excerpt text,
  featured_image_url text,
  author_name character varying NOT NULL,
  is_published boolean DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cashback_payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  method character varying NOT NULL CHECK (method::text = ANY (ARRAY['paypal'::character varying, 'bank_transfer'::character varying, 'gift_card'::character varying]::text[])),
  payment_details jsonb NOT NULL,
  status character varying NOT NULL CHECK (status::text = ANY (ARRAY['requested'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying]::text[])),
  requested_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  completed_at timestamp with time zone,
  notes text,
  CONSTRAINT cashback_payouts_pkey PRIMARY KEY (id),
  CONSTRAINT cashback_payouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.cashback_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  store_id uuid NOT NULL,
  coupon_id uuid,
  order_amount numeric NOT NULL,
  cashback_amount numeric NOT NULL,
  cashback_rate numeric NOT NULL,
  status character varying NOT NULL CHECK (status::text = ANY (ARRAY['pending'::character varying, 'confirmed'::character varying, 'paid'::character varying, 'rejected'::character varying]::text[])),
  transaction_id character varying,
  order_reference character varying,
  clicked_at timestamp with time zone,
  purchased_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  paid_at timestamp with time zone,
  expires_at timestamp with time zone,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cashback_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT cashback_transactions_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id),
  CONSTRAINT cashback_transactions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT cashback_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  slug character varying NOT NULL UNIQUE,
  image text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
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
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid,
  title character varying NOT NULL,
  subtitle text NOT NULL,
  code character varying,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['code'::character varying::text, 'deal'::character varying::text])),
  discount_value character varying NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  expires_at timestamp with time zone,
  is_popular boolean DEFAULT false,
  min_spend numeric,
  view_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  external_id character varying UNIQUE,
  commission_rate numeric,
  commission_model character varying,
  countries character varying,
  domains character varying,
  CONSTRAINT coupons_pkey PRIMARY KEY (id),
  CONSTRAINT coupons_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT faqs_pkey PRIMARY KEY (id),
  CONSTRAINT faqs_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.featured_coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coupon_id uuid,
  featured_date date NOT NULL DEFAULT CURRENT_DATE,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT featured_coupons_pkey PRIMARY KEY (id),
  CONSTRAINT featured_coupons_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id)
);
CREATE TABLE public.holiday_coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  holiday_id uuid NOT NULL,
  coupon_id uuid NOT NULL,
  holiday_name character varying NOT NULL,
  holiday_type character varying,
  holiday_date date,
  match_source character varying,
  match_text text,
  confidence_score numeric DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT holiday_coupons_pkey PRIMARY KEY (id),
  CONSTRAINT holiday_coupons_holiday_id_fkey FOREIGN KEY (holiday_id) REFERENCES public.holidays(id),
  CONSTRAINT holiday_coupons_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id)
);
CREATE TABLE public.holidays (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  slug character varying NOT NULL UNIQUE,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['Federal Holiday'::character varying::text, 'Observance'::character varying::text, 'Shopping Event'::character varying::text])),
  description text,
  holiday_date date,
  is_dynamic boolean DEFAULT false,
  month_number integer CHECK (month_number >= 1 AND month_number <= 12),
  day_number integer CHECK (day_number >= 1 AND day_number <= 31),
  banner_image_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT holidays_pkey PRIMARY KEY (id)
);
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  bonus_amount numeric DEFAULT 5.00,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'completed'::character varying, 'paid'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT referrals_pkey PRIMARY KEY (id),
  CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.users(id),
  CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES public.users(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  author_name character varying NOT NULL,
  title character varying NOT NULL,
  content text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id)
);
CREATE TABLE public.similar_stores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid,
  similar_store_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT similar_stores_pkey PRIMARY KEY (id),
  CONSTRAINT similar_stores_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT similar_stores_similar_store_id_fkey FOREIGN KEY (similar_store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key character varying NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.store_cashback_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  cashback_rate numeric NOT NULL,
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
CREATE TABLE public.store_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid,
  category_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT store_categories_pkey PRIMARY KEY (id),
  CONSTRAINT store_categories_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT store_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.stores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  alias character varying NOT NULL UNIQUE,
  logo_url text,
  description text NOT NULL,
  website character varying NOT NULL,
  url text NOT NULL,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  active_offers_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  external_id character varying UNIQUE,
  link_id character varying,
  category character varying,
  shipping_country character varying,
  commission_rate_data jsonb,
  countries_data jsonb,
  domains_data jsonb,
  commission_model_data jsonb,
  discount_analysis jsonb,
  CONSTRAINT stores_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sync_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sync_type character varying NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  status character varying NOT NULL,
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sync_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  password_hash character varying,
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