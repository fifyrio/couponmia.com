// Worthepenny-specific scraper implementation
class WorthepennyScraper extends BaseScraper {
  constructor() {
    super(SITE_CONFIGS.worthepenny);
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
      const brandLink = merchantContainer.querySelector('div a');
      if (brandLink) {
        const rawDomain = brandLink.getAttribute('href') || '';
        const fullUrl = this.config.extractTargetUrl(rawDomain);
        merchantDomain = this.extractDomain(fullUrl);
        merchantUrl = this.ensureHttpsUrl(fullUrl);
        merchantName = brandLink.textContent?.trim() || '';
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

    // Fallback name extraction
    if (!merchantName && document.title) {
      merchantName = this.config.extractMerchantName(document.title);
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
      const logoUrl = logoElement.src || logoElement.getAttribute('data-src') || '';
      if (logoUrl && !logoUrl.includes('placeholder')) {
        return logoUrl;
      }
    }

    // Fallback: search in brand router
    const brandRouter = document.getElementById('brand_router');
    if (brandRouter) {
      const images = brandRouter.querySelectorAll('img');
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
    
    return element ? this.extractText(element) : '';
  }

  scrapeCoupons() {
    const results = [];
    
    const couponContainer = document.querySelector(this.config.selectors.couponContainer);
    if (!couponContainer) {
      console.log('Coupon container not found');
      return results;
    }

    const couponDivs = couponContainer.querySelectorAll(this.config.selectors.couponItems);
    
    couponDivs.forEach((couponDiv, index) => {
      const couponCode = couponDiv.getAttribute(this.config.selectors.couponCodeAttr) || '';
      
      // Find promotion title
      let promotionTitle = '';
      
      // Try data-bf-ctt attribute first
      const titleElement = this.findElementBySelectors(
        this.config.selectors.promotionTitle,
        couponDiv
      );
      
      if (titleElement) {
        const attrName = this.config.selectors.promotionTitleAttr;
        if (attrName && titleElement.hasAttribute(attrName)) {
          promotionTitle = titleElement.getAttribute(attrName) || '';
        } else {
          promotionTitle = this.extractText(titleElement);
        }
        
        // Clean up newlines for Worthepenny
        promotionTitle = promotionTitle.replace(/^\n+|\n+$/g, '').trim();
      }

      // Fallback title generation
      if (!promotionTitle) {
        promotionTitle = couponCode ? 
          `${this.merchantName} Coupon Code: ${couponCode}` : 
          `${this.merchantName} Special Offer`;
      }

      const couponData = {
        promotionTitle,
        subtitle: this.extractSubtitle(promotionTitle),
        couponCode: couponCode
      };

      results.push(couponData);
    });

    return results;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorthepennyScraper;
} else {
  window.WorthepennyScraper = WorthepennyScraper;
}