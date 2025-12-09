// ColorMango-specific scraper implementation
class ColorMangoScraper extends BaseScraper {
  constructor() {
    const config = SITE_CONFIGS.colormango;
    super(config);
  }

  scrapeMerchantInfo() {
    const config = this.config;
    const merchantInfo = {
      merchantName: '',
      merchantDomain: '',
      merchantUrl: '',
      merchantLogo: '',
      merchantDescription: '',
      merchantScreenshot: '',
      merchantFaqImage: ''
    };

    try {
      // Extract merchant name from page title or URL
      const pageTitle = document.title;
      merchantInfo.merchantName = config.extractMerchantName(pageTitle);

      // Try to get merchant logo from Open Graph og:image meta tag first
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        merchantInfo.merchantLogo = ogImage.getAttribute('content') || '';
      }

      // Fallback: Try to find merchant logo from page elements if og:image not found
      if (!merchantInfo.merchantLogo) {
        const logoElement = this.findElementBySelectors(config.selectors.merchantLogo);
        if (logoElement) {
          merchantInfo.merchantLogo = logoElement.src || logoElement.getAttribute('src') || '';
        }
      }

      // Try to find merchant description
      const descElement = this.findElementByXPathOrSelectors(
        config.selectors.merchantDescription.xpath,
        config.selectors.merchantDescription.fallbacks
      );
      if (descElement) {
        merchantInfo.merchantDescription = this.extractText(descElement);
      }

      // Extract merchant URL from XPath: //*[@id="main"]/div[4]/div[7]/div[1]/fieldset/dl[1]/dd/a/@href
      let merchantUrl = '';
      if (config.selectors.merchantUrl) {
        merchantUrl = this.findAttributeByXPath(
          config.selectors.merchantUrl.xpath,
          config.selectors.merchantUrl.fallbacks
        );
        console.log('Extracted merchant URL from XPath:', merchantUrl);
      }

      // If XPath extraction failed, try meta tags
      if (!merchantUrl) {
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) {
          merchantUrl = ogUrl.getAttribute('content') || '';
        }
      }

      // Apply site-specific URL extraction logic (handle redirects)
      if (merchantUrl) {
        const extractedUrl = config.extractTargetUrl(merchantUrl);
        merchantInfo.merchantUrl = this.ensureHttpsUrl(extractedUrl);
        merchantInfo.merchantDomain = this.extractDomain(extractedUrl);
      } else {
        // Final fallback: use current URL
        merchantInfo.merchantUrl = window.location.href;
        merchantInfo.merchantDomain = this.extractDomain(window.location.href);
      }

      // Extract merchant screenshot from XPath: //*[@id="main"]/div[4]/div[5]/div[4]/span/a/@href
      const screenshotXPath = '//*[@id="main"]/div[4]/div[5]/div[4]/span/a/@href';
      try {
        const xpathResult = document.evaluate(
          screenshotXPath,
          document,
          null,
          XPathResult.STRING_TYPE,
          null
        );
        const screenshotUrl = xpathResult.stringValue || '';
        if (screenshotUrl) {
          merchantInfo.merchantScreenshot = screenshotUrl;
          console.log('Extracted merchant screenshot:', screenshotUrl);
        }
      } catch (error) {
        console.warn('Failed to extract merchant screenshot:', error);
      }

      // Extract merchant FAQ image from XPath: //*[@id="main"]/div[4]/div[8]/div/div/div/span/img/@src
      const faqImageXPath = '//*[@id="main"]/div[4]/div[8]/div/div/div/span/img/@src';
      try {
        const xpathResult = document.evaluate(
          faqImageXPath,
          document,
          null,
          XPathResult.STRING_TYPE,
          null
        );
        let faqImageUrl = xpathResult.stringValue || '';
        if (faqImageUrl) {
          // Check if it's a relative URL and prepend base URL if needed
          if (faqImageUrl.startsWith('/')) {
            faqImageUrl = 'https://www.colormango.com' + faqImageUrl;
          } else if (!faqImageUrl.startsWith('http://') && !faqImageUrl.startsWith('https://')) {
            faqImageUrl = 'https://www.colormango.com/' + faqImageUrl;
          }
          merchantInfo.merchantFaqImage = faqImageUrl;
          console.log('Extracted merchant FAQ image:', faqImageUrl);
        }
      } catch (error) {
        console.warn('Failed to extract merchant FAQ image:', error);
      }

      console.log('ColorMango merchant info scraped:', merchantInfo);
    } catch (error) {
      console.error('Error scraping ColorMango merchant info:', error);
    }

    return merchantInfo;
  }

  scrapeCoupons() {
    const config = this.config;
    const coupons = [];

    try {
      // Find all coupon items using XPath first, then fallback to CSS selectors
      let couponElements = [];

      // Try XPath
      if (config.selectors.couponItems.xpath) {
        try {
          const xpathResult = document.evaluate(
            config.selectors.couponItems.xpath,
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
          );

          for (let i = 0; i < xpathResult.snapshotLength; i++) {
            couponElements.push(xpathResult.snapshotItem(i));
          }
        } catch (error) {
          console.warn('XPath query failed:', error);
        }
      }

      // Fallback to CSS selectors if XPath didn't work
      if (couponElements.length === 0 && config.selectors.couponItems.fallbacks) {
        for (const selector of config.selectors.couponItems.fallbacks) {
          try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              couponElements = Array.from(elements);
              break;
            }
          } catch (error) {
            console.warn(`Selector failed: ${selector}`, error);
          }
        }
      }

      console.log(`Found ${couponElements.length} coupon elements on ColorMango using XPath`);
      console.log('XPath used:', config.selectors.couponItems.xpath);

      // Extract data from each coupon element
      // Skip the first element (index 0) as it's the table header
      couponElements.forEach((couponElement, index) => {
        if (index === 0) {
          console.log('Skipping first element (table header row)');
          return; // Skip the header row
        }

        console.log(`Processing coupon ${index}:`, couponElement);

        try {
          const couponData = this.extractCouponData(couponElement);
          if (couponData) {
            coupons.push(couponData);
          }
        } catch (error) {
          console.error(`Error extracting coupon ${index}:`, error);
        }
      });

    } catch (error) {
      console.error('Error scraping ColorMango coupons:', error);
    }

    return coupons;
  }

  extractCouponData(couponElement) {
    const config = this.config;
    const couponData = {
      promotionTitle: '',
      subtitle: '',
      couponCode: '',
      description: '',
      expiryDate: '',
      type: 'deal', // Default to 'deal', will be set to 'code' if coupon code found
      isExpired: false
    };

    try {
      // Check if coupon is expired
      const classAttr = couponElement.getAttribute('class') || '';
      couponData.isExpired = classAttr.includes('expired');

      // Extract coupon code using XPath @data-code attribute syntax
      // The data-code is at li[5]/div/a/div/@data-code
      const couponCode = this.findAttributeByXPath(
        config.selectors.couponData.couponCode.xpath,
        config.selectors.couponData.couponCode.fallbacks,
        couponElement
      );

      console.log('Extracted coupon code using @data-code XPath:', couponCode);

      if (couponCode && couponCode.trim()) {
        couponData.couponCode = couponCode.trim();
        couponData.type = 'code';
        console.log('Found coupon code:', couponData.couponCode);
      } else {
        console.log('No coupon code found in data-code attribute');
      }

      // Extract discount label (first li)
      const discountElement = this.findElementByXPathOrSelectors(
        config.selectors.couponData.discountLabel.xpath,
        config.selectors.couponData.discountLabel.fallbacks,
        couponElement
      );
      const discountLabel = discountElement ? this.extractText(discountElement) : '';

      // Extract promotion title (second li)
      const titleElement = this.findElementByXPathOrSelectors(
        config.selectors.couponData.promotionTitle.xpath,
        config.selectors.couponData.promotionTitle.fallbacks,
        couponElement
      );

      if (titleElement) {
        // Get the full text
        let fullTitleText = this.extractText(titleElement);

        // If coupon code exists in the title text, remove it for clean title
        if (couponData.couponCode && fullTitleText.includes(couponData.couponCode)) {
          couponData.promotionTitle = fullTitleText.replace(couponData.couponCode, '').trim();
        } else {
          couponData.promotionTitle = fullTitleText;
        }

        // Extract subtitle from promotion title
        couponData.subtitle = this.extractSubtitle(couponData.promotionTitle);

        // If we have a discount label, use it as subtitle if better
        if (discountLabel && discountLabel.length < 20) {
          couponData.subtitle = discountLabel.toLowerCase();
        }
      }

      // Extract action button and merchant URL
      const buttonElement = this.findElementByXPathOrSelectors(
        config.selectors.couponData.actionButton.xpath,
        config.selectors.couponData.actionButton.fallbacks,
        couponElement
      );

      if (buttonElement) {
        const href = buttonElement.getAttribute('href') || '';
        if (href) {
          // Extract the target URL from redirect
          const targetUrl = config.extractTargetUrl(href);
          if (targetUrl) {
            // Don't store individual merchantUrl in coupon, will be added from merchantInfo
            // Just keep it for reference/validation
          }
        }
      }

      // Note: Don't set description here, it will be generated in the main scrapeData() method

    } catch (error) {
      console.error('Error extracting coupon data:', error);
      return null;
    }

    // Only return if we have at least a title
    if (!couponData.promotionTitle || couponData.promotionTitle.trim() === '') {
      return null;
    }

    // Remove the isExpired flag and type before returning (internal use only)
    // Keep only the fields that match the expected JSON format
    return {
      promotionTitle: couponData.promotionTitle,
      subtitle: couponData.subtitle,
      couponCode: couponData.couponCode,
      description: couponData.description,
      expiryDate: couponData.expiryDate
    };
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ColorMangoScraper;
} else {
  window.ColorMangoScraper = ColorMangoScraper;
}
