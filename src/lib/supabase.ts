import { createClient as createSupabaseClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Default supabase client
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Named export for API routes and server-side usage
export const createClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Database types based on schema
export interface Store {
  id: string;
  name: string;
  alias: string;
  logo_url?: string;
  description: string;
  website: string;
  url: string;
  rating: number;
  review_count: number;
  active_offers_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  store_id: string;
  title: string;
  subtitle: string;
  code?: string;
  type: 'code' | 'deal';
  discount_value: string;
  description: string;
  url: string;
  expires_at?: string;
  is_popular: boolean;
  min_spend?: number;
  view_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  store?: Store;
}


export interface Review {
  id: string;
  author_name: string;
  title: string;
  content: string;
  rating: number;
  is_featured: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image_url?: string;
  author_name: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export interface FeaturedCoupon {
  id: string;
  coupon_id: string;
  featured_date: string;
  display_order: number;
  created_at: string;
  coupon?: Coupon;
}

export interface FAQ {
  id: string;
  store_id?: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
}