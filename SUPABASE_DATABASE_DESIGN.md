# CouponMia - Supabase Database Design

## 📋 Project Overview

CouponMia is a comprehensive coupon aggregation website built with Next.js 15, TypeScript, and Tailwind CSS. This document outlines the complete database schema design for Supabase integration.

### Technology Stack
- **Framework**: Next.js 15.4.2 with App Router
- **Frontend**: React 19.1.0 + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## 🏗️ Current Project Structure

### Pages Analysis
1. **Homepage** (`/`) - Holiday calendar, featured coupons, stores, FAQ, reviews
2. **Store Detail** (`/store/[storeAlias]`) - Individual store information and coupons
3. **Stores Directory** (`/stores/startwith/[letter]`) - A-Z store navigation
5. **Info Pages** (`/info/*`) - Static pages (About, Contact, Privacy Policy, Terms) - **No database needed**

### Current Mock Data Usage
- Store information (BuyBeautyKorea mock data)
- Coupon/deal data (8 different coupon types)
- Holiday calendar data
- User reviews and ratings
- FAQ sections
- Blog posts/recent articles
- Featured daily coupons

## 🗃️ Database Schema Design

> **Note**: Info pages (About Us, Contact, Privacy Policy, Terms of Service) are implemented as static Next.js pages and do not require database storage.

### Core Tables

#### 1. **stores** - Store Information (Simplified)
```sql
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  alias VARCHAR UNIQUE NOT NULL, -- URL-friendly store identifier
  logo_url TEXT,
  description TEXT NOT NULL,
  website VARCHAR NOT NULL, -- Official store website
  url TEXT NOT NULL, -- Merchant affiliate link for tracking
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  active_offers_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Essential indexes only
CREATE INDEX idx_stores_alias ON stores(alias);
CREATE INDEX idx_stores_featured ON stores(is_featured);
```

#### 2. **categories** - Store Categories (Simplified)
```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  slug VARCHAR NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
```

#### 3. **store_categories** - Many-to-Many Relationship
```sql
CREATE TABLE store_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, category_id)
);

CREATE INDEX idx_store_categories_store ON store_categories(store_id);
CREATE INDEX idx_store_categories_category ON store_categories(category_id);
```

#### 4. **coupons** - Coupon and Deals Management (Simplified)
```sql
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL, -- e.g., "15% OFF"
  subtitle TEXT NOT NULL, -- Detailed description
  code VARCHAR, -- NULL for deals without codes
  type VARCHAR CHECK (type IN ('code', 'deal')) NOT NULL,
  discount_value VARCHAR NOT NULL, -- Display value like "15%", "$50"
  description TEXT NOT NULL,
  url TEXT NOT NULL, -- Affiliate tracking URL for conversions
  expires_at TIMESTAMP WITH TIME ZONE,
  is_popular BOOLEAN DEFAULT FALSE,
  min_spend DECIMAL(10,2),
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Essential indexes only
CREATE INDEX idx_coupons_store_id ON coupons(store_id);
CREATE INDEX idx_coupons_expires_at ON coupons(expires_at);
CREATE INDEX idx_coupons_active ON coupons(is_active);
```


### Relationship Tables

#### 6. **similar_stores** - Store Recommendations (Simplified)
```sql
CREATE TABLE similar_stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  similar_store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, similar_store_id),
  CHECK (store_id != similar_store_id)
);

CREATE INDEX idx_similar_stores_store ON similar_stores(store_id);
```

#### 7. **featured_coupons** - Today's Featured Deals (Simplified)
```sql
CREATE TABLE featured_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  featured_date DATE NOT NULL DEFAULT CURRENT_DATE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, featured_date)
);

CREATE INDEX idx_featured_coupons_date ON featured_coupons(featured_date);
```

### Content Management Tables

#### 8. **faqs** - Frequently Asked Questions (Simplified)
```sql
CREATE TABLE faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE, -- NULL for general FAQs
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_faqs_store ON faqs(store_id);
```

#### 9. **reviews** - User Reviews and Testimonials (Simplified)
```sql
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_featured ON reviews(is_featured);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

#### 10. **blog_posts** - Content Marketing (Simplified)
```sql
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

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
```

### Configuration Tables

#### 11. **site_settings** - Application Configuration (Simplified)
```sql
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_site_settings_key ON site_settings(key);

-- Essential settings only
INSERT INTO site_settings (key, value) VALUES
('contact_email', 'support@couponmia.com'),
('featured_coupons_count', '6');
```

> **Static Content Note**: Company information, privacy policies, terms of service, and contact details are maintained as static Next.js pages for better SEO, performance, and version control.

## 🔐 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access policies (simplified)
CREATE POLICY "Public read access" ON stores FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON coupons FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
CREATE POLICY "Public read access" ON faqs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON reviews FOR SELECT USING (is_featured = true);
CREATE POLICY "Public read access" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public read access" ON site_settings FOR SELECT USING (true);
```

## 🔍 Database Functions and Triggers

### Automatic Timestamp Updates
```sql
-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Automatic Coupon Cleanup
```sql
-- Function to deactivate expired coupons
CREATE OR REPLACE FUNCTION deactivate_expired_coupons()
RETURNS void AS $$
BEGIN
    UPDATE coupons 
    SET is_active = false 
    WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Schedule this function to run daily (can be done via cron job or Supabase Edge Functions)
```

### Update Store Statistics
```sql
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
```

## 📊 Sample Data Migration Script

```sql
-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Fashion & Clothing', 'fashion-clothing', 'Apparel, shoes, and accessories'),
('Beauty & Health', 'beauty-health', 'Cosmetics, skincare, and wellness products'),
('Electronics', 'electronics', 'Gadgets, computers, and tech accessories'),
('Home & Garden', 'home-garden', 'Furniture, decor, and gardening supplies'),
('Food & Dining', 'food-dining', 'Restaurants, grocery, and food delivery');

-- Insert sample store (BuyBeautyKorea from current mock data)
INSERT INTO stores (name, alias, description, website, url, rating, review_count) VALUES
('BuyBeautyKorea', 'buybeautykorea', 
'Shop Korean online beauty and fashion store online at CouponMia. Enjoy a 30% off store sale discount! Search 13 active coupons. Trusted DNA Beauty Platform by professionals, We will make our best choice for you. CouponMia exclusive coupons earn up to 30% cash back.',
'buybeautykorea.com', 'https://affiliate.couponmia.com/go/buybeautykorea', 4.5, 1247);

```

## 🚀 API Integration Points

### Recommended API Endpoints
- `GET /api/stores` - Store directory with filtering
- `GET /api/stores/[alias]` - Individual store details
- `GET /api/coupons/featured` - Today's featured coupons
- `GET /api/coupons/store/[storeId]` - Store-specific coupons
- `POST /api/analytics/track` - Track coupon usage
- `GET /api/search` - Search stores and coupons

### TypeScript Integration
All database types can be generated using Supabase CLI:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

## 📈 Performance Considerations

### Caching Strategy
- Use Supabase's built-in caching for frequently accessed data
- Implement Redis/Upstash for session data and rate limiting
- Cache store listings and featured coupons with appropriate TTL

### Optimization Tips
1. **Indexes**: All foreign keys and frequently queried columns are indexed
2. **Pagination**: Implement cursor-based pagination for large datasets
3. **Computed Columns**: Use database functions for complex calculations
4. **Connection Pooling**: Configure Supabase connection pooling for production

## 🔧 Migration Path

1. **Phase 1**: Core tables (stores, categories, coupons)
2. **Phase 2**: Content tables (FAQs, reviews, blog posts)
3. **Phase 3**: Analytics and advanced features
4. **Phase 4**: User authentication and personalization

## 📝 Static Content Strategy

### Info Pages (No Database Required)
The following pages are implemented as static Next.js pages for optimal SEO and performance:

- **About Us** (`/info/about-us`) - Company information and mission
- **Contact Us** (`/info/contact-us`) - Contact form and support information  
- **Privacy Policy** (`/info/privacy-policy`) - Data privacy and collection policies
- **Terms of Service** (`/info/terms`) - Website usage terms and conditions

### Benefits of Static Implementation:
1. **SEO Optimization**: Better search engine crawling and indexing
2. **Performance**: Faster loading times with static generation
3. **Version Control**: Content changes tracked in Git
4. **Cost Effective**: No database queries for static content
5. **Legal Compliance**: Static policies ensure consistency

### Database Tables Summary
This design includes **10 simplified core tables** focusing on essential functionality:

| Category | Tables | Purpose |
|----------|--------|---------|
| **Core Business** | stores, coupons, categories | Primary business logic with affiliate URLs |
| **Relationships** | store_categories, similar_stores, featured_coupons | Data connections |
| **Content** | faqs, reviews, blog_posts | Dynamic content management |
| **Configuration** | site_settings | Essential system configuration |

### Key Fields Added:
- **stores.url** - Merchant affiliate link for revenue tracking
- **coupons.url** - Affiliate tracking URL for coupon conversions

### Removed Complex Fields:
- Detailed analytics tables (can use external tools)
- Extensive metadata fields
- User notification preferences
- Complex verification systems

This database design provides a solid foundation for the CouponMia project, supporting all current mock data requirements while maintaining optimal performance through strategic separation of static and dynamic content.