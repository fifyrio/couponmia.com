// Content script to scrape coupon data from Worthepenny
(function() {
  'use strict';

  // Function to extract target URL from Worthepenny redirect URL
  function extractTargetUrl(url) {
    if (!url) return '';
    
    try {
      // Look for target= parameter in the URL
      const targetMatch = url.match(/[?&]target=([^&]+)/);
      if (targetMatch && targetMatch[1]) {
        // Decode the URL-encoded target parameter
        return decodeURIComponent(targetMatch[1]);
      }
    } catch (error) {
      console.error('Error extracting target URL:', error);
    }
    
    return url; // Return original URL if no target parameter found
  }

  // Function to extract subtitle (discount info) from promotion title
  function extractSubtitle(promotionTitle) {
    if (!promotionTitle) return 'other';
    
    try {
      // Pattern 1: Percentage discounts (60% off, 20% OFF, etc.)
      let match = promotionTitle.match(/(\d+%\s*(?:off|OFF|Off))/i);
      if (match && match[1]) {
        return match[1].toLowerCase();
      }
      
      // Pattern 2: Dollar amounts ($60 off, $10 OFF, etc.)
      match = promotionTitle.match(/(\$\d+(?:\.\d+)?\s*(?:off|OFF|Off))/i);
      if (match && match[1]) {
        return match[1].toLowerCase();
      }
      
      // Pattern 3: Currency amounts (£20 off, €15 off, etc.)
      match = promotionTitle.match(/([£€¥]\d+(?:\.\d+)?\s*(?:off|OFF|Off))/i);
      if (match && match[1]) {
        return match[1].toLowerCase();
      }
      
      // Pattern 4: "Up to X% off" or "Save X%"
      match = promotionTitle.match(/(?:up\s*to\s*|save\s*)(\d+%)/i);
      if (match && match[1]) {
        return match[1] + ' off';
      }
      
      // Pattern 5: "Save $X" or "Save up to $X"
      match = promotionTitle.match(/save(?:\s*up\s*to)?\s*(\$\d+(?:\.\d+)?)/i);
      if (match && match[1]) {
        return match[1] + ' off';
      }
      
      // Pattern 6: Free shipping, BOGO, etc.
      if (promotionTitle.match(/free\s*shipping/i)) {
        return 'free shipping';
      }
      
      if (promotionTitle.match(/buy\s*(?:one|1)\s*get\s*(?:one|1)|bogo/i)) {
        return 'bogo';
      }
      
      if (promotionTitle.match(/free\s*(?:delivery|returns?)/i)) {
        return 'free delivery';
      }
      
    } catch (error) {
      console.error('Error extracting subtitle:', error);
    }
    
    return 'other';
  }

  // Function to extract merchant name from title format
  function extractMerchantName(titleText) {
    if (!titleText) return '';
    
    try {
      // Pattern 1: "X% Off [Merchant Name] Promo Codes & Discounts"
      let match = titleText.match(/^\d+%?\s*Off\s+(.+?)\s+(?:Promo Codes?|Discount Codes?|Coupons?|Discounts?)(?:\s*&\s*(?:Discounts?|Coupons?))?/i);
      if (match && match[1]) {
        return match[1].trim();
      }
      
      // Pattern 2: "[Merchant Name] Promo Codes & Discounts"
      match = titleText.match(/^(.+?)\s+(?:Promo Codes?|Discount Codes?|Coupons?|Discounts?)(?:\s*&\s*(?:Discounts?|Coupons?))?/i);
      if (match && match[1]) {
        return match[1].trim();
      }
      
      // Pattern 3: "[Merchant Name] Coupons"
      match = titleText.match(/^(.+?)\s+Coupons?/i);
      if (match && match[1]) {
        return match[1].trim();
      }
      
      // Pattern 4: "Save with [Merchant Name]"
      match = titleText.match(/^Save\s+with\s+(.+)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
      
    } catch (error) {
      console.error('Error extracting merchant name:', error);
    }
    
    return titleText.trim(); // Return original if no pattern matches
  }

  // Function to scrape merchant logo
  function scrapeMerchantLogo() {
    let logoUrl = '';
    
    // Try multiple selectors for logo
    const logoSelectors = [
      '#brand_router img',
      '.merchant-logo img',
      '.brand-logo img',
      '.store-logo img',
      '.logo img',
      'img[alt*="logo"]',
      'img[class*="logo"]',
      'img[src*="logo"]'
    ];
    
    for (const selector of logoSelectors) {
      const logoElement = document.querySelector(selector);
      if (logoElement) {
        logoUrl = logoElement.src || logoElement.getAttribute('data-src') || '';
        if (logoUrl && logoUrl !== '' && !logoUrl.includes('placeholder')) {
          break;
        }
      }
    }
    
    // If no logo found in specific selectors, try to find any image near brand info
    if (!logoUrl) {
      const brandRouter = document.getElementById('brand_router');
      if (brandRouter) {
        const images = brandRouter.querySelectorAll('img');
        for (const img of images) {
          const src = img.src || img.getAttribute('data-src') || '';
          if (src && !src.includes('placeholder') && !src.includes('icon')) {
            logoUrl = src;
            break;
          }
        }
      }
    }
    
    return logoUrl;
  }

  function scrapeCouponData() {
    const results = [];
    
    try {
      // Get all coupon containers
      const couponList = document.getElementById('coupon_list');
      if (!couponList) {
        console.log('Coupon list not found');
        return results;
      }

      // Get brand/merchant information
      const brandRouter = document.getElementById('brand_router');
      let merchantName = '';
      let merchantDomain = '';
      let merchantLogo = '';
      
      if (brandRouter) {
        const brandLink = brandRouter.querySelector('div a');
        if (brandLink) {
          const rawDomain = brandLink.getAttribute('href') || '';
          merchantDomain = extractTargetUrl(rawDomain); // Extract target URL
          merchantName = brandLink.textContent?.trim() || '';
        }
      }

      // Scrape merchant logo
      merchantLogo = scrapeMerchantLogo();

      // If no merchant name from brand_router, try to get from page title or other elements
      if (!merchantName) {
        const titleElement = document.querySelector('h1, .merchant-name, .brand-name, title');
        if (titleElement) {
          merchantName = titleElement.textContent?.trim() || '';
        }
      }

      // Extract clean merchant name from title format
      if (merchantName) {
        merchantName = extractMerchantName(merchantName);
      }

      // If still no merchant name, try document title
      if (!merchantName && document.title) {
        merchantName = extractMerchantName(document.title);
      }

      // Get all coupon divs with data-code attribute
      const couponDivs = couponList.querySelectorAll('div[data-code]');
      
      couponDivs.forEach((couponDiv, index) => {
        const couponCode = couponDiv.getAttribute('data-code') || '';
        
        // Find promotion title from specific selector: @class="_hidden_4 worthepennycom"/@data-bf-ctt
        let promotionTitle = '';
        
        // First, try to find the specific element with class "_hidden_4 worthepennycom"
        const specificTitleElement = couponDiv.querySelector('._hidden_4.worthepennycom[data-bf-ctt]');
        if (specificTitleElement) {
          promotionTitle = specificTitleElement.getAttribute('data-bf-ctt') || '';
          // Trim newlines from beginning and end of the string
          promotionTitle = promotionTitle.replace(/^\n+|\n+$/g, '').trim();
        }
        
        // If not found in coupon div, search in the entire document or parent containers
        if (!promotionTitle) {
          const parentContainer = couponDiv.closest('.coupon-container, .offer-container, .deal-container, .coupon-item, .offer-item') || document;
          const globalTitleElement = parentContainer.querySelector('._hidden_4.worthepennycom[data-bf-ctt]');
          if (globalTitleElement) {
            promotionTitle = globalTitleElement.getAttribute('data-bf-ctt') || '';
            // Trim newlines from beginning and end of the string
            promotionTitle = promotionTitle.replace(/^\n+|\n+$/g, '').trim();
          }
        }
        
        // Fallback: look for elements with just one of the classes
        if (!promotionTitle) {
          const fallbackSelectors = [
            '._hidden_4[data-bf-ctt]',
            '.worthepennycom[data-bf-ctt]',
            '[data-bf-ctt]'
          ];
          
          for (const selector of fallbackSelectors) {
            const element = couponDiv.querySelector(selector) || document.querySelector(selector);
            if (element) {
              promotionTitle = element.getAttribute('data-bf-ctt') || '';
              // Trim newlines from beginning and end of the string
              promotionTitle = promotionTitle.replace(/^\n+|\n+$/g, '').trim();
              if (promotionTitle && promotionTitle.length > 3) break;
            }
          }
        }
        
        // Additional fallback: try original selectors if specific one not found
        if (!promotionTitle) {
          const titleSelectors = [
            '.coupon-title',
            '.offer-title', 
            '.deal-title',
            '.promo-title',
            '.discount-title',
            'h3',
            'h4',
            'h2',
            '.title',
            '[data-title]'
          ];
          
          for (const selector of titleSelectors) {
            const titleElement = couponDiv.querySelector(selector);
            if (titleElement) {
              promotionTitle = titleElement.textContent?.trim() || '';
              if (promotionTitle && promotionTitle.length > 3) break;
            }
          }
        }

        // Create coupon object with better fallback title
        let finalTitle = promotionTitle;
        if (!finalTitle) {
          if (couponCode) {
            finalTitle = `${merchantName} Coupon Code: ${couponCode}`;
          } else {
            finalTitle = `${merchantName} Special Offer`;
          }
        }
        
        const couponData = {
          promotionTitle: finalTitle,
          subtitle: extractSubtitle(finalTitle),
          couponCode: couponCode,
          merchantName: merchantName,
          merchantDomain: merchantDomain,
          merchantLogo: merchantLogo
        };
        
        results.push(couponData);
      });
      
    } catch (error) {
      console.error('Error scraping coupon data:', error);
    }
    
    return results;
  }

  // Wait for page to fully load
  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error('Element not found within timeout'));
      }, timeout);
    });
  }

  // Main execution
  async function main() {
    try {
      // Wait for coupon list to load
      await waitForElement('#coupon_list');
      
      // Add a small delay to ensure all content is loaded
      setTimeout(() => {
        const scrapedData = scrapeCouponData();
        
        // Send data to background script
        chrome.runtime.sendMessage({
          action: 'couponDataScraped',
          data: scrapedData,
          url: window.location.href
        });
        
        // Store data in local storage for popup access
        chrome.storage.local.set({
          'scrapedCoupons': scrapedData,
          'lastScrapeUrl': window.location.href,
          'lastScrapeTime': new Date().toISOString()
        });
        
        console.log('Scraped coupon data:', scrapedData);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to wait for coupon list:', error);
      // Try to scrape anyway
      const scrapedData = scrapeCouponData();
      chrome.runtime.sendMessage({
        action: 'couponDataScraped',
        data: scrapedData,
        url: window.location.href,
        error: error.message
      });
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrapePage') {
      const data = scrapeCouponData();
      sendResponse({ success: true, data: data });
    }
  });

})();