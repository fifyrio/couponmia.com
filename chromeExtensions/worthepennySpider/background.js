// Background script for Worthepenny Spider Chrome Extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('Worthepenny Spider extension installed');
});

// VigLink API key is now hardcoded in content script

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'couponDataScraped') {
        console.log('Coupon data received from content script:', request.data);
        
        // Store the scraped data
        chrome.storage.local.set({
            'scrapedCoupons': request.data,
            'lastScrapeUrl': request.url,
            'lastScrapeTime': new Date().toISOString(),
            'scrapeError': request.error || null
        });
        
        // Send notification if extension icon should update
        if (request.data && request.data.length > 0) {
            chrome.action.setBadgeText({
                text: request.data.length.toString(),
                tabId: sender.tab.id
            });
            chrome.action.setBadgeBackgroundColor({
                color: '#8B5CF6',
                tabId: sender.tab.id
            });
        }
        
        sendResponse({ success: true });
    }
});

// Clear badge when tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.action.setBadgeText({
        text: '',
        tabId: activeInfo.tabId
    });
});

// Clear badge when tab is updated (navigated to different URL)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if it's a Worthepenny page (any subdomain)
        const isWorthepenny = tab.url.includes('worthepenny.com/coupon/') || 
                             tab.url.includes('worthepenny.com/store/');
        
        if (!isWorthepenny) {
            // Clear badge if not on Worthepenny page
            chrome.action.setBadgeText({
                text: '',
                tabId: tabId
            });
        }
    }
});

// Export function to download JSON data
function downloadJSON(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
        url: url,
        filename: filename || 'worthepenny-coupons.json',
        saveAs: true
    });
}

// Listen for download requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'downloadJSON') {
        downloadJSON(request.data, request.filename);
        sendResponse({ success: true });
    }
});