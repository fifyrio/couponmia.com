class CouponMiaContentScript {
  constructor() {
    console.log('[CouponMia Content] Initializing content script');
    this.currentDomain = '';
    this.coupons = [];
    this.widget = null;
    this.isWidgetVisible = false;
    this.init();
  }

  init() {
    console.log('[CouponMia Content] Starting initialization');
    this.detectDomain();
    this.checkForCoupons();
    this.setupObserver();
    console.log('[CouponMia Content] Initialization complete');
  }

  detectDomain() {
    this.currentDomain = window.location.hostname.replace('www.', '');
    console.log('[CouponMia Content] Detected domain:', this.currentDomain);
    console.log('[CouponMia Content] Full URL:', window.location.href);
    
    // Send domain to popup
    chrome.runtime.sendMessage({
      type: 'domain_detected',
      domain: this.currentDomain
    }, (response) => {
      console.log('[CouponMia Content] Domain detection response:', response);
    });
  }

  async checkForCoupons() {
    console.log('[CouponMia Content] Checking for coupons on domain:', this.currentDomain);
    
    try {
      // Don't run on CouponMia's own domain
      if (this.currentDomain.includes('couponmia.com')) {
        console.log('[CouponMia Content] Skipping CouponMia domain');
        return;
      }

      const apiUrl = `https://www.couponmia.com//api/search/stores?domain=${encodeURIComponent(this.currentDomain)}`;
      console.log('[CouponMia Content] API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('[CouponMia Content] API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[CouponMia Content] API response data:', data);
        
        if (data.store && data.store.coupons && data.store.coupons.length > 0) {
          console.log('[CouponMia Content] Found store with coupons:', data.store.name, 'coupons:', data.store.coupons.length);
          this.showCouponNotification(data.store);
        } else {
          console.log('[CouponMia Content] No store found or no active offers');
        }
      } else {
        console.log('[CouponMia Content] API response not OK:', response.status);
      }
    } catch (error) {
      console.log('[CouponMia Content] Error checking for coupons:', error);
    }
  }

  showCouponNotification(store) {
    // Don't show if widget is already visible
    if (this.isWidgetVisible) return;

    // Create floating notification
    const notification = document.createElement('div');
    notification.id = 'couponmia-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: linear-gradient(135deg, #1a0a2e 0%, #8b5cf6 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 300px;
        cursor: pointer;
        transform: translateX(320px);
        transition: transform 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.1);
      ">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 18px;">🎫</span>
          <strong style="font-size: 16px;">CouponMia</strong>
        </div>
        <div style="margin-bottom: 8px; line-height: 1.3;">
          <strong>${store.coupons.length} coupons</strong> available for <strong>${store.name}</strong>
        </div>
        <div style="font-size: 12px; opacity: 0.9;">
          Click to view and apply codes
        </div>
        <div style="
          position: absolute;
          top: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
        " onclick="event.stopPropagation(); this.parentElement.parentElement.remove();">
          ×
        </div>
      </div>
    `;

    document.body.appendChild(notification);
    this.isWidgetVisible = true;

    // Animate in
    setTimeout(() => {
      const widget = notification.firstElementChild;
      widget.style.transform = 'translateX(0)';
    }, 100);

    // Handle click to open extension popup
    notification.addEventListener('click', () => {
      this.openExtensionPopup();
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        const widget = notification.firstElementChild;
        widget.style.transform = 'translateX(320px)';
        setTimeout(() => {
          notification.remove();
          this.isWidgetVisible = false;
        }, 300);
      }
    }, 10000);

    // Track notification shown
    this.trackEvent('notification_shown', {
      domain: this.currentDomain,
      store: store.name,
      offers_count: store.coupons.length
    });
  }

  openExtensionPopup() {
    // Since we can't programmatically open the popup, we'll create a widget instead
    this.createInlineWidget();
  }

  createInlineWidget() {
    // Remove existing widget
    const existing = document.getElementById('couponmia-widget');
    if (existing) {
      existing.remove();
    }

    const widget = document.createElement('div');
    widget.id = 'couponmia-widget';
    widget.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        z-index: 10000;
        width: 350px;
        max-height: 500px;
        background: #0a0a0a;
        border: 1px solid #2d2d2d;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #f9fafb;
        overflow: hidden;
      ">
        <div style="
          background: linear-gradient(135deg, #1a0a2e 0%, #8b5cf6 100%);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div>
            <div style="font-size: 16px; font-weight: 700; color: white;">CouponMia</div>
            <div style="font-size: 12px; color: #d1d5db; opacity: 0.9;">Available Coupons</div>
          </div>
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            color: white;
          " onclick="document.getElementById('couponmia-widget').remove();">
            ×
          </div>
        </div>
        <div style="
          padding: 20px;
          max-height: 400px;
          overflow-y: auto;
        ">
          <div style="text-align: center; color: #9ca3af;">
            <div style="
              width: 32px;
              height: 32px;
              border: 3px solid #2d2d2d;
              border-top: 3px solid #8b5cf6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            "></div>
            Loading coupons...
          </div>
        </div>
        <div style="
          padding: 16px 20px;
          border-top: 1px solid #2d2d2d;
          background: #1f1f1f;
          text-align: center;
        ">
          <a href="https://couponmia.com" target="_blank" style="
            color: #8b5cf6;
            text-decoration: none;
            font-size: 12px;
          ">Visit CouponMia.com for more deals</a>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    document.body.appendChild(widget);

    // Load actual coupons
    this.loadWidgetCoupons();
  }

  async loadWidgetCoupons() {
    try {
      const response = await fetch(`https://www.couponmia.com//api/search/stores?domain=${encodeURIComponent(this.currentDomain)}`);
      
      if (!response.ok) {
        throw new Error('Store not found');
      }
      
      const storeData = await response.json();
      
      if (!storeData.store) {
        this.showWidgetError('No coupons found for this site');
        return;
      }

      // Use coupons from the store data (already included in API response)
      const coupons = storeData.store.coupons || [];
      this.displayWidgetCoupons(coupons, storeData.store);

    } catch (error) {
      console.error('Error loading widget coupons:', error);
      this.showWidgetError('Failed to load coupons');
    }
  }

  displayWidgetCoupons(coupons, store) {
    const widget = document.getElementById('couponmia-widget');
    if (!widget) return;

    const content = widget.querySelector('div:nth-child(1) > div:nth-child(2)');
    
    if (coupons.length === 0) {
      content.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #9ca3af;">
          <div style="font-size: 32px; margin-bottom: 12px;">🎫</div>
          <div>No active coupons found</div>
          <div style="font-size: 12px; margin-top: 8px; color: #6b7280;">
            Check back later for new deals
          </div>
        </div>
      `;
      return;
    }

    // Sort and limit coupons (API already filters to only code-type coupons)
    const sortedCoupons = coupons
      .sort((a, b) => {
        if (a.is_popular && !b.is_popular) return -1;
        if (!a.is_popular && b.is_popular) return 1;
        return 0;
      })
      .slice(0, 5); // Show max 5 coupons

    content.innerHTML = sortedCoupons.map(coupon => {
      const discountValue = this.extractDiscountValue(coupon.title);
      const discountText = discountValue > 0 ? `${discountValue}% OFF` : 'DEAL';

      return `
        <div style="
          background: #1f1f1f;
          border: 1px solid #2d2d2d;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 8px;
          transition: all 0.2s ease;
        " onmouseover="this.style.borderColor='#8b5cf6'; this.style.background='#1e1b3a';" 
           onmouseout="this.style.borderColor='#2d2d2d'; this.style.background='#1f1f1f';">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="flex: 1; font-size: 13px; font-weight: 600; color: #f9fafb; line-height: 1.3;">
              ${coupon.title}
              ${coupon.is_popular ? '<span style="background: #ef4444; color: white; padding: 2px 4px; border-radius: 3px; font-size: 9px; margin-left: 4px;">HOT</span>' : ''}
            </div>
            <div style="background: linear-gradient(135deg, #8b5cf6, #a78bfa); color: white; padding: 3px 6px; border-radius: 3px; font-size: 10px; font-weight: 600; margin-left: 8px;">
              ${discountText}
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="
              background: #2d2d2d;
              border: 1px dashed #8b5cf6;
              color: #8b5cf6;
              padding: 4px 8px;
              border-radius: 3px;
              font-family: monospace;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
            " onclick="this.style.background='#8b5cf6'; this.style.color='white'; navigator.clipboard.writeText('${coupon.code}'); this.textContent='COPIED!'; chrome.runtime.sendMessage({type: 'open_coupon_url', url: '${coupon.url}'}); setTimeout(() => { this.style.background='#2d2d2d'; this.style.color='#8b5cf6'; this.textContent='${coupon.code}'; }, 2000);">
              ${coupon.code}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  showWidgetError(message) {
    const widget = document.getElementById('couponmia-widget');
    if (!widget) return;

    const content = widget.querySelector('div:nth-child(1) > div:nth-child(2)');
    content.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #9ca3af;">
        <div style="font-size: 32px; margin-bottom: 12px;">😔</div>
        <div>${message}</div>
      </div>
    `;
  }

  extractDiscountValue(title) {
    const match = title.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  setupObserver() {
    // Observe DOM changes to detect when user navigates to checkout/cart pages
    const observer = new MutationObserver(() => {
      this.detectCheckoutPage();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  detectCheckoutPage() {
    const url = window.location.href.toLowerCase();
    const isCheckout = url.includes('checkout') || 
                      url.includes('cart') || 
                      url.includes('basket') ||
                      url.includes('payment');

    if (isCheckout && !this.isWidgetVisible) {
      // Show more prominent notification on checkout pages
      this.showCheckoutReminder();
    }
  }

  showCheckoutReminder() {
    const reminder = document.createElement('div');
    reminder.id = 'couponmia-checkout-reminder';
    reminder.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        background: linear-gradient(135deg, #1a0a2e 0%, #8b5cf6 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        text-align: center;
        max-width: 400px;
        cursor: pointer;
        animation: bounce 0.5s ease;
      ">
        <div style="font-size: 18px; margin-bottom: 4px;">💰 Wait! Don't forget to save!</div>
        <div style="font-size: 14px; margin-bottom: 8px;">CouponMia found coupons for this store</div>
        <div style="font-size: 12px; opacity: 0.9;">Click here to apply coupon codes before checkout</div>
      </div>
      <style>
        @keyframes bounce {
          0%, 20%, 60%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-10px); }
          80% { transform: translateX(-50%) translateY(-5px); }
        }
      </style>
    `;

    document.body.appendChild(reminder);

    reminder.addEventListener('click', () => {
      this.createInlineWidget();
      reminder.remove();
    });

    // Auto-hide after 8 seconds
    setTimeout(() => {
      if (reminder.parentElement) {
        reminder.remove();
      }
    }, 8000);
  }

  trackEvent(eventName, data) {
    chrome.runtime.sendMessage({
      type: 'track_event',
      event: eventName,
      data: data
    });
  }
}

// Initialize content script
const couponMiaContentScript = new CouponMiaContentScript();