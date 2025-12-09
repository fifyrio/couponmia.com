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
      if (match && match[1]) return this.cleanMerchantName(match[1]);
      
      match = titleText.match(/^(.+?)\s+(?:Promo Codes?|Discount Codes?|Coupons?|Discounts?)(?:\s*&\s*(?:Discounts?|Coupons?))?/i);
      if (match && match[1]) return this.cleanMerchantName(match[1]);
      
      return this.cleanMerchantName(titleText);
    },
    
    cleanMerchantName: function(name) {
      if (!name) return '';
      
      // Remove common artifacts and clean up
      return name
        .replace(/\s*(?:Coupon|Coupon Code|Promo Code|Discount Code)\s*/gi, '') // Remove "Coupon Code" etc
        .replace(/\s*[&]\s*$/, '') // Remove trailing "&" 
        .replace(/\s*[&]\s+$/, '') // Remove trailing "& "
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
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
        return this.cleanMerchantName(match[1]);
      }
      
      // Pattern 2: "QuillBot Coupons" -> "QuillBot"  
      match = titleText.match(/^(.+?)\s+(?:Coupons?|Offers?|Deals?|Discounts?)/i);
      if (match && match[1]) {
        return this.cleanMerchantName(match[1]);
      }
      
      // Pattern 3: "Save with ElevenLabs" -> "ElevenLabs"
      match = titleText.match(/^Save\s+with\s+(.+)/i);
      if (match && match[1]) {
        return this.cleanMerchantName(match[1]);
      }
      
      return this.cleanMerchantName(titleText);
    },
    
    cleanMerchantName: function(name) {
      if (!name) return '';
      
      // Remove common artifacts and clean up for GrabOn
      return name
        .replace(/\s*(?:Coupon|Coupon Code|Promo Code|Discount Code)\s*/gi, '') // Remove "Coupon Code" etc
        .replace(/\s*[&]\s*$/, '') // Remove trailing "&" 
        .replace(/\s*[&]\s+$/, '') // Remove trailing "& "
        .replace(/\s*Coupons?\s*[&]\s*$/gi, '') // Remove "Coupons &"
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    }
  },

  tenereteam: {
    name: 'TenereTeam',
    domains: ['tenereteam.com'],
    urlPatterns: ['/coupons'],
    selectors: {
      // More comprehensive container selectors
      couponContainer: '.coupon-list, .deals-container, .offers-grid, .coupons-container, .promotions, .deals, .offers, main, .content, #content, .main-content',
      
      // Broad coupon item selectors including XPath fallbacks
      couponItems: {
        selectors: [
          '.coupon-item', '.deal-card', '.offer-box', '.promo-card', '.coupon', '.deal', '.offer', '.promotion',
          '[data-coupon]', '[data-deal]', '[data-offer]', '[class*="coupon"]', '[class*="deal"]', '[class*="offer"]',
          'div:has(.code)', 'div:has(code)', 'article', '.card', '.item', '.box'
        ],
        xpath: '//*[contains(@class, "coupon") or contains(@class, "deal") or contains(@class, "offer") or contains(@class, "promo")]'
      },
      couponCodeAttr: 'data-code',
      
      // Merchant info
      merchantContainer: '.merchant-info, .store-header, .brand-section, header',
      merchantLink: '.merchant-link, .store-link, .brand-link, a[href*="visit"]',
      merchantLogo: [
        '.merchant-logo img',
        '.store-logo img', 
        '.brand-logo img',
        '.logo img',
        'img[alt*="logo"]',
        'img[alt*="Suno"]'
      ],
      merchantDescription: {
        xpath: '//*[@class="store-description" or @class="merchant-desc"]',
        fallbacks: [
          '.store-description',
          '.merchant-description', 
          '.brand-description',
          '.description',
          'p.desc',
          '.about-store'
        ]
      },
      
      // Promotion titles and coupon data
      promotionTitle: [
        '.coupon-title',
        '.deal-title',
        '.offer-title',
        '.promo-title',
        'h3',
        'h4',
        '.title',
        '[data-title]'
      ],
      promotionTitleAttr: 'data-title',
      
      // Coupon-specific selectors (relative to each coupon item)
      couponData: {
        promotionTitle: {
          xpath: './/h3 | .//h4 | .//*[@class="title"]',
          fallbacks: ['.title', '.coupon-title', '.offer-title']
        },
        description: {
          xpath: './/*[@class="description" or @class="desc"]',
          fallbacks: ['.description', '.desc', '.offer-desc', '.details']
        },
        couponCode: {
          xpath: './/*[@class="code" or @data-code]',
          fallbacks: ['.code', '.coupon-code', '[data-code]', '.promo-code']
        },
        expiryDate: {
          xpath: './/*[@class="expiry" or @class="expires"]',
          fallbacks: ['.expiry', '.expires', '.valid-until', '.exp-date']
        }
      }
    },
    
    // Site-specific processing functions
    extractTargetUrl: function(url) {
      if (!url) return '';
      
      // Handle potential redirect patterns
      const targetMatch = url.match(/[?&](?:target|url|redirect)=([^&]+)/);
      if (targetMatch && targetMatch[1]) {
        return decodeURIComponent(targetMatch[1]);
      }
      
      return url;
    },
    
    extractMerchantName: function(titleText) {
      if (!titleText) return '';
      
      // TenereTeam specific patterns - extract merchant name from page title
      // Pattern 1: "Merchant Name Promo Codes" -> "Merchant Name"
      let match = titleText.match(/^(.+?)\s+(?:Promo Codes?|Discount Codes?|Coupon Codes?|Coupons?)(?:\s*[:：].*)?/i);
      if (match && match[1]) {
        return this.cleanMerchantName(match[1]);
      }
      
      // Pattern 2: "Save with Merchant Name" -> "Merchant Name"
      match = titleText.match(/^Save\s+with\s+(.+)/i);
      if (match && match[1]) {
        return this.cleanMerchantName(match[1]);
      }
      
      // Pattern 3: "Merchant Name Discounts & Offers" -> "Merchant Name"
      match = titleText.match(/^(.+?)\s+(?:Discounts?|Offers?|Deals?)(?:\s*[&]\s*(?:Discounts?|Offers?|Deals?))?/i);
      if (match && match[1]) {
        return this.cleanMerchantName(match[1]);
      }
      
      // Try to extract merchant name from subdomain
      if (window.location.hostname) {
        const subdomainMatch = window.location.hostname.match(/^([^.]+)\.tenereteam\.com$/);
        if (subdomainMatch && subdomainMatch[1]) {
          // Convert subdomain to readable name (e.g., "suno-ai" -> "Suno AI")
          const merchantName = subdomainMatch[1]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          return merchantName;
        }
      }
      
      return this.cleanMerchantName(titleText);
    },
    
    cleanMerchantName: function(name) {
      if (!name) return '';
      
      // Remove common artifacts and clean up
      return name
        .replace(/\s*(?:Coupon|Coupon Code|Promo Code|Discount Code)\s*/gi, '')
        .replace(/\s*[&]\s*$/, '') // Remove trailing "&"
        .replace(/\s*[&]\s+$/, '') // Remove trailing "& "
        .replace(/\s*Coupons?\s*[&]\s*$/gi, '') // Remove "Coupons &"
        .replace(/\s*(?:Discounts?|Offers?|Deals?)\s*$/gi, '') // Remove trailing discount words
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    }
  },

  colormango: {
    name: 'ColorMango',
    domains: ['colormango.com'],
    urlPatterns: ['/product/', '/ai-deals/'],
    selectors: {
      // Main coupon list container
      couponContainer: '#main > div:nth-child(4) > div:nth-child(5) > div:nth-child(5) > dl > dt > div:nth-child(1)',

      // Coupon items - each is a ul element
      // Primary XPath: //*[@id="main"]/div[4]/div[5]/div[5]/dl/dt/div[1]/ul
      couponItems: {
        xpath: '//*[@id="main"]/div[4]/div[5]/div[5]/dl/dt/div[1]/ul',
        fallbacks: [
          '#main > div:nth-child(4) > div:nth-child(5) > div:nth-child(5) > dl > dt > div:nth-child(1) > ul',
          '.lic_new_select ul'
        ]
      },

      // Coupon code attribute
      couponCodeAttr: 'data-code',

      // Merchant info
      merchantContainer: '.rightimg.the1, .softinfo.the1',
      merchantLogo: [
        'img.the1',
        '.rightimg.the1 img',
        '.softinfo.the1 img'
      ],
      merchantDescription: {
        xpath: '//div[@class="softinfo the1"]//p[1]',
        fallbacks: [
          '.softinfo.the1 p:first-of-type',
          '.softinfo p',
          '.description'
        ]
      },

      // Coupon data extraction (relative to each coupon ul element)
      couponData: {
        // Discount amount/percentage - first li element
        discountLabel: {
          xpath: './li[1]',
          fallbacks: ['li:nth-child(1)', 'li:first-child']
        },

        // Promotion title - second li element
        promotionTitle: {
          xpath: './li[2]',
          fallbacks: ['li:nth-child(2)', 'li.off_discount']
        },

        // Coupon code - from data-code attribute in li[5]/div/a/div/@data-code
        couponCode: {
          xpath: './li[5]/div/a/div/@data-code',
          fallbacks: [
            'li:nth-child(5) div a div',
            'li:nth-child(5) [data-code]',
            '[data-code]'
          ]
        },

        // Action button/link - fifth li element
        actionButton: {
          xpath: './li[5]//a',
          fallbacks: ['li:nth-child(5) a', '.tableshow_buynow a', 'a']
        },

        // Check if expired
        isExpired: {
          xpath: './@class',
          fallbacks: []
        }
      }
    },

    // Site-specific processing functions
    extractTargetUrl: function(url) {
      if (!url) return '';

      // ColorMango uses redirect URLs like: /directlink.asp?ID=154396&RID=112359&type=2&url=...
      const urlMatch = url.match(/[?&]url=([^&]+)/);
      if (urlMatch && urlMatch[1]) {
        return decodeURIComponent(urlMatch[1]);
      }

      // If no url parameter, try target parameter
      const targetMatch = url.match(/[?&]target=([^&]+)/);
      if (targetMatch && targetMatch[1]) {
        return decodeURIComponent(targetMatch[1]);
      }

      return url;
    },

    extractMerchantName: function(titleText) {
      if (!titleText) return '';

      // ColorMango patterns
      // Pattern 1: Extract from document title like "Aragon AI Coupon Codes & Promo Code"
      let match = titleText.match(/^(.+?)\s+(?:Coupon Codes?|Promo Codes?|Discount Codes?)(?:\s*[&]\s*(?:Promo Code|Discount Code))?/i);
      if (match && match[1]) {
        return this.cleanMerchantName(match[1]);
      }

      // Pattern 2: "AI Product Name - Coupons" -> "AI Product Name"
      match = titleText.match(/^(.+?)\s*[-–—]\s*(?:Coupons?|Deals?|Offers?)/i);
      if (match && match[1]) {
        return this.cleanMerchantName(match[1]);
      }

      // Pattern 3: Try to extract from URL if present
      if (window.location.pathname) {
        // e.g., /product/aragon-ai_154396.html -> "Aragon AI"
        const pathMatch = window.location.pathname.match(/\/product\/([^_]+)_\d+\.html/);
        if (pathMatch && pathMatch[1]) {
          const merchantName = pathMatch[1]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          return merchantName;
        }
      }

      return this.cleanMerchantName(titleText);
    },

    cleanMerchantName: function(name) {
      if (!name) return '';

      return name
        .replace(/\s*(?:Coupon|Coupon Code|Promo Code|Discount Code)\s*/gi, '')
        .replace(/\s*[&]\s*$/, '')
        .replace(/\s*[&]\s+$/, '')
        .replace(/\s*Coupons?\s*[&]\s*$/gi, '')
        .replace(/\s*(?:Discounts?|Offers?|Deals?)\s*$/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    },

    // Extract product ID from URL
    extractProductId: function(url) {
      const match = url.match(/ID=(\d+)/);
      return match ? match[1] : '';
    },

    // Extract redirect ID from URL
    extractRedirectId: function(url) {
      const match = url.match(/RID=(\d+)/);
      return match ? match[1] : '';
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