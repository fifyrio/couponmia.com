// Multi-site content script using modular scraper architecture
(function() {
  'use strict';

  // Load site configurations and scrapers
  // Note: In real Chrome extension, these would be loaded via import or separate script tags

  // Factory function to create appropriate scraper
  function createScraper(url) {
    const siteInfo = detectSite(url);
    
    if (!siteInfo) {
      throw new Error('Unsupported site: ' + url);
    }
    
    console.log(`Detected site: ${siteInfo.config.name}`);
    
    switch (siteInfo.siteKey) {
      case 'worthepenny':
        return new WorthepennyScraper();
      case 'grabon':
        return new GrabonScraper();
      default:
        throw new Error('No scraper available for: ' + siteInfo.siteKey);
    }
  }

  // Main scraping function
  function scrapeCouponData() {
    try {
      const scraper = createScraper(window.location.href);
      const results = scraper.scrapeData();
      
      // Add VigLink URLs to results
      const processedResults = results.map(item => ({
        ...item,
        url: scraper.generateVigLinkUrl(item.merchantUrl)
      }));
      
      console.log('Scraped data:', processedResults);
      return processedResults;
      
    } catch (error) {
      console.error('Error in scrapeCouponData:', error);
      return [];
    }
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
      // Detect site and get appropriate container selector
      const siteInfo = detectSite(window.location.href);
      if (!siteInfo) {
        console.log('Unsupported site, skipping scraping');
        return;
      }
      
      const containerSelector = siteInfo.config.selectors.couponContainer;
      
      // Wait for content to load
      await waitForElement(containerSelector);
      
      // Add a small delay to ensure all content is loaded
      setTimeout(() => {
        const scrapedData = scrapeCouponData();
        
        // Send data to background script
        chrome.runtime.sendMessage({
          action: 'couponDataScraped',
          data: scrapedData,
          url: window.location.href,
          site: siteInfo.config.name
        });
        
        // Store data in local storage for popup access
        chrome.storage.local.set({
          'scrapedCoupons': scrapedData,
          'lastScrapeUrl': window.location.href,
          'lastScrapeTime': new Date().toISOString(),
          'scrapeSite': siteInfo.config.name
        });
        
        console.log(`Scraped ${scrapedData.length} coupons from ${siteInfo.config.name}`);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to wait for content:', error);
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