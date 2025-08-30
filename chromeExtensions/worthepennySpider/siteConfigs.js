// Site-specific configurations for multi-site scraping
const SITE_CONFIGS = {
  worthepenny: {
    name: 'Worthepenny',
    domains: ['worthepenny.com'],
    urlPatterns: ['/coupon/', '/store/'],
    selectors: {
      couponContainer: '#coupon_list',
      couponItems: 'div[data-code]',
      couponCodeAttr: 'data-code',
      
      // Merchant info
      merchantContainer: '#brand_router',
      merchantLink: '#brand_router div a',
      merchantLogo: [
        '#brand_router img',
        '.merchant-logo img',
        '.brand-logo img',
        '.store-logo img',
        '.logo img'
      ],
      merchantDescription: {
        xpath: '//*[@id="left_unique"]/div[1]/p[1]',
        fallbacks: [
          '#left_unique > div:first-child > p:first-child',
          '#left_unique p:first-of-type',
          '.store-description',
          '.merchant-description',
          '.brand-description'
        ]
      },
      
      // Promotion titles
      promotionTitle: [
        '._hidden_4.worthepennycom[data-bf-ctt]',
        '._hidden_4[data-bf-ctt]',
        '.worthepennycom[data-bf-ctt]',
        '[data-bf-ctt]',
        '.coupon-title',
        '.offer-title',
        '.deal-title',
        'h3',
        'h4'
      ],
      promotionTitleAttr: 'data-bf-ctt'
    },
    
    // Site-specific processing functions
    extractTargetUrl: function(url) {
      if (!url) return '';
      const targetMatch = url.match(/[?&]target=([^&]+)/);
      return targetMatch && targetMatch[1] ? decodeURIComponent(targetMatch[1]) : url;
    },
    
    extractMerchantName: function(titleText) {
      if (!titleText) return '';
      
      // Worthepenny-specific title patterns
      let match = titleText.match(/^\d+%?\s*Off\s+(.+?)\s+(?:Promo Codes?|Discount Codes?|Coupons?|Discounts?)(?:\s*&\s*(?:Discounts?|Coupons?))?/i);
      if (match && match[1]) return match[1].trim();
      
      match = titleText.match(/^(.+?)\s+(?:Promo Codes?|Discount Codes?|Coupons?|Discounts?)(?:\s*&\s*(?:Discounts?|Coupons?))?/i);
      if (match && match[1]) return match[1].trim();
      
      return titleText.trim();
    }
  },

  grabon: {
    name: 'GrabOn',
    domains: ['grabon.in'],
    urlPatterns: ['-coupons/', '/coupons/', '/offers/'],
    selectors: {
      couponContainer: 'body',
      couponItems: {
        xpath: '//*[@class="gcbr go-cpn-show go-cpy"]',
        fallbacks: ['.gc-box', '.gcbr']
      },
      
      // Merchant info
      merchantContainer: '.bank, .merchant-info',
      merchantLink: 'a[href*="visit"], .merchant-link',
      merchantLogo: {
        xpath: '//*[@id="gBody"]/main/section[1]/div/div[1]/img/@src',
        fallbacks: [
          '.bank img',
          '.merchant-logo img',
          '.gcbl img',
          '.logo img',
          'img[alt*="logo"]'
        ]
      },
      merchantDescription: {
        xpath: '//*[@id="gmfDesp"]',
        fallbacks: [
          '.store-description',
          '.merchant-description',
          '.brand-description',
          '.description',
          'p.desc'
        ]
      },
      
      // Coupon data extraction (relative to each coupon item)
      couponData: {
        promotionTitle: {
          xpath: './p[1]/text()',
          fallbacks: ['.gcbr > p', '.coupon-title', '.offer-title']
        },
        description: {
          xpath: './div[1]/span/text()',
          fallbacks: ['.description', '.offer-desc']
        },
        couponCode: {
          xpath: './div[@class="gcbr-r"]/span/span[@class="visible-lg"]/text()',
          fallbacks: ['.coupon-code', '.code', '[data-code]']
        }
      }
    },
    
    // Site-specific processing functions
    extractTargetUrl: function(url) {
      // GrabOn may have different URL structure
      if (!url) return '';
      return url; // May need adjustment based on actual structure
    },
    
    extractMerchantName: function(titleText) {
      if (!titleText) return '';
      
      // GrabOn-specific title patterns
      // Pattern 1: "ElevenLabs Promo Codes: FLAT 50% OFF Discount Codes" -> "ElevenLabs"
      let match = titleText.match(/^(.+?)\s+(?:Promo Codes?|Discount Codes?|Coupon Codes?)(?:\s*[:：].*)?/i);
      if (match && match[1]) {
        return match[1].trim();
      }
      
      // Pattern 2: "QuillBot Coupons" -> "QuillBot"  
      match = titleText.match(/^(.+?)\s+(?:Coupons?|Offers?|Deals?|Discounts?)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
      
      // Pattern 3: "Save with ElevenLabs" -> "ElevenLabs"
      match = titleText.match(/^Save\s+with\s+(.+)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
      
      return titleText.trim();
    }
  }
};

// Site detection utility
function detectSite(url) {
  for (const [siteKey, config] of Object.entries(SITE_CONFIGS)) {
    const matchesDomain = config.domains.some(domain => url.includes(domain));
    const matchesPattern = config.urlPatterns.some(pattern => url.includes(pattern));
    
    if (matchesDomain && matchesPattern) {
      return { siteKey, config };
    }
  }
  return null;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SITE_CONFIGS, detectSite };
} else {
  window.SITE_CONFIGS = SITE_CONFIGS;
  window.detectSite = detectSite;
}