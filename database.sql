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
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  slug character varying NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
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
  CONSTRAINT similar_stores_similar_store_id_fkey FOREIGN KEY (similar_store_id) REFERENCES public.stores(id),
  CONSTRAINT similar_stores_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key character varying NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.store_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid,
  category_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT store_categories_pkey PRIMARY KEY (id),
  CONSTRAINT store_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT store_categories_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
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