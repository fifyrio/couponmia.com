# Worthepenny Spider Chrome Extension

A Chrome extension to scrape coupon data from all Worthepenny websites (`https://*.worthepenny.com/coupon/` and `/store/` pages) and export it as JSON.

## Features

- **Automatic Scraping**: Automatically scrapes coupon data when visiting Worthepenny coupon pages
- **Manual Scraping**: Click the extension icon to manually scrape the current page
- **JSON Export**: View and copy scraped data as formatted JSON
- **Database Integration**: Insert scraped data directly to Supabase database (stores and coupons tables)
- **Data Persistence**: Stores scraped data locally for easy access
- **Badge Notifications**: Shows the number of scraped coupons on the extension icon

## Scraped Data Structure

The extension extracts the following information for each coupon:

```json
{
  "promotionTitle": "String - The promotion/deal title",
  "subtitle": "String - Extracted discount info (e.g., '60% off', '$10 off', 'other')",
  "couponCode": "String - The coupon code from data-code attribute",
  "merchantName": "String - The merchant/store name",
  "merchantDomain": "String - The extracted target URL (e.g., 'http://ticketsatwork.com')",
  "merchantLogo": "String - The merchant's logo image URL"
}
```

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `worthepennySpider` folder
4. The extension will appear in your extensions list

## Usage

### Automatic Mode
1. Navigate to any Worthepenny coupon or store page:
   - `https://*.worthepenny.com/coupon/*` (any subdomain)
   - `https://*.worthepenny.com/store/*` (any subdomain)
   - `https://worthepenny.com/coupon/*` (main domain)
   - `https://worthepenny.com/store/*` (main domain)
2. The extension will automatically scrape the page when it loads
3. Click the extension icon to view the scraped data

### Manual Mode
1. Navigate to any Worthepenny coupon or store page (see supported URLs above)
2. Click the Worthepenny Spider extension icon
3. Click "Scrape Current Page" button
4. View the JSON output and copy to clipboard if needed
5. **Database Integration**: Click "Insert to Database" to save data to Supabase

### Database Integration Setup
1. After scraping data, click the "Insert to Database" button
2. On first use, enter your Supabase configuration:
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

## Technical Details

### Selectors Used
- **Coupon Codes**: `#coupon_list div[data-code]` - Extracts the `data-code` attribute
- **Merchant Info**: `#brand_router div a` - Extracts merchant name and domain from href attribute
- **Merchant Logo**: Multiple selectors including `#brand_router img`, `.merchant-logo img`, `.brand-logo img`, etc.
- **Promotion Titles**: Primary selector `._hidden_4.worthepennycom[data-bf-ctt]` - Extracts from `data-bf-ctt` attribute
  - Fallback selectors: `._hidden_4[data-bf-ctt]`, `.worthepennycom[data-bf-ctt]`, `[data-bf-ctt]`
  - Additional fallbacks: `.coupon-title`, `.offer-title`, `h3`, `h4`, etc.

### URL Extraction
- **Target URL**: Automatically extracts the target URL from Worthepenny redirect URLs
  - Example: `https://www.worthepenny.com/offer/out?target=http://ticketsatwork.com` → `http://ticketsatwork.com`

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

### Files Structure
- `manifest.json` - Extension configuration and permissions
- `content.js` - Content script that runs on Worthepenny pages to scrape data
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality and user interactions
- `background.js` - Background service worker for data processing and notifications

### Permissions
- `activeTab` - Access to current active tab
- `storage` - Store scraped data locally
- `scripting` - Execute content scripts
- `host_permissions` - Access to all Worthepenny domains and subdomains, plus Supabase API

## Data Flow

1. **Content Script** (`content.js`) runs on any Worthepenny coupon or store pages
2. Scrapes coupon data using DOM selectors
3. Sends data to **Background Script** (`background.js`)
4. Background script stores data and updates badge
5. **Popup** (`popup.html/js`) displays data and provides copy functionality
6. **Database Integration** (`popup.js`) inserts data to Supabase tables:
   - Groups coupons by merchant to avoid duplicate stores
   - Inserts/updates stores in `public.stores` table with `is_featured = true`
   - Updates existing stores to set `is_featured = true` and refresh logo
   - Inserts coupons in `public.coupons` table with proper field mapping:
     - `JSON.promotionTitle` → `coupons.title`
     - `JSON.subtitle` → `coupons.subtitle` 
     - `JSON.subtitle` → `coupons.discount_value` (also used as discount value)
     - `JSON.couponCode` → `coupons.code`
     - **Smart Description Generation**: Creates professional, SEO-friendly coupon descriptions

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

## Troubleshooting

If the extension doesn't work:
1. Ensure you're on a valid Worthepenny coupon page
2. Check browser console for error messages
3. Try refreshing the page and waiting for content to load
4. Manually trigger scraping using the popup button