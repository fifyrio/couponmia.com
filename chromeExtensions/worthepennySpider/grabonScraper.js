// GrabOn-specific scraper implementation
class GrabonScraper extends BaseScraper {
  constructor() {
    super(SITE_CONFIGS.grabon);
  }

  scrapeMerchantInfo() {
    let merchantName = '';
    let merchantDomain = '';
    let merchantUrl = '';
    let merchantLogo = '';
    let merchantDescription = '';
    
    // Extract merchant name from page title or URL
    if (document.title) {
      merchantName = this.config.extractMerchantName(document.title);
    }
    
    // Try to extract from URL if title extraction failed
    if (!merchantName) {
      const urlPath = window.location.pathname;
      const match = urlPath.match(/\/([^\/]+)-coupons?\//);
      if (match && match[1]) {
        merchantName = match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    // Extract merchant URL and domain
    const merchantLink = this.findElementBySelectors(this.config.selectors.merchantLink);
    if (merchantLink) {
      const rawUrl = merchantLink.getAttribute('href') || '';
      const fullUrl = this.config.extractTargetUrl(rawUrl);
      merchantDomain = this.extractDomain(fullUrl);
      merchantUrl = this.ensureHttpsUrl(fullUrl);
    }

    // If no merchant URL found, try to construct from merchant name
    if (!merchantUrl && merchantName) {
      // Attempt to construct URL from merchant name
      const cleanName = merchantName.toLowerCase().replace(/\s+/g, '');
      merchantDomain = `${cleanName}.com`;
      merchantUrl = `https://${merchantDomain}`;
    }

    // Extract merchant logo
    merchantLogo = this.findMerchantLogo();

    // Extract merchant description
    merchantDescription = this.findMerchantDescription();

    return {
      merchantName,
      merchantDomain, 
      merchantUrl,
      merchantLogo,
      merchantDescription
    };
  }

  findMerchantLogo() {
    const logoConfig = this.config.selectors.merchantLogo;
    
    // Try XPath first if available
    if (logoConfig.xpath) {
      try {
        const result = document.evaluate(
          logoConfig.xpath,
          document,
          null,
          XPathResult.STRING_TYPE,
          null
        );
        
        if (result.stringValue) {
          const logoUrl = result.stringValue.trim();
          if (logoUrl && !logoUrl.includes('placeholder')) {
            return logoUrl;
          }
        }
      } catch (error) {
        console.error('Error using XPath for logo:', error);
      }
    }
    
    // Fallback to CSS selectors
    const logoElement = this.findElementBySelectors(logoConfig.fallbacks || logoConfig);
    
    if (logoElement) {
      const logoUrl = logoElement.src || logoElement.getAttribute('data-src') || '';
      if (logoUrl && !logoUrl.includes('placeholder')) {
        return logoUrl;
      }
    }

    // Final fallback: look for any merchant-related images
    const merchantContainer = this.findElementBySelectors(this.config.selectors.merchantContainer);
    if (merchantContainer) {
      const images = merchantContainer.querySelectorAll('img');
      for (const img of images) {
        const src = img.src || img.getAttribute('data-src') || '';
        if (src && !src.includes('placeholder') && !src.includes('icon')) {
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
    
    if (!element) return '';
    
    let description = this.extractText(element);
    
    // Remove the last sentence if it contains "GrabOn"
    if (description) {
      const sentences = description.split(/[.!?]+/);
      if (sentences.length > 1) {
        const lastSentence = sentences[sentences.length - 1].trim();
        if (lastSentence.includes('GrabOn')) {
          // Remove the last sentence and rejoin
          sentences.pop();
          description = sentences.join('.').trim();
          if (description && !description.endsWith('.')) {
            description += '.';
          }
        }
      }
    }
    
    return description;
  }

  scrapeCoupons() {
    const results = [];
    
    const couponItems = document.querySelectorAll(this.config.selectors.couponItems);
    
    couponItems.forEach((couponDiv, index) => {
      // Extract coupon code - GrabOn may display it differently
      let couponCode = '';
      
      // Look for coupon code in various places
      const codeSelectors = [
        '.coupon-code',
        '.code',
        '[data-code]',
        '.gc-code',
        '.offer-code'
      ];
      
      const codeElement = this.findElementBySelectors(codeSelectors, couponDiv);
      if (codeElement) {
        couponCode = codeElement.getAttribute('data-code') || 
                    this.extractText(codeElement);
      }

      // Extract promotion title
      let promotionTitle = '';
      const titleElement = this.findElementBySelectors(
        this.config.selectors.promotionTitle,
        couponDiv
      );
      
      if (titleElement) {
        promotionTitle = this.extractText(titleElement);
      }

      // Extract discount amount if available
      let discountAmount = '';
      const amountElement = this.findElementBySelectors(
        this.config.selectors.discountAmount,
        couponDiv
      );
      
      if (amountElement) {
        discountAmount = this.extractText(amountElement);
      }

      // Generate fallback title if needed
      if (!promotionTitle) {
        if (couponCode) {
          promotionTitle = `Get ${discountAmount || 'Discount'} with Code ${couponCode}`;
        } else {
          promotionTitle = `${discountAmount || 'Special Offer'} Deal`;
        }
      }

      // Skip if no meaningful content found
      if (!promotionTitle && !couponCode) {
        return;
      }

      const couponData = {
        promotionTitle,
        subtitle: this.extractSubtitle(promotionTitle || discountAmount),
        couponCode: couponCode
      };

      results.push(couponData);
    });

    return results;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GrabonScraper;
} else {
  window.GrabonScraper = GrabonScraper;
}