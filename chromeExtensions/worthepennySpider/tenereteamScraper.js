// TenereTeam-specific scraper implementation
class TenereTeamScraper extends BaseScraper {
  constructor() {
    super(SITE_CONFIGS.tenereteam);
  }

  scrapeMerchantInfo() {
    const merchantContainer = document.querySelector(this.config.selectors.merchantContainer);
    let merchantName = '';
    let merchantDomain = '';
    let merchantUrl = '';
    let merchantLogo = '';
    let merchantDescription = '';
    
    // Extract merchant link and URL info
    if (merchantContainer) {
      const merchantLink = this.findElementBySelectors(this.config.selectors.merchantLink, merchantContainer);
      if (merchantLink) {
        const rawUrl = merchantLink.getAttribute('href') || '';
        const fullUrl = this.config.extractTargetUrl(rawUrl);
        merchantDomain = this.extractDomain(fullUrl);
        merchantUrl = this.ensureHttpsUrl(fullUrl);
        merchantName = merchantLink.textContent?.trim() || '';
      }
    }

    // Extract merchant logo
    merchantLogo = this.findMerchantLogo();

    // Extract merchant description
    merchantDescription = this.findMerchantDescription();

    // Clean merchant name
    if (merchantName) {
      merchantName = this.config.extractMerchantName(merchantName);
    }

    // Fallback name extraction from page title
    if (!merchantName && document.title) {
      merchantName = this.config.extractMerchantName(document.title);
    }

    // Try to extract merchant name from subdomain if no name found
    if (!merchantName && window.location.hostname) {
      const subdomainMatch = window.location.hostname.match(/^([^.]+)\.tenereteam\.com$/);
      if (subdomainMatch && subdomainMatch[1]) {
        // Convert subdomain to readable name (e.g., "suno-ai" -> "Suno AI")
        merchantName = subdomainMatch[1]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }

    // Final fallback
    if (!merchantName) {
      merchantName = 'Unknown Merchant';
    }

    // Try to derive merchant domain and URL from subdomain
    if (!merchantDomain && window.location.hostname) {
      const subdomainMatch = window.location.hostname.match(/^([^.]+)\.tenereteam\.com$/);
      if (subdomainMatch && subdomainMatch[1]) {
        // Common mapping patterns
        const subdomain = subdomainMatch[1];
        if (subdomain === 'suno-ai') {
          merchantDomain = 'suno.ai';
          merchantUrl = 'https://suno.ai';
        } else {
          // Generic pattern: try to guess the domain
          merchantDomain = subdomain.replace(/-/g, '') + '.com';
          merchantUrl = 'https://' + merchantDomain;
        }
      }
    }

    return {
      merchantName,
      merchantDomain,
      merchantUrl,
      merchantLogo,
      merchantDescription
    };
  }

  findMerchantLogo() {
    // Try configured logo selectors
    const logoElement = this.findElementBySelectors(this.config.selectors.merchantLogo);
    
    if (logoElement) {
      const logoUrl = logoElement.src || logoElement.getAttribute('data-src') || logoElement.getAttribute('data-lazy') || '';
      if (logoUrl && !logoUrl.includes('placeholder') && !logoUrl.includes('loading')) {
        return logoUrl;
      }
    }

    // Fallback: search for any logo-related images
    const images = document.querySelectorAll('img');
    for (const img of images) {
      const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy') || '';
      const alt = img.alt || '';
      
      if ((src || alt) && 
          (alt.toLowerCase().includes('logo') ||
           src.toLowerCase().includes('logo') ||
           alt.toLowerCase().includes('brand'))) {
        if (src && !src.includes('placeholder') && !src.includes('loading')) {
          return src;
        }
      }
    }

    return '';
  }

  findMerchantDescription() {
    const descConfig = this.config.selectors.merchantDescription;
    const element = this.findElementByXPathOrSelectors(
      descConfig.xpath,
      descConfig.fallbacks
    );
    
    if (element) {
      return this.extractText(element);
    }

    // Fallback: look for any description-like content
    const fallbackSelectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      '.intro-text',
      '.about-text',
      'p'
    ];

    for (const selector of fallbackSelectors) {
      const elem = document.querySelector(selector);
      if (elem) {
        if (selector.includes('meta')) {
          const content = elem.getAttribute('content') || '';
          if (content.length > 20) {
            return content;
          }
        } else {
          const text = this.extractText(elem);
          if (text.length > 20) {
            return text;
          }
        }
      }
    }

    return 'Find the best coupons and deals for your favorite merchants on TenereTeam platform.';
  }

  scrapeCoupons() {
    const results = [];
    
    console.log('🔍 Starting TenereTeam coupon scraping...');
    console.log('Current URL:', window.location.href);
    console.log('Page title:', document.title);
    
    // Try to find coupon container with multiple fallback selectors
    let couponContainer = null;
    const containerSelectors = this.config.selectors.couponContainer.split(', ');
    
    console.log('🔍 Trying container selectors:', containerSelectors);
    
    for (const selector of containerSelectors) {
      try {
        couponContainer = document.querySelector(selector);
        if (couponContainer) {
          console.log(`✅ Found coupon container using selector: ${selector}`);
          console.log('Container element:', couponContainer);
          break;
        }
      } catch (e) {
        console.warn(`❌ Container selector failed: ${selector}`, e);
      }
    }

    if (!couponContainer) {
      console.log('⚠️ No specific container found, using document body');
      couponContainer = document.body;
    }

    // Log container contents for debugging
    console.log('📄 Container HTML preview:', couponContainer.innerHTML.substring(0, 500) + '...');

    // Try to find coupon items using multiple strategies
    let couponItems = [];
    
    // Strategy 1: Try configured selectors
    const itemConfig = this.config.selectors.couponItems;
    
    if (itemConfig.selectors) {
      console.log('🔍 Trying configured selectors:', itemConfig.selectors);
      
      for (const selector of itemConfig.selectors) {
        try {
          couponItems = couponContainer.querySelectorAll(selector);
          if (couponItems.length > 0) {
            console.log(`✅ Found ${couponItems.length} coupon items using selector: ${selector}`);
            break;
          }
        } catch (e) {
          console.warn(`❌ Selector failed: ${selector}`, e);
        }
      }
    }
    
    // Strategy 2: Try XPath
    if (couponItems.length === 0 && itemConfig.xpath) {
      console.log('🔍 Trying XPath:', itemConfig.xpath);
      try {
        const xpathResult = document.evaluate(
          itemConfig.xpath,
          couponContainer,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        
        couponItems = [];
        for (let i = 0; i < xpathResult.snapshotLength; i++) {
          couponItems.push(xpathResult.snapshotItem(i));
        }
        
        if (couponItems.length > 0) {
          console.log(`✅ Found ${couponItems.length} coupon items using XPath`);
        }
      } catch (e) {
        console.warn(`❌ XPath failed:`, e);
      }
    }

    // Strategy 3: If no specific coupon items found, try aggressive text-based search
    if (couponItems.length === 0) {
      console.log('🔍 Trying aggressive fallback patterns...');
      
      const aggressiveSelectors = [
        // Class-based patterns
        '[class*="coupon"]',
        '[class*="deal"]', 
        '[class*="offer"]',
        '[class*="promo"]',
        '[class*="discount"]',
        '[class*="code"]',
        // Structure-based patterns
        'article',
        '.card',
        '.item',
        '.box',
        'li',
        'div[data-*]',
        // Text-based XPath patterns
      ];
      
      for (const selector of aggressiveSelectors) {
        try {
          const elements = couponContainer.querySelectorAll(selector);
          if (elements.length > 0) {
            console.log(`🔍 Testing pattern ${selector}: found ${elements.length} elements`);
            
            // Filter elements that likely contain coupon information
            const filteredElements = Array.from(elements).filter(el => {
              const text = el.textContent.toLowerCase();
              const hasRelevantText = text.includes('coupon') || 
                                    text.includes('code') || 
                                    text.includes('deal') || 
                                    text.includes('offer') || 
                                    text.includes('discount') || 
                                    text.includes('%') ||
                                    text.includes('save') ||
                                    text.includes('off');
              return hasRelevantText && text.length > 10 && text.length < 1000;
            });
            
            if (filteredElements.length > 0) {
              couponItems = filteredElements;
              console.log(`✅ Found ${couponItems.length} filtered coupon items using pattern: ${selector}`);
              break;
            }
          }
        } catch (e) {
          console.warn(`❌ Aggressive selector failed: ${selector}`, e);
        }
      }
    }
    
    // Strategy 4: Ultra-aggressive XPath text search
    if (couponItems.length === 0) {
      console.log('🔍 Trying XPath text-based search...');
      
      const textXPaths = [
        '//*[contains(text(), "coupon") or contains(text(), "COUPON")]',
        '//*[contains(text(), "code") or contains(text(), "CODE")]',
        '//*[contains(text(), "deal") or contains(text(), "DEAL")]',
        '//*[contains(text(), "offer") or contains(text(), "OFFER")]',
        '//*[contains(text(), "%") and (contains(text(), "off") or contains(text(), "OFF"))]',
        '//*[contains(text(), "save") or contains(text(), "SAVE")]'
      ];
      
      for (const xpath of textXPaths) {
        try {
          const xpathResult = document.evaluate(
            xpath,
            couponContainer,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
          );
          
          if (xpathResult.snapshotLength > 0) {
            couponItems = [];
            for (let i = 0; i < xpathResult.snapshotLength && i < 20; i++) { // Limit to 20 items
              const element = xpathResult.snapshotItem(i);
              if (element && element.textContent.trim().length > 5) {
                couponItems.push(element);
              }
            }
            
            if (couponItems.length > 0) {
              console.log(`✅ Found ${couponItems.length} text-based coupon items using XPath: ${xpath}`);
              break;
            }
          }
        } catch (e) {
          console.warn(`❌ XPath text search failed: ${xpath}`, e);
        }
      }
    }
    
    // Strategy 5: Last resort - look for any structured content
    if (couponItems.length === 0) {
      console.log('🔍 Last resort: looking for any structured content...');
      
      const lastResortSelectors = ['div', 'article', 'section', 'li', 'tr'];
      
      for (const selector of lastResortSelectors) {
        const elements = couponContainer.querySelectorAll(selector);
        const potentialCoupons = Array.from(elements).filter(el => {
          const text = el.textContent.trim();
          return text.length > 20 && text.length < 500 && 
                 (text.includes('$') || text.includes('%') || 
                  text.toLowerCase().includes('free') || 
                  text.toLowerCase().includes('save'));
        });
        
        if (potentialCoupons.length > 0) {
          couponItems = potentialCoupons.slice(0, 10); // Limit to 10
          console.log(`✅ Found ${couponItems.length} potential deals using ${selector} elements`);
          break;
        }
      }
    }
    
    console.log(`📊 Processing ${couponItems.length} potential coupon items...`);
    
    couponItems.forEach((couponItem, index) => {
      try {
        console.log(`🔍 Processing item ${index + 1}:`, couponItem.textContent.substring(0, 100) + '...');
        const couponData = this.extractCouponData(couponItem, index);
        
        console.log(`📄 Extracted data for item ${index + 1}:`, {
          title: couponData.promotionTitle,
          code: couponData.couponCode,
          description: couponData.description?.substring(0, 50) + '...'
        });
        
        if (couponData.promotionTitle || couponData.couponCode) {
          results.push(couponData);
          console.log(`✅ Added coupon ${index + 1} to results`);
        } else {
          console.log(`❌ Skipped item ${index + 1} - no title or code found`);
        }
      } catch (error) {
        console.warn(`❌ Error extracting coupon ${index}:`, error);
      }
    });

    console.log(`🎉 Successfully scraped ${results.length} coupons from TenereTeam`);
    if (results.length > 0) {
      console.log('📋 Final results:', results);
    }
    return results;
  }

  extractCouponData(couponItem, index) {
    console.log(`🔍 Extracting data from coupon item ${index + 1}`);
    console.log('Item HTML:', couponItem.outerHTML.substring(0, 200) + '...');
    
    let promotionTitle = '';
    let description = '';
    let couponCode = '';
    let expiryDate = '';

    // Strategy 1: Extract promotion title using configured selectors
    const titleConfig = this.config.selectors.couponData.promotionTitle;
    let titleElement = this.findElementByXPathOrSelectors(
      titleConfig.xpath,
      titleConfig.fallbacks,
      couponItem
    );

    console.log('Title element found:', titleElement);

    if (titleElement) {
      const attrName = this.config.selectors.promotionTitleAttr;
      if (attrName && titleElement.hasAttribute(attrName)) {
        promotionTitle = titleElement.getAttribute(attrName) || '';
      } else {
        promotionTitle = this.extractText(titleElement);
      }
    }

    // Strategy 2: Fallback title extraction from common elements
    if (!promotionTitle) {
      console.log('No title from configured selectors, trying fallback selectors...');
      const titleSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', '.title', '.heading', 'strong', 'b', 'span', 'p'];
      for (const selector of titleSelectors) {
        const elem = couponItem.querySelector(selector);
        if (elem) {
          const text = this.extractText(elem);
          console.log(`Trying selector ${selector}:`, text.substring(0, 50));
          if (text.length > 5 && text.length < 200) {
            promotionTitle = text;
            console.log(`✅ Found title using ${selector}:`, promotionTitle);
            break;
          }
        }
      }
    }
    
    // Strategy 3: Extract from element's direct text content
    if (!promotionTitle) {
      console.log('Trying direct text content extraction...');
      const directText = couponItem.textContent.trim();
      if (directText.length > 10 && directText.length < 300) {
        // Try to find the first meaningful line
        const lines = directText.split('\n').map(line => line.trim()).filter(line => line.length > 5);
        if (lines.length > 0) {
          promotionTitle = lines[0];
          console.log('✅ Found title from direct text:', promotionTitle);
        }
      }
    }

    // Extract description
    const descConfig = this.config.selectors.couponData.description;
    const descElement = this.findElementByXPathOrSelectors(
      descConfig.xpath,
      descConfig.fallbacks,
      couponItem
    );
    
    if (descElement) {
      description = this.extractText(descElement);
    }

    // Extract coupon code
    const codeConfig = this.config.selectors.couponData.couponCode;
    let codeElement = this.findElementByXPathOrSelectors(
      codeConfig.xpath,
      codeConfig.fallbacks,
      couponItem
    );

    if (codeElement) {
      // Try data attribute first
      couponCode = codeElement.getAttribute('data-code') || 
                   codeElement.getAttribute('data-coupon') ||
                   codeElement.getAttribute('data-promo') ||
                   this.extractText(codeElement);
    }

    // Strategy 2: Try to find code in text content using regex patterns
    if (!couponCode) {
      console.log('No code from selectors, trying text extraction...');
      const textContent = couponItem.textContent || '';
      console.log('Text content for code extraction:', textContent.substring(0, 100));
      
      const codePatterns = [
        /(?:Code|Coupon|Promo|Discount)(?:\s*[:：]\s*|\s+)([A-Z0-9]{3,})/i,
        /\b([A-Z0-9]{4,})\b/g, // Any 4+ character alphanumeric codes
        /(?:Use|Apply|Enter)(?:\s+code\s+|\s+)([A-Z0-9]{3,})/i,
        /([A-Z]{2,}[0-9]+|[0-9]+[A-Z]{2,})/i // Mixed letter-number codes
      ];
      
      for (const pattern of codePatterns) {
        const matches = textContent.match(pattern);
        if (matches) {
          // For global patterns, get all matches and filter
          if (pattern.global) {
            const codes = [...textContent.matchAll(pattern)].map(m => m[1] || m[0]).filter(code => 
              code.length >= 3 && code.length <= 20 && /[A-Z0-9]/.test(code)
            );
            if (codes.length > 0) {
              couponCode = codes[0];
              console.log(`✅ Found code using pattern:`, couponCode);
              break;
            }
          } else {
            couponCode = matches[1] || matches[0];
            console.log(`✅ Found code using pattern:`, couponCode);
            break;
          }
        }
      }
    }

    // Extract expiry date
    const expiryConfig = this.config.selectors.couponData.expiryDate;
    const expiryElement = this.findElementByXPathOrSelectors(
      expiryConfig.xpath,
      expiryConfig.fallbacks,
      couponItem
    );
    
    if (expiryElement) {
      expiryDate = this.extractText(expiryElement);
    }

    // Generate fallback title if none found
    if (!promotionTitle) {
      // Try to get merchant name for fallback title
      const merchantName = this.scrapeMerchantInfo().merchantName || 'Merchant';
      if (couponCode) {
        promotionTitle = `${merchantName} Discount Code: ${couponCode}`;
      } else {
        promotionTitle = `${merchantName} Special Offer #${index + 1}`;
      }
    }

    // Clean up the extracted data
    promotionTitle = promotionTitle.replace(/^\n+|\n+$/g, '').trim();
    description = description.replace(/^\n+|\n+$/g, '').trim();
    couponCode = couponCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    return {
      promotionTitle,
      subtitle: this.extractSubtitle(promotionTitle),
      couponCode: couponCode || '',
      description,
      expiryDate
    };
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TenereTeamScraper;
} else {
  window.TenereTeamScraper = TenereTeamScraper;
}