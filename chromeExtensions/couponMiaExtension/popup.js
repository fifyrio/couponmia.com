class CouponMiaPopup {
  constructor() {
    console.log('[CouponMia Popup] Initializing popup');
    this.currentDomain = '';
    this.coupons = [];
    this.init();
  }

  async init() {
    console.log('[CouponMia Popup] Starting popup initialization');
    await this.getCurrentDomain();
    await this.searchCoupons();
    this.setupEventListeners();
    console.log('[CouponMia Popup] Popup initialization complete');
  }

  async getCurrentDomain() {
    console.log('[CouponMia Popup] Getting current domain');
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('[CouponMia Popup] Active tab:', tab);
      
      if (tab?.url) {
        const url = new URL(tab.url);
        this.currentDomain = url.hostname.replace('www.', '');
        console.log('[CouponMia Popup] Current domain:', this.currentDomain);
        console.log('[CouponMia Popup] Full URL:', tab.url);
      } else {
        console.log('[CouponMia Popup] No tab URL found');
      }
    } catch (error) {
      console.error('[CouponMia Popup] Error getting current domain:', error);
      this.currentDomain = 'unknown';
    }
  }

  async searchCoupons() {
    console.log('[CouponMia Popup] Getting store data from background for domain:', this.currentDomain);
    
    try {
      this.showLoading();
      
      // Get store data from background script (which has already fetched and cached it)
      const response = await chrome.runtime.sendMessage({
        type: 'get_store_data',
        domain: this.currentDomain
      });
      
      console.log('[CouponMia Popup] Background response:', response);
      
      if (!response || !response.storeData) {
        console.log('[CouponMia Popup] No store data found');
        this.showNoCoupons();
        return;
      }

      const storeData = response.storeData;
      console.log('[CouponMia Popup] Found store:', storeData.name);

      // Show store info
      this.showStoreInfo(storeData);

      // Use coupons from cached store data
      this.coupons = storeData.coupons || [];
      console.log('[CouponMia Popup] Found coupons from background cache:', this.coupons.length);

      if (this.coupons.length === 0) {
        console.log('[CouponMia Popup] No coupons available');
        this.showNoCoupons();
      } else {
        console.log('[CouponMia Popup] Displaying coupons');
        this.showCoupons();
      }

    } catch (error) {
      console.error('[CouponMia Popup] Error getting store data from background:', error);
      this.showNoCoupons();
    }
  }

  showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('couponsContainer').style.display = 'none';
    document.getElementById('noCoupons').style.display = 'none';
    document.getElementById('storeInfo').style.display = 'none';
  }

  showStoreInfo(store) {
    const storeInfo = document.getElementById('storeInfo');
    const storeName = document.getElementById('storeName');
    const storeDomain = document.getElementById('storeDomain');
    const storeLogo = document.getElementById('storeLogo');

    storeName.textContent = store.name;
    storeDomain.textContent = this.currentDomain;
    
    if (store.logo_url) {
      storeLogo.src = store.logo_url;
      storeLogo.style.display = 'block';
    } else {
      storeLogo.style.display = 'none';
    }

    storeInfo.style.display = 'block';
  }

  showCoupons() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('noCoupons').style.display = 'none';
    
    const container = document.getElementById('couponsContainer');
    container.innerHTML = '';
    
    // Sort coupons: popular first, then by discount value
    const sortedCoupons = this.coupons.sort((a, b) => {
      if (a.is_popular && !b.is_popular) return -1;
      if (!a.is_popular && b.is_popular) return 1;
      
      const aValue = this.extractDiscountValue(a.title);
      const bValue = this.extractDiscountValue(b.title);
      return bValue - aValue;
    });

    sortedCoupons.forEach(coupon => {
      const couponElement = this.createCouponElement(coupon);
      container.appendChild(couponElement);
    });

    container.style.display = 'block';
  }

  showNoCoupons() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('couponsContainer').style.display = 'none';
    document.getElementById('noCoupons').style.display = 'block';
  }

  createCouponElement(coupon) {
    const card = document.createElement('div');
    card.className = 'coupon-card';

    const discountValue = this.extractDiscountValue(coupon.title);
    const discountText = discountValue > 0 ? `${discountValue}% OFF` : 'DEAL';

    card.innerHTML = `
      <div class="coupon-header">
        <div class="coupon-title">
          ${coupon.title}
          ${coupon.is_popular ? '<span class="popular-badge">POPULAR</span>' : ''}
        </div>
        <div class="coupon-discount">${discountText}</div>
      </div>
      ${coupon.description ? `<div class="coupon-description">${coupon.description}</div>` : ''}
      <div class="coupon-footer">
        ${coupon.type === 'code' && coupon.code ? 
          `<div class="coupon-code" data-code="${coupon.code}" data-url="${coupon.url}">${coupon.code}</div>` :
          `<button class="deal-button" data-url="${coupon.url}">Get Deal</button>`
        }
      </div>
    `;

    return card;
  }

  extractDiscountValue(title) {
    const match = title.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  setupEventListeners() {
    // Handle coupon code clicks
    document.addEventListener('click', async (e) => {
      if (e.target.classList.contains('coupon-code')) {
        const code = e.target.dataset.code;
        await this.copyCouponCode(code, e.target);
      }
      
      if (e.target.classList.contains('deal-button')) {
        const url = e.target.dataset.url;
        await this.openDeal(url);
      }
    });
  }

  async copyCouponCode(code, element) {
    try {
      await navigator.clipboard.writeText(code);
      
      // Visual feedback
      element.classList.add('copied');
      element.textContent = 'COPIED!';
      
      // Show toast
      this.showToast(`Coupon code "${code}" copied to clipboard!`);
      
      // Reset after 2 seconds
      setTimeout(() => {
        element.classList.remove('copied');
        element.textContent = code;
      }, 2000);

      // Track the copy event
      this.trackEvent('coupon_copied', { code, domain: this.currentDomain });

      // Open the coupon URL in a new tab at the first position
      const url = element.dataset.url;
      if (url) {
        console.log('[CouponMia Popup] Opening coupon URL in new tab at first position:', url);
        await chrome.tabs.create({ 
          url: url,
          index: 0  // Insert at the first position
        });
      }
      
    } catch (error) {
      console.error('Failed to copy coupon code:', error);
      this.showToast('Failed to copy coupon code');
    }
  }

  async openDeal(url) {
    try {
      await chrome.tabs.create({ url });
      this.trackEvent('deal_clicked', { url, domain: this.currentDomain });
    } catch (error) {
      console.error('Failed to open deal:', error);
    }
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  trackEvent(eventName, data) {
    // Send tracking data to background script
    chrome.runtime.sendMessage({
      type: 'track_event',
      event: eventName,
      data: data
    });
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CouponMiaPopup();
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'domain_detected') {
    console.log('Domain detected:', message.domain);
  }
});