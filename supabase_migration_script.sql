-- =============================================================================
-- CouponMia - Supabase Database Migration Script
-- Generated from xfrontend_2025-07-22.sql analysis
-- =============================================================================

-- =============================================================================
-- 1. CREATE TABLES (Based on simplified schema)
-- =============================================================================

-- Categories Table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  slug VARCHAR NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores Table  
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  alias VARCHAR UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT NOT NULL,
  website VARCHAR NOT NULL,
  url TEXT NOT NULL, -- Affiliate tracking URL
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  active_offers_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store Categories Junction Table
CREATE TABLE store_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, category_id)
);

-- Coupons Table
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  subtitle TEXT NOT NULL,
  code VARCHAR, -- NULL for deals without codes
  type VARCHAR CHECK (type IN ('code', 'deal')) NOT NULL,
  discount_value VARCHAR NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL, -- Affiliate tracking URL
  expires_at TIMESTAMP WITH TIME ZONE,
  is_popular BOOLEAN DEFAULT FALSE,
  min_spend DECIMAL(10,2),
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Holidays Table
CREATE TABLE holidays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  date DATE NOT NULL,
  type VARCHAR CHECK (type IN ('Federal Holiday', 'Observance', 'Shopping Event')) NOT NULL,
  deals_description TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table (simplified)
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs Table
CREATE TABLE faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Similar Stores Table
CREATE TABLE similar_stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  similar_store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, similar_store_id),
  CHECK (store_id != similar_store_id)
);

-- Featured Coupons Table
CREATE TABLE featured_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  featured_date DATE NOT NULL DEFAULT CURRENT_DATE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, featured_date)
);

-- Blog Posts Table
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  author_name VARCHAR NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings Table
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX idx_stores_alias ON stores(alias);
CREATE INDEX idx_stores_featured ON stores(is_featured);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_store_categories_store ON store_categories(store_id);
CREATE INDEX idx_store_categories_category ON store_categories(category_id);
CREATE INDEX idx_coupons_store_id ON coupons(store_id);
CREATE INDEX idx_coupons_expires_at ON coupons(expires_at);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_holidays_date ON holidays(date);
CREATE INDEX idx_similar_stores_store ON similar_stores(store_id);
CREATE INDEX idx_featured_coupons_date ON featured_coupons(featured_date);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX idx_reviews_featured ON reviews(is_featured);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_faqs_store ON faqs(store_id);
CREATE INDEX idx_site_settings_key ON site_settings(key);

-- =============================================================================
-- 3. INSERT SAMPLE DATA (Migrated from xfrontend database)
-- =============================================================================

-- Insert Categories (from category table)
INSERT INTO categories (name, slug) VALUES
('Toys', 'toys'),
('Clothing & Accessories', 'clothing-accessories'),
('Home', 'home'),
('Women''s', 'womens'),
('Electronics', 'electronics'),
('Beauty', 'beauty'),
('Food & Dining', 'food-dining'),
('Travel', 'travel'),
('Outdoors', 'outdoors'),
('Health & Wellness', 'health-wellness');

-- Insert Stores (from merchant table - top performers)
INSERT INTO stores (name, alias, logo_url, description, website, url, rating, review_count, is_featured) VALUES
('JCPenney', 'jcpenney', 'https://couponmia.com/logos/jcpenney.jpg', 
'JCPenney is a shopping destination for home furnishings, apparel and accessories. Discover great styles at compelling prices at jcp.com.', 
'jcpenney.com', 'https://affiliate.couponmia.com/go/jcpenney', 4.2, 1250, true),

('Bebe', 'bebe', 'https://couponmia.com/logos/bebe.jpg',
'Shop bebe''s selection of fashion clothing and trendy clothes for women for every occasion. Order the hottest styles and latest women''s fashion from bebe.',
'bebe.com', 'https://affiliate.couponmia.com/go/bebe', 4.0, 890, false),

('Verizon Wireless', 'verizon-wireless', 'https://couponmia.com/logos/verizon-wireless.jpg',
'Discover the latest Cell Phones, Smartphones, Prepaid Devices, Tablets, Cell Phone Plans and Accessories from Verizon Wireless. The nation''s largest 4G LTE Network.',
'verizonwireless.com', 'https://affiliate.couponmia.com/go/verizon-wireless', 4.1, 2100, true),

('DSW', 'dsw', 'https://couponmia.com/logos/dsw.jpg',
'Designer Shoe Warehouse - Shop the latest styles in designer shoes, boots, sandals, athletic shoes and more.',
'dsw.com', 'https://affiliate.couponmia.com/go/dsw', 4.3, 1680, true),

('Nike', 'nike', 'https://couponmia.com/logos/nike.jpg',
'Experience sports, training, shopping and everything else that''s new at Nike. Just Do It.',
'nike.com', 'https://affiliate.couponmia.com/go/nike', 4.5, 3200, true),

('Clinique', 'clinique', 'https://couponmia.com/logos/clinique.jpg',
'Shop the official Clinique website for skin care, makeup, fragrances and gifts. Read reviews & get Free Shipping today. Allergy Tested. 100% Fragrance Free.',
'clinique.com', 'https://affiliate.couponmia.com/go/clinique', 4.4, 1890, false),

('Red Lobster', 'red-lobster', 'https://couponmia.com/logos/red-lobster.jpg',
'Discover Red Lobster seafood restaurants, find locations, browse our menus and more.',
'redlobster.com', 'https://affiliate.couponmia.com/go/red-lobster', 3.8, 950, false),

('TOMS', 'toms', 'https://couponmia.com/logos/toms.jpg',
'Together we stand. TOMS is giving back to communities with every purchase. One for One.',
'toms.com', 'https://affiliate.couponmia.com/go/toms', 4.2, 1120, false),

('Fandango', 'fandango', 'https://couponmia.com/logos/fandango.jpg',
'Buy movie tickets in advance, find movie times, watch trailers, read movie reviews, and more at Fandango.',
'fandango.com', 'https://affiliate.couponmia.com/go/fandango', 4.0, 2800, false),

('The North Face', 'the-north-face', 'https://couponmia.com/logos/the-north-face.jpg',
'For more than 50 years, The North Face has made activewear and outdoor sports gear that exceeds your expectations.',
'thenorthface.com', 'https://affiliate.couponmia.com/go/the-north-face', 4.3, 1500, true),

('ASOS', 'asos', 'https://couponmia.com/logos/asos.jpg',
'Free Delivery on orders over $40! Discover the latest in men''s fashion and women''s clothing online & shop from over 40,000 styles with ASOS.',
'us.asos.com', 'https://affiliate.couponmia.com/go/asos', 4.1, 2200, true),

('IHOP', 'ihop', 'https://couponmia.com/logos/ihop.jpg',
'Come hungry. Leave happy. Enjoy our signature pancakes, omelets, burgers and more at IHOP.',
'ihop.com', 'https://affiliate.couponmia.com/go/ihop', 3.9, 780, false);

-- Insert Store-Category Relationships
WITH store_cats AS (
  SELECT s.id as store_id, c.id as category_id
  FROM stores s, categories c
  WHERE (s.alias = 'jcpenney' AND c.slug IN ('home', 'clothing-accessories')) OR
        (s.alias = 'bebe' AND c.slug = 'clothing-accessories') OR
        (s.alias = 'verizon-wireless' AND c.slug = 'electronics') OR
        (s.alias = 'dsw' AND c.slug = 'clothing-accessories') OR
        (s.alias = 'nike' AND c.slug IN ('clothing-accessories', 'outdoors')) OR
        (s.alias = 'clinique' AND c.slug = 'beauty') OR
        (s.alias = 'red-lobster' AND c.slug = 'food-dining') OR
        (s.alias = 'toms' AND c.slug = 'clothing-accessories') OR
        (s.alias = 'fandango' AND c.slug = 'travel') OR
        (s.alias = 'the-north-face' AND c.slug = 'outdoors') OR
        (s.alias = 'asos' AND c.slug = 'clothing-accessories') OR
        (s.alias = 'ihop' AND c.slug = 'food-dining')
)
INSERT INTO store_categories (store_id, category_id)
SELECT store_id, category_id FROM store_cats;

-- Insert Sample Coupons (from coupon table data)
INSERT INTO coupons (store_id, title, subtitle, code, type, discount_value, description, url, expires_at, is_popular, view_count) VALUES
-- Nike Coupons
((SELECT id FROM stores WHERE alias = 'nike'), '50% OFF', 'Save 50% on Select Athletic Wear', 'NIKE50', 'code', '50%', 
'Get 50% off on select Nike athletic wear including shoes, apparel, and accessories.', 
'https://affiliate.couponmia.com/go/nike?code=NIKE50', '2024-12-31 23:59:59', true, 1250),

((SELECT id FROM stores WHERE alias = 'nike'), 'Free Shipping', 'Free Shipping on Orders Over $50', NULL, 'deal', 'Free Shipping', 
'Get free shipping on all orders over $50. No code needed, discount applied at checkout.',
'https://affiliate.couponmia.com/go/nike?promo=freeship', '2024-12-31 23:59:59', false, 890),

-- DSW Coupons  
((SELECT id FROM stores WHERE alias = 'dsw'), '60% OFF', 'Up to 60% Off Designer Shoes', 'SHOE60', 'code', '60%',
'Save up to 60% on select designer shoes from top brands.',
'https://affiliate.couponmia.com/go/dsw?code=SHOE60', '2024-12-15 23:59:59', true, 2100),

-- JCPenney Coupons
((SELECT id FROM stores WHERE alias = 'jcpenney'), '$20 OFF', '$20 Off Orders Over $100', 'SAVE20', 'code', '$20',
'Get $20 off your order when you spend $100 or more.',
'https://affiliate.couponmia.com/go/jcpenney?code=SAVE20', '2024-11-30 23:59:59', false, 750),

-- ASOS Coupons
((SELECT id FROM stores WHERE alias = 'asos'), '70% OFF', 'Up to 70% Off Sale Items', 'SALE70', 'code', '70%',
'Save up to 70% on selected sale items. Limited time offer.',
'https://affiliate.couponmia.com/go/asos?code=SALE70', '2024-12-20 23:59:59', true, 3200),

-- Clinique Coupons
((SELECT id FROM stores WHERE alias = 'clinique'), 'Free Gift', 'Free Gift with $75 Purchase', NULL, 'deal', 'Free Gift',
'Receive a free gift with any purchase of $75 or more. Gift automatically added to cart.',
'https://affiliate.couponmia.com/go/clinique?promo=freegift', '2024-12-31 23:59:59', true, 1100),

-- Red Lobster Coupons
((SELECT id FROM stores WHERE alias = 'red-lobster'), '20% OFF', '20% Off Entire Check', 'SEAFOOD20', 'code', '20%',
'Save 20% on your entire check. Valid for dine-in only.',
'https://affiliate.couponmia.com/go/red-lobster?code=SEAFOOD20', '2024-11-25 23:59:59', false, 650),

-- The North Face Coupons
((SELECT id FROM stores WHERE alias = 'the-north-face'), '60% OFF', 'Up to 60% Off Outerwear', 'WINTER60', 'code', '60%',
'Save up to 60% on select winter outerwear and gear.',
'https://affiliate.couponmia.com/go/the-north-face?code=WINTER60', '2024-12-31 23:59:59', true, 1800);

-- Insert Holidays (from holiday table)  
INSERT INTO holidays (name, date, type, deals_description) VALUES
('New Year''s Day', '2024-01-01', 'Federal Holiday', ARRAY[
  'Up to 80% off Christmas decorations and holiday items',
  'Winter clothing clearance sales up to 70% off',
  'Home and bedding deals with extra savings',
  'Gym and fitness equipment New Year specials'
]),

('Valentine''s Day', '2024-02-14', 'Observance', ARRAY[
  'Jewelry and gift deals up to 50% off',
  'Romantic getaway travel packages',
  'Beauty and cosmetics special offers',
  'Restaurant dining deals and promotions'
]),

('President''s Day', '2024-02-19', 'Federal Holiday', ARRAY[
  'Mattress and furniture mega sales',
  'Appliance deals with rebates',
  'Car dealership promotions',
  'Retail store weekend sales events'
]),

('Memorial Day', '2024-05-27', 'Federal Holiday', ARRAY[
  'Summer clothing and swimwear sales',
  'Outdoor and camping gear discounts',
  'Home improvement store promotions',
  'Travel and vacation package deals'
]),

('Independence Day', '2024-07-04', 'Federal Holiday', ARRAY[
  'Patriotic themed merchandise sales',
  'BBQ and grilling equipment deals',
  'Fireworks and party supply discounts',
  'Summer recreation gear promotions'
]),

('Labor Day', '2024-09-02', 'Federal Holiday', ARRAY[
  'Back-to-school supply clearances',
  'End of summer clothing sales',
  'Tools and hardware store promotions',
  'Fall home preparation deals'
]),

('Black Friday', '2024-11-29', 'Shopping Event', ARRAY[
  'Doorbuster deals up to 90% off',
  'Electronics and tech mega sales',
  'Early holiday shopping discounts',
  'Buy one get one free offers'
]),

('Cyber Monday', '2024-12-02', 'Shopping Event', ARRAY[
  'Online exclusive digital deals',
  'Tech gadgets and software discounts',
  'Free shipping promotions',
  'Limited time flash sales'
]),

('Christmas', '2024-12-25', 'Federal Holiday', ARRAY[
  'Last minute gift deals and express shipping',
  'Holiday themed merchandise clearance',
  'Gift card bonus promotions',
  'Post-holiday return and exchange offers'
]);

-- Insert Featured Coupons for Today
INSERT INTO featured_coupons (coupon_id, featured_date, display_order) VALUES
((SELECT id FROM coupons WHERE title = '50% OFF' AND store_id = (SELECT id FROM stores WHERE alias = 'nike')), CURRENT_DATE, 1),
((SELECT id FROM coupons WHERE title = '70% OFF' AND store_id = (SELECT id FROM stores WHERE alias = 'asos')), CURRENT_DATE, 2),
((SELECT id FROM coupons WHERE title = '60% OFF' AND store_id = (SELECT id FROM stores WHERE alias = 'dsw')), CURRENT_DATE, 3),
((SELECT id FROM coupons WHERE title = 'Free Gift' AND store_id = (SELECT id FROM stores WHERE alias = 'clinique')), CURRENT_DATE, 4);

-- Insert Sample Reviews
INSERT INTO reviews (author_name, title, content, rating, is_featured) VALUES
('Sarah Johnson', 'Great savings on quality products!', 
'I''ve been using CouponMia for over a year now and have saved hundreds of dollars. The coupons actually work and the deals are legitimate. Highly recommended!', 
5, true),

('Mike Chen', 'Easy to use and reliable', 
'Found exactly what I was looking for. The website is easy to navigate and the coupon codes work perfectly. Saved 30% on my Nike purchase!', 
5, true),

('Emily Rodriguez', 'Love the variety of stores', 
'So many stores to choose from! I can always find deals for the brands I love. The expiration dates are clearly marked which is very helpful.', 
4, true),

('David Thompson', 'Excellent customer experience', 
'The deals are updated frequently and I love getting notifications about new offers from my favorite stores. This site has become my go-to for online shopping.', 
5, false);

-- Insert Sample Blog Posts
INSERT INTO blog_posts (title, slug, excerpt, author_name, is_published, published_at) VALUES
('10 Best Black Friday Deals to Watch For', '10-best-black-friday-deals-2024', 
'Get ready for the biggest shopping event of the year! Here are the top 10 Black Friday deals you won''t want to miss.',
'Editorial Team', true, '2024-11-01 10:00:00'),

('How to Maximize Your Savings with Coupon Stacking', 'maximize-savings-coupon-stacking',
'Learn the insider tricks to combine multiple offers and maximize your savings on every purchase.',
'Sarah Mitchell', true, '2024-10-15 14:30:00'),

('Holiday Shopping Guide 2024: Best Deals by Category', 'holiday-shopping-guide-2024',
'Your complete guide to finding the best holiday deals across all categories, from electronics to fashion.',
'Editorial Team', true, '2024-11-10 09:00:00');

-- Insert Site Settings
INSERT INTO site_settings (key, value) VALUES
('contact_email', 'support@couponmia.com'),
('featured_coupons_count', '6'),
('site_maintenance', 'false'),
('analytics_enabled', 'true');

-- Insert Sample FAQs
INSERT INTO faqs (store_id, question, answer, display_order) VALUES
(NULL, 'How do I use a coupon code?', 
'To use a coupon code, copy the code from our website, click "Visit Store" to go to the retailer''s website, add items to your cart, and paste the code at checkout before completing your purchase.', 1),

(NULL, 'Do coupon codes expire?', 
'Yes, most coupon codes have expiration dates. We clearly display the expiration date for each coupon and regularly update our database to remove expired codes.', 2),

(NULL, 'Why didn''t my coupon code work?', 
'Coupon codes may not work for several reasons: they may have expired, have minimum purchase requirements, exclude certain items, or be limited to first-time customers. Check the terms and conditions for each offer.', 3),

(NULL, 'Are there any fees to use CouponMia?', 
'No, CouponMia is completely free to use! We earn commission from retailers when you make purchases through our links, but this never affects the price you pay.', 4),

(NULL, 'How often do you update coupon codes?', 
'We update our coupon codes daily and verify their validity regularly. Our team works around the clock to ensure you have access to the latest and most reliable deals.', 5);

-- =============================================================================
-- 4. UPDATE STORE ACTIVE OFFERS COUNT
-- =============================================================================

UPDATE stores 
SET active_offers_count = (
  SELECT COUNT(*) 
  FROM coupons 
  WHERE coupons.store_id = stores.id 
  AND coupons.is_active = true 
  AND (coupons.expires_at IS NULL OR coupons.expires_at > NOW())
);

-- =============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access" ON stores FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON coupons FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
CREATE POLICY "Public read access" ON holidays FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON faqs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON reviews FOR SELECT USING (is_featured = true);
CREATE POLICY "Public read access" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public read access" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON store_categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON similar_stores FOR SELECT USING (true);
CREATE POLICY "Public read access" ON featured_coupons FOR SELECT USING (true);

-- =============================================================================
-- 6. FUNCTIONS AND TRIGGERS FOR AUTOMATION  
-- =============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update store offer counts
CREATE OR REPLACE FUNCTION update_store_offer_counts()
RETURNS void AS $$
BEGIN
    UPDATE stores 
    SET active_offers_count = (
        SELECT COUNT(*) 
        FROM coupons 
        WHERE coupons.store_id = stores.id 
        AND coupons.is_active = true 
        AND (coupons.expires_at IS NULL OR coupons.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Verify data counts
SELECT 
  'categories' as table_name, COUNT(*) as record_count FROM categories
UNION ALL
SELECT 
  'stores' as table_name, COUNT(*) as record_count FROM stores  
UNION ALL
SELECT 
  'coupons' as table_name, COUNT(*) as record_count FROM coupons
UNION ALL
SELECT 
  'holidays' as table_name, COUNT(*) as record_count FROM holidays
UNION ALL
SELECT 
  'reviews' as table_name, COUNT(*) as record_count FROM reviews
UNION ALL
SELECT 
  'blog_posts' as table_name, COUNT(*) as record_count FROM blog_posts
ORDER BY table_name;

-- Display summary of migrated data
SELECT 
  s.name as store_name,
  s.alias,
  s.rating,
  s.active_offers_count,
  s.is_featured
FROM stores s
ORDER BY s.rating DESC, s.active_offers_count DESC;

COMMENT ON SCHEMA public IS 'CouponMia Database - Migrated from xfrontend MySQL database on 2024-01-22';