# CouponMia Chrome Extension

A smart Chrome extension that automatically detects the websites you visit and shows available coupon codes and deals from CouponMia.com.

## Features

### 🎯 Smart Detection
- Automatically detects the current website domain
- Shows badge with available coupon count
- Non-intrusive floating notifications for stores with deals

### 🎫 Coupon Management
- View all available coupons for the current store
- One-click copy for coupon codes
- Direct links to deals and offers
- Popular coupons highlighted

### 🛒 Checkout Assistance
- Special notifications on checkout/cart pages
- Reminds users to apply coupons before completing purchase
- Inline widget for easy coupon access

### 🎨 Beautiful UI
- Purple theme matching CouponMia.com branding
- Dark mode design for better visibility
- Smooth animations and transitions
- Mobile-responsive design

## Installation

### Development Installation
1. Clone or download the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `couponMiaExtension` folder
5. The extension icon should appear in your toolbar

### Production Installation
(Will be available on Chrome Web Store)

## Usage

### Automatic Detection
1. Navigate to any shopping website
2. If coupons are available, you'll see:
   - A badge with the number of available coupons
   - A floating notification (dismissible)
   - Special reminders on checkout pages

### Manual Access
1. Click the CouponMia extension icon in your toolbar
2. View available coupons for the current website
3. Click coupon codes to copy them
4. Click "Get Deal" buttons to open offers

### Features by Page Type

#### Shopping Pages
- Floating notification with coupon count
- Click to view all available deals
- Non-intrusive and easily dismissible

#### Checkout/Cart Pages
- Special bounce animation reminder
- Prominent placement to prevent missed savings
- Direct access to apply codes

## Architecture

### Content Script (`content.js`)
- Detects current domain
- Shows notifications and widgets
- Handles checkout page detection
- Creates inline coupon widgets

### Background Script (`background.js`)
- Manages API calls to CouponMia.com
- Caches coupon data for performance
- Updates extension badge with coupon count
- Tracks user interactions

### Popup (`popup.html` + `popup.js`)
- Main interface when clicking extension icon
- Shows store information and coupon list
- Handles coupon code copying
- Provides links to deals

## API Integration

The extension integrates with CouponMia.com's API:

### Store Search
```
GET https://www.couponmia.com//api/search/stores?domain={domain}
```

### Store Coupons
```
GET https://couponmia.com/api/stores/{storeAlias}/coupons
```

## Styling

### Color Palette
Based on CouponMia.com's brand colors:
- **Primary Background**: `#0a0a0a` (Dark black)
- **Brand Purple**: `#8b5cf6` (Primary brand color)
- **Light Purple**: `#a78bfa` (Accents)
- **Dark Purple**: `#1a0a2e` (Headers)
- **Text Primary**: `#f9fafb` (Main text)
- **Text Secondary**: `#d1d5db` (Secondary text)

### Design Principles
- Dark theme for better visibility on any website
- Purple gradient headers for brand recognition
- Smooth animations for better user experience
- Responsive design for different screen sizes

## Privacy & Security

### Data Collection
- Only tracks coupon usage for analytics
- No personal information stored
- Domain detection is local only

### Permissions
- `activeTab`: Access current page domain
- `storage`: Cache coupon data locally
- `host_permissions`: API calls to CouponMia.com only

### Security Features
- Content Security Policy enforced
- No external script loading
- Secure API communication only

## Development

### File Structure
```
couponMiaExtension/
├── manifest.json          # Extension configuration
├── popup.html             # Main popup interface
├── popup.js               # Popup functionality
├── content.js             # Content script for page interaction
├── background.js          # Background service worker
├── icons/                 # Extension icons
└── README.md             # This file
```

### Building
No build process required - this is a vanilla JavaScript extension.

### Testing
1. Load extension in developer mode
2. Visit various shopping websites
3. Check badge updates and notifications
4. Test popup functionality
5. Verify checkout page reminders

### Debugging
- Use Chrome DevTools for popup debugging
- Check background script logs in `chrome://extensions/`
- Content script logs appear in page console

## Roadmap

### v1.1 Planned Features
- [ ] Auto-apply coupon codes at checkout
- [ ] Cashback tracking integration
- [ ] Price comparison features
- [ ] Wishlist and favorites

### v1.2 Planned Features
- [ ] Multi-language support
- [ ] Custom notification preferences
- [ ] Integration with shopping lists
- [ ] Social sharing of deals

## Support

For issues or feature requests:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Contact support via CouponMia.com

## License

© 2025 CouponMia. All rights reserved.