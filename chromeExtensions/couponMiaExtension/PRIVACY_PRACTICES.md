# CouponMia Chrome Extension - Privacy Practices Documentation

## Extension Overview
**Name:** CouponMia - Smart Coupon Finder  
**Version:** 1.0.0  
**Developer:** CouponMia Team  
**Contact:** support@couponmia.com  

## Single Purpose Description
CouponMia is a smart coupon finder extension that automatically detects when users visit e-commerce websites and helps them find and apply available coupon codes and deals for those specific stores. The extension provides a seamless way to save money by displaying relevant discounts without requiring users to manually search for coupons.

## Permissions Justifications

### 1. activeTab Permission
**What it allows:** Access to the currently active tab's content and URL  
**Why we need it:** 
- To detect which e-commerce website the user is currently visiting
- To identify the store domain and check if coupon codes are available for that specific merchant
- To display relevant coupons and deals contextually based on the current shopping session
- To inject non-intrusive notification widgets when coupons are found
**Data collected:** Only the domain name of the active website (e.g., "amazon.com", "walmart.com")
**User benefit:** Automatic coupon detection without manual input, saving time and money

### 2. Host Permissions (https://couponmia.com/*, https://www.couponmia.com//*)
**What it allows:** Communication with CouponMia's API servers  
**Why we need it:**
- To fetch current coupon codes and deals from our database for the detected store
- To retrieve store information including logos, names, and available discounts
- To access our curated database of verified coupon codes from legitimate merchants
- To ensure users receive the most up-to-date and working promotional codes
**Data transmitted:** Store domain names only (no personal information)
**User benefit:** Access to verified, current coupon codes that actually work

### 3. Storage Permission
**What it allows:** Local storage of extension data on the user's device  
**Why we need it:**
- To cache coupon data temporarily (10 minutes) to improve performance and reduce API calls
- To store user preferences such as notification settings
- To maintain analytics data locally for debugging and performance optimization
- To preserve extension state between browser sessions
**Data stored locally:** 
- Cached coupon data (temporarily)
- Extension activity logs for debugging
- User interaction analytics (button clicks, coupons used)
- No personal information or browsing history
**User benefit:** Faster loading times and better performance

### 4. Tabs Permission
**What it allows:** Access to tab information and ability to create new tabs  
**Why we need it:**
- To detect when users navigate to checkout/cart pages and provide timely coupon reminders
- To open affiliate coupon links in new tabs when users click "Get Deal" buttons
- To monitor tab changes for automatic coupon detection on new stores
- To insert new tabs at the first position for better user experience when accessing deals
**Data accessed:** Tab URLs and navigation events (only to detect e-commerce domains)
**User benefit:** Automatic detection of shopping sessions and convenient access to deals

## Data Usage and Privacy Compliance

### Data We Collect
- **Website domains only:** We only collect the domain names of websites you visit (e.g., "target.com") to check for available coupons
- **Usage analytics:** Anonymous data about extension interactions (coupon clicks, notifications shown)
- **No personal information:** We do not collect names, emails, addresses, payment information, or browsing history

### Data We DO NOT Collect
- Personal identifying information (name, email, phone, address)
- Payment or financial information
- Full browsing history or URL paths
- Form data or user input
- Login credentials or passwords
- Shopping cart contents or purchase information

### Data Processing
- All data processing occurs locally on your device
- Domain detection happens in real-time without storing browsing history
- Coupon data is temporarily cached for performance (automatically deleted after 10 minutes)
- No data is shared with third parties except for the necessary API calls to our own servers

### Data Transmission
- Only store domain names are sent to CouponMia servers to retrieve relevant coupons
- All communication uses secure HTTPS encryption
- No user identification or tracking across websites
- API calls are anonymous and cannot be linked to individual users

### Data Storage
- Local storage only contains cached coupon data and extension preferences
- No cloud storage or remote data persistence
- Cache automatically expires and is cleaned up regularly
- Users can clear all stored data by removing the extension

## Third-Party Services
- **CouponMia API:** Our own service that provides coupon codes and store information
- **Clearbit Logo API:** Used only to display store logos for better user experience
- **No advertising networks:** We do not integrate with any ad networks or tracking services
- **No social media tracking:** No Facebook pixels, Google Analytics, or similar tracking tools

## User Control and Transparency
- Extension can be disabled or removed at any time through Chrome's extension management
- All notifications and widgets include close buttons for user control
- No background tracking when extension is disabled
- Clear visual indicators when the extension is active (badge notifications)

## Security Measures
- All API communications use HTTPS encryption
- No remote code execution or dynamic script loading
- Content Security Policy restrictions prevent unauthorized code execution
- Regular security reviews and updates

## Compliance Statements
- **COPPA Compliance:** Extension is not directed at children under 13
- **GDPR Compliance:** No personal data collection means minimal GDPR obligations
- **CCPA Compliance:** No sale of personal information (none is collected)
- **Chrome Web Store Policies:** Full compliance with all developer program policies

## Remote Code Justification
This extension does not use remote code. All JavaScript files are included in the extension package and reviewed by the Chrome Web Store. The extension only makes API calls to fetch coupon data (JSON responses), not executable code.

## Changes to Privacy Practices
Users will be notified of any material changes to these privacy practices through extension updates. The current version of this document applies to version 1.0.0 of the CouponMia extension.

## Contact Information
For privacy questions or concerns:
- Email: support@couponmia.com
- Website: https://couponmia.com/privacy
- Response time: Within 48 hours for privacy-related inquiries

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Document Version:** 1.0