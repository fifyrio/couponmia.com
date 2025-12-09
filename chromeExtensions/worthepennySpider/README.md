# Multi-Site Coupon Spider Chrome Extension (v2.1.0)

A Chrome extension to scrape coupon data from multiple coupon websites and export it as JSON. Now supports **4 major coupon sites**: Worthepenny, GrabOn, TenereTeam, and **ColorMango**.

## Supported Websites

1. **Worthepenny** - `https://*.worthepenny.com/coupon/*` and `/store/*`
2. **GrabOn** - `https://*.grabon.in/*-coupons/`, `/coupons/`, `/offers/`
3. **TenereTeam** - `https://*.tenereteam.com/coupons`
4. **ColorMango** (NEW in v2.1.0) - `https://*.colormango.com/product/*`, `/ai-deals/*`

## Features

- **Multi-Site Support**: Works across 4 major coupon websites with site-specific scrapers
- **Automatic Scraping**: Automatically scrapes coupon data when visiting supported pages
- **Manual Scraping**: Click the extension icon to manually scrape the current page
- **JSON Export**: View and copy scraped data as formatted JSON
- **Database Integration**: Insert scraped data directly to Supabase database (stores and coupons tables)
- **Data Persistence**: Stores scraped data locally for easy access
- **Badge Notifications**: Shows the number of scraped coupons on the extension icon
- **Modular Architecture**: Easy to add new sites with BaseScraper class

## Scraped Data Structure

The extension extracts the following information for each coupon:

```json
{
  "promotionTitle": "String - The promotion/deal title",
  "subtitle": "String - Extracted discount info (e.g., '60% off', '$10 off', 'other')",
  "couponCode": "String - The coupon code from data-code attribute",
  "merchantName": "String - The merchant/store name",
  "merchantDomain": "String - Clean domain without protocol (e.g., 'monarchmoney.com')",
  "merchantLogo": "String - The merchant's logo image URL",
  "merchantDescription": "String - Scraped merchant description from page",
  "url": "String - VigLink affiliate URL for tracking",
  "description": "String - Professional SEO-friendly coupon description"
}
```

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `worthepennySpider` folder
4. The extension will appear in your extensions list

## Usage

### Automatic Mode
1. Navigate to any supported coupon website:
   - **Worthepenny**: `https://*.worthepenny.com/coupon/*` or `/store/*`
   - **GrabOn**: `https://*.grabon.in/*-coupons/`, `/coupons/`, `/offers/`
   - **TenereTeam**: `https://*.tenereteam.com/coupons`
   - **ColorMango**: `https://*.colormango.com/product/*`, `/ai-deals/*`
2. The extension will automatically scrape the page when it loads
3. Click the extension icon to view the scraped data

### Manual Mode
1. Navigate to any supported coupon website (see Supported Websites section)
2. Click the Multi-Site Coupon Spider extension icon
3. Click "Scrape Current Page" button
4. View the JSON output and copy to clipboard if needed
5. **Database Integration**: Click "Insert to Database" to save data to Supabase

### ColorMango-Specific Features
When scraping ColorMango pages (e.g., https://www.colormango.com/product/aragon-ai_154396.html):
- Extracts discount labels (e.g., "50% Off", "15% Off")
- Captures coupon codes from bold text
- Tracks claim counts and success rates
- Identifies expired vs. active offers
- Extracts merchant information from page metadata
- Processes ColorMango's unique redirect URLs

### Database Integration Setup
1. After scraping data, click the "Insert to Database" button
2. On first use, enter your configuration:
   - Supabase URL (e.g., `https://your-project.supabase.co`)
   - Supabase Service Role Key
3. The extension will automatically:
   - Create or find stores in the `public.stores` table
   - Set `is_featured = true` for all stores from Worthepenny (new and existing)
   - Update store logos if available from scraped data
   - Insert coupons into the `public.coupons` table with **professional descriptions**:
     - **With coupon code**: "Is finding discounts from your go-to store a priority for you? You're in the perfect place. Get {Store} '{Code}' coupon code to save big now..."
     - **Without code**: "Looking for great deals from {Store}? You've found the right place. Take advantage of this {discount} to maximize your savings..."
   - Link coupons to their respective stores
   - Avoid duplicate store entries
   - **Field Mappings**:
     - `JSON.url` → `stores.url` (VigLink affiliate URL)
     - `JSON.merchantDomain` → `stores.website` (clean domain string)
     - `JSON.merchantDomain` → `stores.domains_data` (JSON array format like `["novica.com"]`)
     - `JSON.url` → `coupons.url` (VigLink affiliate URL for coupon tracking)

## Technical Details

### Selectors Used
- **Coupon Codes**: `#coupon_list div[data-code]` - Extracts the `data-code` attribute
- **Merchant Info**: `#brand_router div a` - Extracts merchant name and domain from href attribute
- **Merchant Logo**: Multiple selectors including `#brand_router img`, `.merchant-logo img`, `.brand-logo img`, etc.
- **Merchant Description**: Primary XPath `//*[@id="left_unique"]/div[1]/p[1]` - Extracts merchant description text content
  - Fallback selectors: `#left_unique > div:first-child > p:first-child`, `#left_unique p:first-of-type`, `.store-description`, etc.
- **Promotion Titles**: Primary selector `._hidden_4.worthepennycom[data-bf-ctt]` - Extracts from `data-bf-ctt` attribute
  - Fallback selectors: `._hidden_4[data-bf-ctt]`, `.worthepennycom[data-bf-ctt]`, `[data-bf-ctt]`
  - Additional fallbacks: `.coupon-title`, `.offer-title`, `h3`, `h4`, etc.

### URL Processing
- **Target URL Extraction**: Automatically extracts the target URL from Worthepenny redirect URLs
  - Example: `https://www.worthepenny.com/offer/out?target=http://ticketsatwork.com` → `http://ticketsatwork.com`
- **Domain Extraction**: Converts full URLs to clean domains
  - Example: `http://monarchmoney.com` → `monarchmoney.com`
- **VigLink URL Generation**: Creates affiliate tracking URLs
  - Format: `https://redirect.viglink.com?u=urlencode($url)&key=23dc527ec87414fb641af890f005fca4&prodOvrd=WRA&opt=true`
  - Where `$url` is the https:// version of the merchant URL
  - Uses hardcoded VigLink API key for affiliate tracking

### Merchant Name Extraction
- **Clean Merchant Names**: Extracts merchant names from common title patterns:
  - `"60% Off Tickets At Work Promo Codes & Discounts"` → `"Tickets At Work"`
  - `"20% Off Love Holidays Discount Codes & Coupons"` → `"Love Holidays"`
  - `"Amazon Promo Codes & Discounts"` → `"Amazon"`
  - `"Save with eBay Coupons"` → `"eBay"`

### Subtitle Extraction
- **Discount Information**: Automatically extracts discount details from promotion titles:
  - `"Get 60% Off All Tickets"` → `"60% off"`
  - `"Save $20 on Your Order"` → `"$20 off"`
  - `"£15 Off Everything"` → `"£15 off"`
  - `"Free Shipping Today"` → `"free shipping"`
  - `"Buy One Get One Free"` → `"bogo"`
  - `"Special Deal Available"` → `"other"` (fallback)

### Description Generation
- **Professional Descriptions**: Automatically generates SEO-friendly coupon descriptions:
  - **With coupon code**: "Is finding discounts from your go-to store a priority for you? You're in the perfect place. Get {Store Name} '{Code}' coupon code to save big now..."
  - **Without code**: "Looking for great deals from {Store Name}? You've found the right place. Take advantage of this {discount} to maximize your savings..."

### Files Structure
- `manifest.json` - Extension configuration and permissions
- `siteConfigs.js` - Site-specific configurations for all supported websites
- `baseScraper.js` - Base scraper class with common utility methods
- `worthepennyScraper.js` - Worthepenny-specific scraper implementation
- `grabonScraper.js` - GrabOn-specific scraper implementation
- `tenereteamScraper.js` - TenereTeam-specific scraper implementation
- `colormangoScraper.js` - ColorMango-specific scraper implementation (NEW)
- `content.js` - Content script that runs on supported pages to scrape data
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality and user interactions
- `background.js` - Background service worker for data processing and notifications

### Permissions
- `activeTab` - Access to current active tab
- `storage` - Store scraped data locally
- `scripting` - Execute content scripts
- `host_permissions` - Access to all supported domains:
  - `https://*.worthepenny.com/*`
  - `https://*.grabon.in/*`
  - `https://*.tenereteam.com/*`
  - `https://*.colormango.com/*` (NEW)
  - `https://*.supabase.co/*` (for database integration)

## Data Flow

1. **Content Script** (`content.js`) runs on any supported coupon website
2. Detects the current site using `detectSite()` function
3. Creates appropriate scraper instance (WorthepennyScraper, GrabonScraper, TenereTeamScraper, or ColorMangoScraper)
4. Scrapes coupon data using site-specific DOM selectors
5. Sends data to **Background Script** (`background.js`)
6. Background script stores data and updates badge
7. **Popup** (`popup.html/js`) displays data and provides copy functionality
8. **Database Integration** (`popup.js`) inserts data to Supabase tables:
   - Groups coupons by merchant to avoid duplicate stores
   - Inserts/updates stores in `public.stores` table with `is_featured = true`
   - Updates existing stores to set `is_featured = true` and refresh logo
   - Inserts coupons in `public.coupons` table with proper field mapping:
     - `JSON.promotionTitle` → `coupons.title`
     - `JSON.subtitle` → `coupons.subtitle` 
     - `JSON.subtitle` → `coupons.discount_value` (also used as discount value)
     - `JSON.couponCode` → `coupons.code`
     - `JSON.description` → `coupons.description` (pre-generated professional descriptions)

## Error Handling

- Graceful fallback if expected elements are not found
- Timeout handling for dynamic content loading
- Console logging for debugging
- User-friendly error messages in the popup

## Privacy & Security

- Only runs on specified Worthepenny domain
- No data is sent to external servers
- All data stored locally in browser
- No sensitive information is collected

## ColorMango Implementation Details

### Selectors Used for ColorMango
- **Coupon Container**: `.softinfo.the1 dt div.lic_new_select`
- **Coupon Items**: XPath `//div[@class='lic_new_select']//ul[not(contains(@class, 'row-front'))]`
- **Merchant Logo**: `img.the1`, `.rightimg.the1 img`
- **Discount Label**: First `<li>` child of coupon item
- **Promotion Title**: Second `<li>` child (may contain coupon code in `<b>` tag)
- **Claim Count**: Third `<li>` child
- **Success Rate**: Fourth `<li>` child with `.coupon_tick` indicator
- **Action Button**: Fifth `<li>` child containing redirect link

### ColorMango URL Processing
- Extracts target URLs from redirect format: `/directlink.asp?ID=154396&RID=112359&type=2&url=...`
- Identifies expired offers using `class="expired"` attribute
- Extracts merchant name from URL pattern: `/product/aragon-ai_154396.html` → "Aragon AI"

## Adding New Sites

To add support for a new coupon website:

1. **Add site configuration** in `siteConfigs.js`:
   ```javascript
   newsite: {
     name: 'NewSite',
     domains: ['newsite.com'],
     urlPatterns: ['/coupons/', '/deals/'],
     selectors: { /* ... */ },
     extractTargetUrl: function(url) { /* ... */ },
     extractMerchantName: function(titleText) { /* ... */ }
   }
   ```

2. **Create site-specific scraper** (e.g., `newsiteScraper.js`):
   ```javascript
   class NewSiteScraper extends BaseScraper {
     constructor() {
       super(SITE_CONFIGS.newsite);
     }

     scrapeMerchantInfo() { /* ... */ }
     scrapeCoupons() { /* ... */ }
   }
   ```

3. **Update `content.js`** to include the new scraper in the factory function

4. **Update `manifest.json`** with new permissions and content script matches

## Troubleshooting

If the extension doesn't work:
1. Ensure you're on a supported coupon website (see Supported Websites section)
2. Check browser console for error messages (look for site detection and scraper initialization logs)
3. Try refreshing the page and waiting for content to load
4. Manually trigger scraping using the popup button
5. For ColorMango: Ensure you're on a product page (e.g., `/product/...` or `/ai-deals/...`)