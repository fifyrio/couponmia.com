class CouponMiaBackground {
  constructor() {
    console.log('[CouponMia Background] Initializing background script');
    this.setupEventListeners();
    this.couponCache = new Map();
    this.logActivity('Background script initialized');
  }

  setupEventListeners() {
    console.log('[CouponMia Background] Setting up event listeners');
    
    // Handle messages from content script and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('[CouponMia Background] Received message:', message.type, message);
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep the message channel open for async responses
    });

    // Handle extension icon click
    chrome.action.onClicked.addListener((tab) => {
      console.log('[CouponMia Background] Extension icon clicked for tab:', tab.url);
      this.handleIconClick(tab);
    });

    // Handle tab updates to check for coupons
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        console.log('[CouponMia Background] Tab updated:', tab.url);
        this.checkTabForCoupons(tab);
      }
    });

    // Handle tab activation
    chrome.tabs.onActivated.addListener((activeInfo) => {
      console.log('[CouponMia Background] Tab activated:', activeInfo.tabId);
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url) {
          console.log('[CouponMia Background] Active tab URL:', tab.url);
          this.checkTabForCoupons(tab);
        }
      });
    });
    
    console.log('[CouponMia Background] Event listeners setup complete');
  }

  async handleMessage(message, sender, sendResponse) {
    console.log('[CouponMia Background] Handling message:', message.type);
    
    switch (message.type) {
      case 'track_event':
        console.log('[CouponMia Background] Tracking event:', message.event, message.data);
        await this.trackEvent(message.event, message.data);
        sendResponse({ success: true });
        break;

      case 'get_coupons':
        console.log('[CouponMia Background] Getting coupons for domain:', message.domain);
        const coupons = await this.getCouponsForDomain(message.domain);
        console.log('[CouponMia Background] Found coupons:', coupons.length);
        sendResponse({ coupons });
        break;

      case 'get_store_data':
        console.log('[CouponMia Background] Getting store data for domain:', message.domain);
        const storeData = await this.getStoreDataForDomain(message.domain);
        console.log('[CouponMia Background] Found store data:', storeData ? storeData.name : 'none');
        sendResponse({ storeData });
        break;

      case 'open_coupon_url':
        console.log('[CouponMia Background] Opening coupon URL at first position:', message.url);
        await chrome.tabs.create({ 
          url: message.url,
          index: 0  // Insert at the first position
        });
        sendResponse({ success: true });
        break;

      case 'domain_detected':
        console.log('[CouponMia Background] Domain detected:', message.domain);
        await this.updateBadgeForDomain(message.domain, sender.tab);
        sendResponse({ success: true });
        break;

      default:
        console.log('[CouponMia Background] Unknown message type:', message.type);
        sendResponse({ error: 'Unknown message type' });
    }
  }

  async handleIconClick(tab) {
    // The popup will handle the interaction
    console.log('Extension icon clicked for tab:', tab.url);
  }

  async checkTabForCoupons(tab) {
    console.log('[CouponMia Background] Checking tab for coupons:', tab.url);
    
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      console.log('[CouponMia Background] Skipping system/extension URL:', tab.url);
      return;
    }

    try {
      const url = new URL(tab.url);
      const domain = url.hostname.replace('www.', '');
      console.log('[CouponMia Background] Extracted domain:', domain);
      
      // Don't check CouponMia's own domain
      if (domain.includes('couponmia.com')) {
        console.log('[CouponMia Background] Skipping CouponMia domain');
        return;
      }

      await this.updateBadgeForDomain(domain, tab);
    } catch (error) {
      console.error('[CouponMia Background] Error checking tab for coupons:', error);
    }
  }

  async updateBadgeForDomain(domain, tab) {
    console.log('[CouponMia Background] Updating badge for domain:', domain, 'tab:', tab.id);
    
    try {
      const coupons = await this.getCouponsForDomain(domain);
      console.log('[CouponMia Background] Got coupons for badge update:', coupons.length);
      
      if (coupons && coupons.length > 0) {
        console.log('[CouponMia Background] Setting badge text:', coupons.length.toString());
        
        // Show coupon count on badge
        chrome.action.setBadgeText({
          text: coupons.length.toString(),
          tabId: tab.id
        });
        
        chrome.action.setBadgeBackgroundColor({
          color: '#8b5cf6',
          tabId: tab.id
        });

        // Update title
        const title = `CouponMia - ${coupons.length} coupon${coupons.length === 1 ? '' : 's'} available`;
        console.log('[CouponMia Background] Setting title:', title);
        chrome.action.setTitle({
          title: title,
          tabId: tab.id
        });
      } else {
        console.log('[CouponMia Background] No coupons found, clearing badge');
        
        // Clear badge if no coupons
        chrome.action.setBadgeText({
          text: '',
          tabId: tab.id
        });

        chrome.action.setTitle({
          title: 'CouponMia - Smart Coupon Finder',
          tabId: tab.id
        });
      }
    } catch (error) {
      console.error('[CouponMia Background] Error updating badge:', error);
    }
  }

  async getStoreDataForDomain(domain) {
    console.log('[CouponMia Background] Getting store data for domain:', domain);
    
    // Check cache first
    if (this.couponCache.has(domain)) {
      const cached = this.couponCache.get(domain);
      console.log('[CouponMia Background] Found cached data for domain:', domain);
      
      // Cache for 10 minutes
      if (Date.now() - cached.timestamp < 10 * 60 * 1000) {
        console.log('[CouponMia Background] Using cached store data');
        return cached.storeData;
      } else {
        console.log('[CouponMia Background] Cache expired for domain:', domain);
      }
    }

    try {
      console.log('[CouponMia Background] Fetching store data for domain:', domain);
      
      // Search for store by domain - this now returns both store info and coupons
      const storeUrl = `https://www.couponmia.com//api/search/stores?domain=${encodeURIComponent(domain)}`;
      console.log('[CouponMia Background] Store API URL:', storeUrl);
      
      const storeResponse = await fetch(storeUrl);
      console.log('[CouponMia Background] Store response status:', storeResponse.status);
      
      if (!storeResponse.ok) {
        console.log('[CouponMia Background] Store not found, caching empty result');
        this.couponCache.set(domain, { storeData: null, timestamp: Date.now() });
        return null;
      }
      
      const storeData = await storeResponse.json();
      console.log('[CouponMia Background] Store data:', storeData);
      
      if (!storeData.store) {
        console.log('[CouponMia Background] No store in response, caching empty result');
        this.couponCache.set(domain, { storeData: null, timestamp: Date.now() });
        return null;
      }

      console.log('[CouponMia Background] Found store:', storeData.store.name, 'with', storeData.store.coupons?.length || 0, 'coupons');

      // Cache the complete store data (including coupons)
      this.couponCache.set(domain, { storeData: storeData.store, timestamp: Date.now() });
      
      return storeData.store;

    } catch (error) {
      console.error('[CouponMia Background] Error fetching store data for domain:', domain, error);
      return null;
    }
  }

  async getCouponsForDomain(domain) {
    const storeData = await this.getStoreDataForDomain(domain);
    return storeData?.coupons || [];
  }

  async trackEvent(eventName, data) {
    try {
      // Log to console for debugging
      console.log('Tracking event:', eventName, data);
      
      // In a real implementation, you might send this to an analytics service
      // For now, we'll just log it
      
      // Store in local storage for debugging
      chrome.storage.local.get(['analytics'], (result) => {
        const analytics = result.analytics || [];
        analytics.push({
          event: eventName,
          data: data,
          timestamp: Date.now()
        });
        
        // Keep only last 100 events
        if (analytics.length > 100) {
          analytics.splice(0, analytics.length - 100);
        }
        
        chrome.storage.local.set({ analytics });
      });
      
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Clean up old cache entries periodically
  cleanupCache() {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes
    
    for (const [domain, cached] of this.couponCache.entries()) {
      if (now - cached.timestamp > maxAge) {
        this.couponCache.delete(domain);
      }
    }
    console.log('[CouponMia Background] Cache cleanup complete, entries:', this.couponCache.size);
  }

  // Log activity for debugging
  logActivity(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[CouponMia Background] ${timestamp}: ${message}`, data);
    
    // Store activity log in chrome storage for debugging
    chrome.storage.local.get(['activityLog'], (result) => {
      const activityLog = result.activityLog || [];
      activityLog.push({
        timestamp,
        message,
        data
      });
      
      // Keep only last 50 entries
      if (activityLog.length > 50) {
        activityLog.splice(0, activityLog.length - 50);
      }
      
      chrome.storage.local.set({ activityLog });
    });
  }
}

// Initialize background script
const couponMiaBackground = new CouponMiaBackground();

// Clean up cache every 5 minutes
setInterval(() => {
  couponMiaBackground.cleanupCache();
}, 5 * 60 * 1000);