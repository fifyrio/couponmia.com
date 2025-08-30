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
    
    // Get coupon items using XPath or fallback selectors
    let couponItems = [];
    const itemsConfig = this.config.selectors.couponItems;
    
    if (itemsConfig.xpath) {
      try {
        const xpathResult = document.evaluate(
          itemsConfig.xpath,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        
        for (let i = 0; i < xpathResult.snapshotLength; i++) {
          couponItems.push(xpathResult.snapshotItem(i));
        }
      } catch (error) {
        console.error('Error using XPath for coupon items:', error);
      }
    }
    
    // Fallback to CSS selectors if XPath failed
    if (couponItems.length === 0) {
      couponItems = Array.from(document.querySelectorAll(itemsConfig.fallbacks.join(', ')));
    }
    
    couponItems.forEach((couponDiv, index) => {
      const couponDataConfig = this.config.selectors.couponData;
      
      // Extract promotion title using XPath relative to current element
      let promotionTitle = '';
      if (couponDataConfig.promotionTitle.xpath) {
        try {
          const result = document.evaluate(
            couponDataConfig.promotionTitle.xpath,
            couponDiv,
            null,
            XPathResult.STRING_TYPE,
            null
          );
          if (result.stringValue) {
            promotionTitle = result.stringValue.trim();
          }
        } catch (error) {
          console.error('Error extracting promotion title:', error);
        }
      }
      
      // Fallback for promotion title
      if (!promotionTitle) {
        const titleElement = this.findElementBySelectors(
          couponDataConfig.promotionTitle.fallbacks,
          couponDiv
        );
        if (titleElement) {
          promotionTitle = this.extractText(titleElement);
        }
      }

      // Extract description using XPath relative to current element
      let description = '';
      if (couponDataConfig.description.xpath) {
        try {
          const result = document.evaluate(
            couponDataConfig.description.xpath,
            couponDiv,
            null,
            XPathResult.STRING_TYPE,
            null
          );
          if (result.stringValue) {
            description = result.stringValue.trim();
          }
        } catch (error) {
          console.error('Error extracting description:', error);
        }
      }
      
      // Fallback for description
      if (!description) {
        const descElement = this.findElementBySelectors(
          couponDataConfig.description.fallbacks,
          couponDiv
        );
        if (descElement) {
          description = this.extractText(descElement);
        }
      }

      // Extract coupon code using XPath relative to current element
      let couponCode = '';
      if (couponDataConfig.couponCode.xpath) {
        try {
          const result = document.evaluate(
            couponDataConfig.couponCode.xpath,
            couponDiv,
            null,
            XPathResult.STRING_TYPE,
            null
          );
          if (result.stringValue) {
            couponCode = result.stringValue.trim();
          }
        } catch (error) {
          console.error('Error extracting coupon code:', error);
        }
      }
      
      // Fallback for coupon code
      if (!couponCode) {
        const codeElement = this.findElementBySelectors(
          couponDataConfig.couponCode.fallbacks,
          couponDiv
        );
        if (codeElement) {
          couponCode = codeElement.getAttribute('data-code') || 
                      this.extractText(codeElement);
        }
      }
      
      // Filter out "ACTIVATE OFFER" - treat it as no coupon code
      if (couponCode === 'ACTIVATE OFFER') {
        couponCode = '';
      }

      // Generate fallback title if needed
      if (!promotionTitle) {
        if (couponCode) {
          promotionTitle = `Get Discount with Code ${couponCode}`;
        } else {
          promotionTitle = description || 'Special Offer';
        }
      }

      // Skip if no meaningful content found
      if (!promotionTitle && !couponCode) {
        return;
      }

      const couponData = {
        promotionTitle,
        subtitle: this.extractSubtitle(promotionTitle || description),
        couponCode: couponCode,
        description: description
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