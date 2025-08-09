# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint code quality check
```

### Data Synchronization
```bash
npm run sync              # Complete data sync (stores → coupons → popularity → analysis)
npm run sync:stores       # Sync store data from BrandReward API
npm run sync:coupons      # Sync coupon/deal data
npm run sync:popularity   # Update store popularity scoring and is_featured flags
npm run sync:analyze      # Analyze store discounts and update statistics
npm run sync:cleanup      # Remove expired coupons and cleanup data
```

### AI Analysis Scripts
```bash
node scripts/analyze-similar-stores.js all [limit]     # AI-powered similar store analysis
node scripts/analyze-similar-stores.js single <alias>  # Analyze single store
node scripts/analyze-similar-stores.js update          # Incremental update (skip existing)
node scripts/generate-store-faqs.js all [limit]        # Generate AI-powered store FAQs
node scripts/generate-store-faqs.js single <alias>     # Generate FAQs for single store
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.4.2 with App Router and TypeScript
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Styling**: Tailwind CSS v4 with custom purple dark theme
- **AI**: OpenAI GPT-4o-mini for content generation and store analysis
- **External API**: BrandReward affiliate network integration

### Data Flow Architecture
1. **External Data**: BrandReward API → `scripts/sync-data.js` → Supabase database
2. **AI Enhancement**: OpenAI GPT-4 → `scripts/analyze-similar-stores.js` → `similar_stores` table
3. **Frontend**: Server-side rendering → Client-side hydration for interactivity

### Key Database Tables
- `stores` - Store information with affiliate URLs and popularity scoring
- `coupons` - Coupon/deal data with expiration tracking
- `similar_stores` - AI-generated store recommendations
- `categories` & `store_categories` - Many-to-many categorization
- `featured_coupons` - Daily featured deals management

### Store Popularity Scoring
The `calculatePopularity()` function in `scripts/sync-data.js` scores stores (0-100 points):
- **Logo Quality** (0-10 points): Logo presence and URL quality
- **Coupon Count** (0-90 points): Primary scoring factor based on active offers
- **Threshold**: Stores with ≥50 points get `is_featured: true`

### Component Architecture

#### Page Structure
- `/` - Homepage with holiday calendar, featured coupons, popular stores
- `/store/[storeAlias]` - Individual store pages with coupons and AI-generated similar stores
- `/stores/startwith/[letter]` - Alphabetical store directory

#### Key Components
- **Client Components**: `HomeClient.tsx`, `StoreDetailClient.tsx` for state management
- **Section Components**: 15+ reusable sections like `AdvancedHolidayCalendar`, `TodaysCouponCodes`
- **Modals**: `CouponModal`, `EmailSubscriptionModal` for user interactions

### API Integration Patterns

#### Supabase Client (`src/lib/supabase.ts`)
- Environment-based configuration
- Consistent error handling with fallback to mock data
- Real-time capabilities available but not currently implemented

#### External API (`scripts/sync-data.js`)
- BrandReward API integration with rate limiting (10s delays)
- Batch processing with progress tracking
- Comprehensive error handling and retry logic
- Test mode (`TEST_MODE=true`) for development

### AI-Powered Features

#### Similar Store Analysis
- Uses OpenAI to analyze store relationships based on categories, domains, geographic markets
- Generates up to 6 similar stores per store with similarity scores
- Updates `similar_stores` table automatically

#### FAQ Generation (`scripts/generate-store-faqs.js`)
- Categorizes stores (ecommerce/service/tech) for targeted templates
- Generates contextual answers using store metadata
- Creates 12 FAQs per store (6 coupon-related + 6 category-specific)
- Updates `faqs` table with store-specific question/answer pairs

#### Store Popularity Algorithm
- Multi-factor scoring: logo quality (10%) + coupon count (90%)
- Automatic `is_featured` flag updates for stores ≥50 points
- Runs as part of complete sync process

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENROUTER_API_KEY=
API_USER=support@offerslove.com
API_KEY=<brandreward_api_key>
TEST_MODE=true  # For development/testing
```

### Development Workflow

#### Data Sync Process
1. Run `npm run sync:stores` first to populate stores table
2. Run `npm run sync:coupons` to add coupon data
3. Run `npm run sync:popularity` to calculate store rankings
4. Optionally run AI analysis:
   - `node scripts/analyze-similar-stores.js all` for similar store recommendations
   - `node scripts/generate-store-faqs.js all` for store-specific FAQs

#### Testing Modes
- Set `TEST_MODE=true` to only sync first page of API results
- Use `limit` parameters in AI scripts for testing smaller datasets
- All API functions include fallback mock data for development

#### Error Handling Strategy
- All database queries have comprehensive error logging
- Frontend components gracefully degrade with fallback data
- API failures don't break the sync process - continue with next items

### Code Patterns

#### Component Data Fetching
- Server components fetch initial data for SEO
- Client components handle interactivity and state changes
- Consistent error boundaries and loading states throughout

#### Database Queries
- Use selective field querying: `select('id, name, logo_url')`
- Include proper foreign key relationships in complex queries
- Always handle potential null/undefined results

#### Styling Conventions
- Tailwind CSS with custom color palette (purple theme)
- Responsive design patterns with mobile-first approach
- Dark mode support throughout the application

## UI Design Reference

### Color Palette (Color Palette.png)
The application uses a specific color scheme that should be maintained:
- **Black**: Primary background and text (#000000)
- **Purple**: Primary brand color and accents (#8B5CF6 or similar)
- **Light Purple/Pink**: Secondary accents and highlights (#C084FC or similar)
- **Yellow/Cream**: Call-to-action elements and highlights (#FEF3C7 or similar)

These colors are already integrated into the Tailwind configuration and should be used consistently across all components. Reference the Color Palette.png file for exact color matching when adding new UI elements.

## Database Schema Reference

### Complete Database Structure (database.sql)
The application uses the following normalized database schema:

#### Core Tables
```sql
-- Stores: Main merchant/retailer information
stores (id, name, alias, logo_url, description, website, url, rating, 
        review_count, active_offers_count, is_featured, external_id,
        category, commission_rate_data, countries_data, domains_data,
        commission_model_data, discount_analysis)

-- Coupons: Individual deals and promotional codes
coupons (id, store_id, title, subtitle, code, type, discount_value,
         description, url, expires_at, is_popular, is_active, external_id,
         commission_rate, countries, domains)

-- Categories: Store categorization system
categories (id, name, slug)
store_categories (id, store_id, category_id) -- Many-to-many

-- Similar Stores: AI-generated recommendations
similar_stores (id, store_id, similar_store_id)
```

#### Supporting Tables
```sql
-- Featured content management
featured_coupons (id, coupon_id, featured_date, display_order)

-- User-generated content
reviews (id, author_name, title, content, rating, is_featured)
faqs (id, store_id, question, answer, display_order)

-- Content management
blog_posts (id, title, slug, excerpt, featured_image_url, author_name,
            is_published, published_at)

-- System tables
sync_logs (id, sync_type, start_time, end_time, status, success_count,
           error_count, details)
site_settings (id, key, value)
```

#### Key Relationships
- `coupons.store_id` → `stores.id` (One store has many coupons)
- `store_categories.store_id` → `stores.id` (Many-to-many categories)
- `similar_stores.store_id` → `stores.id` (AI-generated recommendations)
- `featured_coupons.coupon_id` → `coupons.id` (Daily featured selection)
- `faqs.store_id` → `stores.id` (Store-specific FAQs)

#### Important Constraints
- `stores.alias` - Unique, used for URL routing
- `stores.external_id` - Unique, maps to BrandReward API
- `coupons.type` - Must be 'code' or 'deal'
- `reviews.rating` - Must be between 1-5
- All tables have `created_at` timestamps for audit trails

Refer to the complete `database.sql` file for the full schema including indexes, constraints, and RLS policies.