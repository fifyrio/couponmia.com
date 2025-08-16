import { supabase } from './supabase';
import { getStoreLogoPlaceholder, getBlogImagePlaceholder } from './placeholders';

// Featured Coupons for Today's Coupon Codes
export async function getFeaturedCoupons(limit: number = 6) {
  try {
    // First try to get from featured_coupons table if it exists and has data
    const { data: featuredData, error: featuredError } = await supabase
      .from('featured_coupons')
      .select(`
        *,
        coupon:coupons(
          id,
          title,
          subtitle,
          code,
          type,
          description,
          url,
          expires_at,
          is_popular,
          store:stores(name, alias, logo_url)
        )
      `)
      .order('display_order')
      .limit(limit * 3); // Get more records to ensure we have enough unique stores

    if (!featuredError && featuredData && featuredData.length > 0) {
      const validCoupons = featuredData.filter(item => item.coupon && item.coupon.store);
      if (validCoupons.length > 0) {
        // Remove duplicates by store name, keeping only one coupon per store
        const uniqueStores = new Set();
        const uniqueCoupons = validCoupons.filter(item => {
          const storeName = item.coupon.store.name;
          if (uniqueStores.has(storeName)) {
            return false;
          }
          uniqueStores.add(storeName);
          return true;
        });

        return uniqueCoupons.slice(0, limit).map(item => ({
          title: item.coupon.title || '',
          code: item.coupon.code || '',
          url: item.coupon.url || '',
          type: item.coupon.type === 'other' ? 'deal' : (item.coupon.type || 'deal'),
          views: (() => {
            const couponId = item.coupon.id;
            if (!couponId || typeof couponId !== 'string') return '0';
            // Use hash of the UUID for consistent view count generation
            const hash = couponId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const viewCount = Math.floor(hash % 1500 + 500);
            return viewCount.toString();
          })(),
          store: (item.coupon.store as unknown as { name: string; logo_url?: string })?.name || '',
          storeLogo: (item.coupon.store as unknown as { name: string; logo_url?: string })?.logo_url || '',
          discount: item.coupon.subtitle || '',
          expires: item.coupon.expires_at 
            ? new Date(item.coupon.expires_at) > new Date() 
              ? `Expires ${new Date(item.coupon.expires_at).toLocaleDateString('en-US')}`
              : 'Expired'
            : 'No expiry'
        }));
      }
    }

    // Fallback: get random popular coupons from coupons table
    console.log('getFeaturedCoupons: Using fallback - getting popular coupons');
    const { data: couponsData, error: couponsError } = await supabase
      .from('coupons')
      .select(`
        id,
        title,
        subtitle,
        code,
        type,
        description,
        url,
        expires_at,
        is_popular,
        store:stores(name, alias, logo_url)
      `)
      .eq('is_active', true)
      .not('expires_at', 'lt', new Date().toISOString())
      .order('is_popular', { ascending: false })
      .limit(limit * 3); // Get more records to ensure we have enough unique stores

    if (!couponsError && couponsData && couponsData.length > 0) {
      // Remove duplicates by store name, keeping only one coupon per store
      const uniqueStores = new Set();
      const uniqueCoupons = couponsData.filter(coupon => {
        const storeName = (coupon.store as unknown as { name: string })?.name;
        if (!storeName || uniqueStores.has(storeName)) {
          return false;
        }
        uniqueStores.add(storeName);
        return true;
      });

      return uniqueCoupons.slice(0, limit).map(coupon => ({
        title: coupon.title || '',
        code: coupon.code || '',
        url: coupon.url || '',
        type: coupon.type === 'other' ? 'deal' : (coupon.type || 'deal'),
        views: (() => {
          const couponId = coupon.id;
          if (!couponId || typeof couponId !== 'string') return '0';
          // Use hash of the UUID for consistent view count generation
          const hash = couponId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const viewCount = Math.floor(hash % 1500 + 500);
          return viewCount.toString();
        })(),
        store: (coupon.store as unknown as { name: string; logo_url?: string })?.name || '',
        storeLogo: (coupon.store as unknown as { name: string; logo_url?: string })?.logo_url || '',
        discount: coupon.subtitle || '',
        expires: coupon.expires_at 
          ? new Date(coupon.expires_at) > new Date() 
            ? `Expires ${new Date(coupon.expires_at).toLocaleDateString('en-US')}`
            : 'Expired'
          : 'No expiry'
      }));
    }

    // Final fallback: return mock data
    console.log('getFeaturedCoupons: Using mock data fallback');
    return [
      {
        title: "75% Off Select Clearance Sitewide Deals + Free Delivery",
        code: "SAVE75",
        url: "https://amazon.com",
        type: "deal",
        views: "1200",
        store: "Amazon",
        storeLogo: "https://logo.clearbit.com/amazon.com",
        discount: "75% OFF",
        expires: "Ends Today"
      },
      {
        title: "Buy 2 Get 1 Free on All Electronics + Extra 20% Off", 
        code: "TECH20",
        url: "https://bestbuy.com",
        type: "code",
        views: "856",
        store: "Best Buy",
        storeLogo: "https://logo.clearbit.com/bestbuy.com",
        discount: "BOGO + 20%",
        expires: "2 Days Left"
      },
      {
        title: "Extra 30% Off Everything + Free Shipping",
        code: "EXTRA30",
        url: "https://target.com",
        type: "code",
        views: "2500", 
        store: "Target",
        storeLogo: "https://logo.clearbit.com/target.com",
        discount: "30% OFF",
        expires: "3 Days Left"
      },
      {
        title: "Flash Sale: 50% Off Select Items Today Only",
        code: "FLASH50",
        url: "https://walmart.com",
        type: "deal",
        views: "1800",
        store: "Walmart",
        storeLogo: "https://logo.clearbit.com/walmart.com", 
        discount: "50% OFF",
        expires: "Today Only"
      }
    ].slice(0, limit);

  } catch (error) {
    console.error('Exception in getFeaturedCoupons:', error);
    // Return mock data on any error
    return [
      {
        title: "75% Off Select Clearance Sitewide Deals + Free Delivery",
        code: "SAVE75",
        url: "https://amazon.com",
        type: "deal",
        views: "1200",
        store: "Amazon",
        storeLogo: "https://logo.clearbit.com/amazon.com",
        discount: "75% OFF",
        expires: "Ends Today"
      },
      {
        title: "Buy 2 Get 1 Free on All Electronics + Extra 20% Off", 
        code: "TECH20",
        url: "https://bestbuy.com",
        type: "code",
        views: "856",
        store: "Best Buy",
        storeLogo: "https://logo.clearbit.com/bestbuy.com",
        discount: "BOGO + 20%",
        expires: "2 Days Left"
      },
      {
        title: "Extra 30% Off Everything + Free Shipping",
        code: "EXTRA30",
        url: "https://target.com",
        type: "code",
        views: "2500", 
        store: "Target",
        storeLogo: "https://logo.clearbit.com/target.com",
        discount: "30% OFF",
        expires: "3 Days Left"
      },
      {
        title: "Flash Sale: 50% Off Select Items Today Only",
        code: "FLASH50",
        url: "https://walmart.com",
        type: "deal",
        views: "1800",
        store: "Walmart",
        storeLogo: "https://logo.clearbit.com/walmart.com", 
        discount: "50% OFF",
        expires: "Today Only"
      }
    ].slice(0, limit);
  }
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
    slug: post.slug,
    date: new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    image: post.featured_image_url || getBlogImagePlaceholder()
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
    logo: store.logo_url || getStoreLogoPlaceholder(),
    deals: `${store.active_offers_count} Deals`,
    category: "Store", // Could be enhanced with category join
    rating: store.rating,
    reviews: store.review_count
  })) || [];
}

// Top Stores by Active Offers Count
export async function getTopStoresByOffers(limit: number = 6) {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('name, alias, active_offers_count')
      .gt('active_offers_count', 0)
      .order('active_offers_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top stores by offers:', error);
      return [];
    }

    return data?.map(store => ({
      name: store.name,
      alias: store.alias,
      active_offers_count: store.active_offers_count
    })) || [];
  } catch (error) {
    console.error('Exception in getTopStoresByOffers:', error);
    return [];
  }
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
    .select('*')
    .eq('alias', alias)
    .maybeSingle();

  if (error) {
    console.error('Error fetching store:', error);
    return null;
  }

  if (!data) {
    console.log(`Store with alias '${alias}' not found`);
    return null;
  }

  return data;
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

    // Then apply filters with custom ordering: code type first, then deals
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('type', { ascending: true }) // 'code' comes before 'deal' alphabetically
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
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data?.map((item: any) => ({
      id: item.similar_store.id,
      name: item.similar_store.name,
      alias: item.similar_store.alias,
      logo_url: item.similar_store.logo_url,
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

// Search stores by name
export async function searchStoresByName(searchQuery: string, limit: number = 10) {
  try {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return [];
    }

    console.log('Searching stores with query:', searchQuery);
    
    const { data, error } = await supabase
      .from('stores')
      .select(`
        id,
        name,
        alias,
        logo_url,
        active_offers_count,
        rating,
        is_featured
      `)
      .ilike('name', `%${searchQuery.trim()}%`)
      .order('is_featured', { ascending: false })
      .order('active_offers_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching stores:', error);
      return [];
    }

    console.log(`Found ${data?.length || 0} stores matching '${searchQuery}'`);
    
    return data?.map(store => ({
      id: store.id,
      name: store.name,
      alias: store.alias,
      logo: store.logo_url,
      offers: store.active_offers_count || 0,
      rating: store.rating || 0,
      featured: store.is_featured || false
    })) || [];
  } catch (error) {
    console.error('Exception in searchStoresByName:', error);
    return [];
  }
}

// Get stores by first letter
export async function getStoresByLetter(letter: string) {
  try {
    console.log('Fetching stores starting with letter:', letter);
    
    let query = supabase
      .from('stores')
      .select(`
        id,
        name,
        alias,
        active_offers_count,
        rating,
        review_count,
        store_categories (
          category:categories (
            name
          )
        )
      `)
      .gt('active_offers_count', 5) // Only show stores with more than 5 active offers
      .order('name');

    // Handle different letter cases
    if (letter.toLowerCase() === 'other') {
      // For 'other', get stores that don't start with a-z
      query = query.not('name', 'ilike', 'a%')
                   .not('name', 'ilike', 'b%')
                   .not('name', 'ilike', 'c%')
                   .not('name', 'ilike', 'd%')
                   .not('name', 'ilike', 'e%')
                   .not('name', 'ilike', 'f%')
                   .not('name', 'ilike', 'g%')
                   .not('name', 'ilike', 'h%')
                   .not('name', 'ilike', 'i%')
                   .not('name', 'ilike', 'j%')
                   .not('name', 'ilike', 'k%')
                   .not('name', 'ilike', 'l%')
                   .not('name', 'ilike', 'm%')
                   .not('name', 'ilike', 'n%')
                   .not('name', 'ilike', 'o%')
                   .not('name', 'ilike', 'p%')
                   .not('name', 'ilike', 'q%')
                   .not('name', 'ilike', 'r%')
                   .not('name', 'ilike', 's%')
                   .not('name', 'ilike', 't%')
                   .not('name', 'ilike', 'u%')
                   .not('name', 'ilike', 'v%')
                   .not('name', 'ilike', 'w%')
                   .not('name', 'ilike', 'x%')
                   .not('name', 'ilike', 'y%')
                   .not('name', 'ilike', 'z%');
    } else {
      // For specific letters, use ilike with the letter
      query = query.ilike('name', `${letter}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching stores by letter:', error);
      return [];
    }

    console.log(`Found ${data?.length || 0} stores starting with '${letter}'`);
    
    // Return store data without logo URLs for better performance
    return data?.map(store => ({
      id: store.id,
      name: store.name,
      alias: store.alias,
      couponsCount: store.active_offers_count || 0,
      rating: store.rating || 0,
      reviewCount: store.review_count || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      category: (store.store_categories as any)?.[0]?.category?.name || 'Store'
    })) || [];
  } catch (error) {
    console.error('Exception in getStoresByLetter:', error);
    return [];
  }
}

// 获取节日促销数据
export async function getHolidayCoupons(holidayName?: string, limit: number = 20) {
  try {
    let query = supabase
      .from('holiday_coupons')
      .select(`
        holiday_name,
        holiday_type,
        holiday_date,
        match_source,
        match_text,
        confidence_score,
        coupon:coupons (
          id,
          title,
          subtitle,
          code,
          type,
          discount_value,
          expires_at,
          store:stores (
            name,
            alias,
            logo_url
          )
        )
      `)
      .not('coupon.store.name', 'is', null)
      .order('confidence_score', { ascending: false });

    if (holidayName) {
      query = query.eq('holiday_name', holidayName);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching holiday coupons:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getHolidayCoupons:', error);
    return [];
  }
}

// 获取节日促销统计数据
export async function getHolidaySalesStats() {
  try {
    const { data, error } = await supabase
      .from('holiday_coupons')
      .select(`
        holiday_name,
        holiday_type,
        holiday_date,
        coupon:coupons (
          id,
          title,
          discount_value,
          store:stores (
            name
          )
        )
      `)
      .not('coupon.store.name', 'is', null);

    if (error) {
      console.error('Error fetching holiday sales stats:', error);
      return [];
    }

    if (!data) return [];

    // 按节日名称分组统计
    const statsMap = new Map();
    
    data.forEach(item => {
      const key = item.holiday_name;
      if (!statsMap.has(key)) {
        statsMap.set(key, {
          holiday_name: item.holiday_name,
          holiday_type: item.holiday_type || 'Observance',
          holiday_date: item.holiday_date,
          coupon_count: 0,
          sample_coupons: []
        });
      }

      const stat = statsMap.get(key);
      stat.coupon_count++;

      // 添加示例优惠券（最多3个）
      if (stat.sample_coupons.length < 3 && item.coupon) {
        const coupon = Array.isArray(item.coupon) ? item.coupon[0] : item.coupon;
        if (coupon) {
          stat.sample_coupons.push({
            id: coupon.id,
            title: coupon.title,
            store_name: Array.isArray(coupon.store) ? coupon.store[0]?.name || 'Unknown Store' : (coupon.store as { name: string })?.name || 'Unknown Store',
            discount_value: coupon.discount_value
          });
        }
      }
    });

    return Array.from(statsMap.values())
      .filter(stat => stat.coupon_count > 0)
      .sort((a, b) => b.coupon_count - a.coupon_count);

  } catch (error) {
    console.error('Exception in getHolidaySalesStats:', error);
    return [];
  }
}

// 根据slug获取节日信息
export async function getHolidayBySlug(slug: string) {
  try {
    console.log('Fetching holiday data for slug:', slug);
    
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching holiday by slug:', error);
      return null;
    }

    console.log('Holiday data:', data);
    return data;
  } catch (error) {
    console.error('Exception in getHolidayBySlug:', error);
    return null;
  }
}

// 获取所有活跃节日列表
export async function getActiveHolidays() {
  try {
    const { data, error } = await supabase
      .from('holidays')
      .select('id, name, slug, type, banner_image_url, display_order')
      .eq('is_active', true)
      .order('display_order')
      .order('name');

    if (error) {
      console.error('Error fetching active holidays:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getActiveHolidays:', error);
    return [];
  }
}