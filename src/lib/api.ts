import { supabase } from './supabase';

// Featured Coupons for Today's Coupon Codes
export async function getFeaturedCoupons(limit: number = 6) {
  // Always return mock data for now since coupons table is empty
  // This ensures the component always has data to display
  console.log('getFeaturedCoupons: Returning mock data (coupons table is empty)');
  
  return [
    {
      title: "75% Off Select Clearance Sitewide Deals + Free Delivery",
      code: "SAVE75",
      views: "1.2k Views",
      store: "Amazon",
      discount: "75% OFF",
      expires: "Ends Today"
    },
    {
      title: "Buy 2 Get 1 Free on All Electronics + Extra 20% Off", 
      code: "TECH20",
      views: "856 Views",
      store: "Best Buy",
      discount: "BOGO + 20%",
      expires: "2 Days Left"
    }
  ];

  /* 
  // Original Supabase query - commented out until coupons table has data
  const { data, error } = await supabase
    .from('featured_coupons')
    .select(`
      *,
      coupon:coupons(
        *,
        store:stores(name, alias)
      )
    `)
    .order('display_order')
    .limit(limit);

  if (error || !data || data.length === 0 || !data[0].coupon) {
    console.error('Error fetching featured coupons or empty result:', error);
    // Return mock data if database error or no valid coupon data
    return mockData;
  }

  return data.map(item => ({
    title: item.coupon?.subtitle || item.coupon?.title || '',
    code: item.coupon?.code || '',
    views: `${Math.floor(Math.random() * 2000 + 100)} Views`,
    store: item.coupon?.store?.name || '',
    discount: item.coupon?.discount_value || '',
    expires: item.coupon?.expires_at ? 
      new Date(item.coupon.expires_at) > new Date() ? 'Ends Today' : 'Expired' :
      'No Expiry'
  }));
  */
}


// Featured Reviews - this function is no longer used as review data is now generated on the frontend
// Keeping for reference but marked as deprecated
export async function getFeaturedReviews(limit: number = 4) {
  console.warn('getFeaturedReviews is deprecated - review data is now generated on the frontend');
  return [];
}

// Recent Blog Posts
export async function getRecentPosts(limit: number = 5) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data?.map(post => ({
    title: post.title,
    date: new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    image: post.featured_image_url || "/api/placeholder/300/200"
  })) || [];
}

// New/Featured Stores
export async function getFeaturedStores(limit: number = 6) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured stores:', error);
    return [];
  }

  return data?.map(store => ({
    name: store.name,
    alias: store.alias,
    logo: store.logo_url || "/api/placeholder/120/60",
    deals: `${store.active_offers_count} Deals`,
    category: "Store", // Could be enhanced with category join
    rating: store.rating,
    reviews: store.review_count
  })) || [];
}

// FAQ Data - this function is no longer used as FAQ data is now generated on the frontend
// Keeping for reference but marked as deprecated
export async function getGeneralFAQs(limit: number = 8) {
  console.warn('getGeneralFAQs is deprecated - FAQ data is now generated on the frontend');
  return [];
}

// Email subscription (for the modal)
export async function subscribeToHolidayNotifications(email: string, holidayTitle: string) {
  // This would integrate with your email service (e.g., Mailgun, SendGrid, etc.)
  // For now, we'll just log the subscription
  console.log(`Email subscription: ${email} for ${holidayTitle}`);
  
  // You could store this in a separate subscriptions table
  // const { data, error } = await supabase
  //   .from('email_subscriptions')
  //   .insert([{ email, holiday_title: holidayTitle, subscribed_at: new Date() }]);
  
  return { success: true };
}

// Store-specific functions

// Get store by alias with categories
export async function getStoreByAlias(alias: string) {
  const { data, error } = await supabase
    .from('stores')
    .select(`
      *,
      store_categories (
        category:categories (
          name,
          slug
        )
      )
    `)
    .eq('alias', alias)
    .single();

  if (error) {
    console.error('Error fetching store:', error);
    return null;
  }

  return {
    ...data,
    categories: data.store_categories?.map(sc => sc.category.name) || []
  };
}

// Get active coupons for a store
export async function getStoreCoupons(storeId: string) {
  try {
    console.log('Fetching coupons for store ID:', storeId);
    
    // First try to get all coupons for the store (without filtering by active/expired)
    const { data: allCoupons, error: allError } = await supabase
      .from('coupons')
      .select('*')
      .eq('store_id', storeId);
    
    console.log('All coupons for store:', allCoupons);
    console.log('Query error:', allError);

    // Then apply filters
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('is_popular', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching store coupons:', error);
      return [];
    }

    console.log('Filtered coupons:', data);
    return data || [];
  } catch (error) {
    console.error('Exception in getStoreCoupons:', error);
    return [];
  }
}

// Get similar stores
export async function getSimilarStores(storeId: string, limit: number = 6) {
  try {
    console.log('Fetching similar stores for store ID:', storeId);
    
    const { data, error } = await supabase
      .from('similar_stores')
      .select(`
        similar_store:stores!similar_store_id (
          id,
          name,
          alias,
          logo_url,
          active_offers_count
        )
      `)
      .eq('store_id', storeId)
      .limit(limit);

    if (error) {
      console.error('Error fetching similar stores:', error);
      return [];
    }

    console.log('Similar stores data:', data);
    
    return data?.map(item => ({
      id: item.similar_store.id,
      name: item.similar_store.name,
      alias: item.similar_store.alias,
      logo: item.similar_store.logo_url || "/api/placeholder/120/60",
      offers: item.similar_store.active_offers_count
    })) || [];
  } catch (error) {
    console.error('Exception in getSimilarStores:', error);
    return [];
  }
}

// Get store-specific FAQs
export async function getStoreFAQs(storeId: string) {
  try {
    console.log('Fetching FAQs for store ID:', storeId);
    
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('store_id', storeId)
      .order('display_order');

    if (error) {
      console.error('Error fetching store FAQs:', error);
      return [];
    }

    console.log('Store FAQs data:', data);
    return data || [];
  } catch (error) {
    console.error('Exception in getStoreFAQs:', error);
    return [];
  }
}