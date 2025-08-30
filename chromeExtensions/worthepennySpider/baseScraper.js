// Base scraper class with common functionality
class BaseScraper {
  constructor(config) {
    this.config = config;
    this.vigLinkApiKey = '23dc527ec87414fb641af890f005fca4';
  }

  // Common utility methods
  extractText(element, trim = true) {
    if (!element) return '';
    const text = element.textContent || '';
    return trim ? text.trim() : text;
  }

  extractDomain(url) {
    if (!url) return '';
    
    try {
      let domain = url.replace(/^https?:\/\//, '');
      domain = domain.replace(/^www\./, '');
      domain = domain.split('/')[0];
      domain = domain.split(':')[0];
      return domain;
    } catch (error) {
      console.error('Error extracting domain:', error);
      return url;
    }
  }

  ensureHttpsUrl(url) {
    if (!url) return '';
    
    try {
      if (url.startsWith('https://')) return url;
      if (url.startsWith('http://')) return url.replace('http://', 'https://');
      return 'https://' + url;
    } catch (error) {
      console.error('Error ensuring https URL:', error);
      return url;
    }
  }

  generateVigLinkUrl(merchantUrl) {
    if (!merchantUrl) return '';
    
    try {
      const httpsUrl = this.ensureHttpsUrl(merchantUrl);
      const encodedUrl = encodeURIComponent(httpsUrl);
      return `https://redirect.viglink.com?u=${encodedUrl}&key=${this.vigLinkApiKey}&prodOvrd=WRA&opt=true`;
    } catch (error) {
      console.error('Error generating VigLink URL:', error);
      return merchantUrl;
    }
  }

  generateCouponDescription(coupon) {
    const storeName = coupon.merchantName || 'this store';
    const code = coupon.couponCode;
    const subtitle = coupon.subtitle || 'special offer';
    
    if (code) {
      return `Is finding discounts from your go-to store a priority for you? You're in the perfect place. Get ${storeName} '${code}' coupon code to save big now. Get your discount by using this code at checkout. Valid only on the internet.`;
    } else {
      return `Looking for great deals from ${storeName}? You've found the right place. Take advantage of this ${subtitle} to maximize your savings. This exclusive offer is available online and can help you get more for less.`;
    }
  }

  extractSubtitle(promotionTitle) {
    if (!promotionTitle) return 'other';
    
    try {
      // Pattern 1: Percentage discounts
      let match = promotionTitle.match(/(\d+%\s*(?:off|OFF|Off))/i);
      if (match && match[1]) return match[1].toLowerCase();
      
      // Pattern 2: Dollar amounts
      match = promotionTitle.match(/(\$\d+(?:\.\d+)?\s*(?:off|OFF|Off))/i);
      if (match && match[1]) return match[1].toLowerCase();
      
      // Pattern 3: Currency amounts
      match = promotionTitle.match(/([£€¥]\d+(?:\.\d+)?\s*(?:off|OFF|Off))/i);
      if (match && match[1]) return match[1].toLowerCase();
      
      // Pattern 4: "Up to X% off" or "Save X%"
      match = promotionTitle.match(/(?:up\s*to\s*|save\s*)(\d+%)/i);
      if (match && match[1]) return match[1] + ' off';
      
      // Pattern 5: "Save $X"
      match = promotionTitle.match(/save(?:\s*up\s*to)?\s*(\$\d+(?:\.\d+)?)/i);
      if (match && match[1]) return match[1] + ' off';
      
      // Pattern 6: Special offers
      if (promotionTitle.match(/free\s*shipping/i)) return 'free shipping';
      if (promotionTitle.match(/buy\s*(?:one|1)\s*get\s*(?:one|1)|bogo/i)) return 'bogo';
      if (promotionTitle.match(/free\s*(?:delivery|returns?)/i)) return 'free delivery';
      
    } catch (error) {
      console.error('Error extracting subtitle:', error);
    }
    
    return 'other';
  }

  // Try multiple selectors and return first match
  findElementBySelectors(selectors, container = document) {
    if (typeof selectors === 'string') {
      selectors = [selectors];
    }
    
    for (const selector of selectors) {
      try {
        const element = container.querySelector(selector);
        if (element) return element;
      } catch (error) {
        console.warn(`Selector failed: ${selector}`, error);
      }
    }
    
    return null;
  }

  // Try XPath first, then fallback selectors
  findElementByXPathOrSelectors(xpath, fallbackSelectors, container = document) {
    // Try XPath first
    if (xpath) {
      try {
        const result = document.evaluate(
          xpath,
          container,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        );
        
        if (result.singleNodeValue) {
          return result.singleNodeValue;
        }
      } catch (error) {
        console.warn(`XPath failed: ${xpath}`, error);
      }
    }
    
    // Fallback to CSS selectors
    return this.findElementBySelectors(fallbackSelectors, container);
  }

  // Abstract methods - must be implemented by subclasses
  scrapeMerchantInfo() {
    throw new Error('scrapeMerchantInfo() must be implemented by subclass');
  }

  scrapeCoupons() {
    throw new Error('scrapeCoupons() must be implemented by subclass');
  }

  // Main scraping method
  scrapeData() {
    try {
      const merchantInfo = this.scrapeMerchantInfo();
      const coupons = this.scrapeCoupons();
      
      // Combine merchant info with each coupon
      const results = coupons.map(coupon => {
        const combinedData = {
          ...coupon,
          ...merchantInfo
        };
        
        // Use scraped description if available, otherwise generate one
        if (!combinedData.description || combinedData.description.trim() === '') {
          combinedData.description = this.generateCouponDescription(combinedData);
        }
        
        return combinedData;
      });
      
      console.log(`Scraped ${results.length} coupons for ${merchantInfo.merchantName}`);
      return results;
      
    } catch (error) {
      console.error('Error scraping data:', error);
      return [];
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseScraper;
} else {
  window.BaseScraper = BaseScraper;
}