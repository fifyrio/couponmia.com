document.addEventListener('DOMContentLoaded', function() {
    const scrapeBtn = document.getElementById('scrapeBtn');
    const insertDbBtn = document.getElementById('insertDbBtn');
    const copyBtn = document.getElementById('copyBtn');
    const statusDiv = document.getElementById('status');
    const loadingDiv = document.getElementById('loading');
    const dbLoadingDiv = document.getElementById('dbLoading');
    const resultsDiv = document.getElementById('results');
    const jsonOutput = document.getElementById('jsonOutput');
    const metaInfo = document.getElementById('metaInfo');

    let currentScrapedData = null;

    // Load existing data on popup open
    loadStoredData();

    scrapeBtn.addEventListener('click', function() {
        scrapePage();
    });

    insertDbBtn.addEventListener('click', function() {
        insertToDatabase();
    });

    copyBtn.addEventListener('click', function() {
        copyToClipboard();
    });

    async function scrapePage() {
        try {
            // Check if we're on the right page
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Check if we're on any Worthepenny domain coupon or store page
            const isWorthepennyCouponPage = tab.url.includes('worthepenny.com/coupon/') || 
                                          tab.url.includes('worthepenny.com/store/');
            
            if (!isWorthepennyCouponPage) {
                showStatus('Please navigate to a Worthepenny coupon or store page first', 'error');
                return;
            }

            showLoading(true);
            showStatus('Scraping page...', 'info');

            // VigLink API key is now hardcoded in content script, no need to inject

            // Execute content script and get data
            const results = await chrome.tabs.sendMessage(tab.id, { action: 'scrapePage' });
            
            if (results.success) {
                displayResults(results.data, tab.url);
                showStatus(`Successfully scraped ${results.data.length} coupons`, 'success');
                currentScrapedData = results.data;
                insertDbBtn.style.display = 'block'; // Show insert button
            } else {
                showStatus('Failed to scrape data', 'error');
            }
        } catch (error) {
            console.error('Scraping error:', error);
            showStatus('Error: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    async function loadStoredData() {
        try {
            const result = await chrome.storage.local.get(['scrapedCoupons', 'lastScrapeUrl', 'lastScrapeTime']);
            
            if (result.scrapedCoupons && result.scrapedCoupons.length > 0) {
                displayResults(result.scrapedCoupons, result.lastScrapeUrl, result.lastScrapeTime);
                showStatus(`Loaded ${result.scrapedCoupons.length} coupons from last scrape`, 'success');
                currentScrapedData = result.scrapedCoupons;
                insertDbBtn.style.display = 'block'; // Show insert button
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
        }
    }

    function displayResults(data, url, timestamp) {
        const jsonString = JSON.stringify(data, null, 2);
        jsonOutput.textContent = jsonString;
        
        let metaText = `Found ${data.length} coupons`;
        if (url) {
            metaText += ` from ${new URL(url).pathname}`;
        }
        if (timestamp) {
            metaText += ` (${new Date(timestamp).toLocaleString()})`;
        }
        metaInfo.textContent = metaText;
        
        resultsDiv.style.display = 'block';
        
        // Store the current data
        chrome.storage.local.set({
            'scrapedCoupons': data,
            'lastScrapeUrl': url,
            'lastScrapeTime': timestamp || new Date().toISOString()
        });
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
    }

    function showLoading(show) {
        loadingDiv.style.display = show ? 'block' : 'none';
        scrapeBtn.disabled = show;
    }

    async function insertToDatabase() {
        if (!currentScrapedData || currentScrapedData.length === 0) {
            showStatus('No data to insert', 'error');
            return;
        }

        try {
            showDbLoading(true);
            showStatus('Inserting data to database...', 'info');

            // Get database configuration from storage or prompt user
            const dbConfig = await getDbConfig();
            if (!dbConfig) {
                showStatus('Database configuration required', 'error');
                showDbLoading(false);
                return;
            }

            const results = await insertDataToSupabase(currentScrapedData, dbConfig);
            
            if (results.success) {
                const message = `Successfully inserted ${results.inserted} new records to database${results.skipped ? ` (${results.skipped} duplicates skipped)` : ''}`;
                showStatus(message, 'success');
                
                // Update button text to show success
                const originalText = insertDbBtn.textContent;
                insertDbBtn.textContent = 'Inserted Successfully!';
                insertDbBtn.style.backgroundColor = '#10b981';
                
                setTimeout(() => {
                    insertDbBtn.textContent = originalText;
                    insertDbBtn.style.backgroundColor = '#10b981';
                }, 3000);
            } else {
                showStatus('Failed to insert to database: ' + results.error, 'error');
            }
        } catch (error) {
            console.error('Database insertion error:', error);
            showStatus('Error inserting to database: ' + error.message, 'error');
        } finally {
            showDbLoading(false);
        }
    }

    async function getDbConfig() {
        // Try to get stored config first
        const result = await chrome.storage.local.get(['dbConfig']);
        if (result.dbConfig) {
            return result.dbConfig;
        }

        // Prompt user for database configuration
        const supabaseUrl = prompt('Enter Supabase URL:');
        const supabaseKey = prompt('Enter Supabase Service Role Key:');
        
        if (!supabaseUrl || !supabaseKey) {
            return null;
        }

        const config = {
            url: supabaseUrl,
            key: supabaseKey
        };

        // Store for future use
        await chrome.storage.local.set({ dbConfig: config });
        return config;
    }

    // VigLink API key is now hardcoded in content script

    async function insertDataToSupabase(data, config) {
        try {
            const insertedStores = new Set();
            let totalInserted = 0;
            let totalSkipped = 0;

            // Group data by merchant to avoid duplicate stores
            const merchantGroups = {};
            data.forEach(item => {
                const key = item.merchantName + '|' + item.merchantDomain;
                if (!merchantGroups[key]) {
                    merchantGroups[key] = {
                        store: {
                            name: item.merchantName,
                            alias: generateAlias(item.merchantName),
                            logo_url: item.merchantLogo || '',
                            description: `Coupons and deals for ${item.merchantName}`,
                            website: item.merchantDomain || '', // Clean domain (e.g., 'monarchmoney.com')
                            url: item.url || '', // VigLink URL for affiliate tracking
                            domains_data: JSON.stringify([item.merchantDomain || '']), // JSON array format like ["novica.com"]
                            is_featured: true, // Set as featured store from Worthepenny
                            external_id: 'worthepenny_' + generateAlias(item.merchantName)
                        },
                        coupons: []
                    };
                }
                merchantGroups[key].coupons.push(item);
            });

            // Insert stores first
            for (const [key, group] of Object.entries(merchantGroups)) {
                // Check if store already exists
                const checkStoreResponse = await fetch(`${config.url}/rest/v1/stores?external_id=eq.${group.store.external_id}`, {
                    headers: {
                        'apikey': config.key,
                        'Authorization': `Bearer ${config.key}`,
                        'Content-Type': 'application/json'
                    }
                });

                let storeId;
                const existingStores = await checkStoreResponse.json();
                
                if (existingStores.length > 0) {
                    storeId = existingStores[0].id;
                    
                    // Update existing store to set is_featured = true and update fields
                    const updateStoreResponse = await fetch(`${config.url}/rest/v1/stores?id=eq.${storeId}`, {
                        method: 'PATCH',
                        headers: {
                            'apikey': config.key,
                            'Authorization': `Bearer ${config.key}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            is_featured: true,
                            logo_url: group.store.logo_url || existingStores[0].logo_url, // Update logo if available
                            url: group.store.url || existingStores[0].url, // Update VigLink URL
                            website: group.store.website || existingStores[0].website, // Update clean domain
                            domains_data: group.store.domains_data || existingStores[0].domains_data, // Update domains_data
                            updated_at: new Date().toISOString()
                        })
                    });
                    
                    if (!updateStoreResponse.ok) {
                        console.warn(`Failed to update store ${storeId} as featured: ${updateStoreResponse.statusText}`);
                    } else {
                        console.log(`Updated store ${storeId} as featured`);
                    }
                } else {
                    // Insert new store
                    const storeResponse = await fetch(`${config.url}/rest/v1/stores`, {
                        method: 'POST',
                        headers: {
                            'apikey': config.key,
                            'Authorization': `Bearer ${config.key}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify(group.store)
                    });

                    if (!storeResponse.ok) {
                        throw new Error(`Failed to insert store: ${storeResponse.statusText}`);
                    }

                    const newStore = await storeResponse.json();
                    storeId = newStore[0].id;
                    totalInserted++;
                }

                // Insert coupons for this store
                for (const coupon of group.coupons) {
                    // Check if coupon already exists (by code and store_id, or by title if no code)
                    let checkCouponQuery = `store_id=eq.${storeId}`;
                    
                    if (coupon.couponCode) {
                        // Check by coupon code if it exists
                        checkCouponQuery += `&code=eq.${encodeURIComponent(coupon.couponCode)}`;
                    } else {
                        // Check by title if no coupon code
                        checkCouponQuery += `&title=eq.${encodeURIComponent(coupon.promotionTitle)}`;
                    }
                    
                    const checkCouponResponse = await fetch(`${config.url}/rest/v1/coupons?${checkCouponQuery}`, {
                        headers: {
                            'apikey': config.key,
                            'Authorization': `Bearer ${config.key}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    const existingCoupons = await checkCouponResponse.json();
                    
                    if (existingCoupons.length > 0) {
                        console.log(`Coupon already exists: ${coupon.promotionTitle} (${coupon.couponCode || 'no code'})`);
                        totalSkipped++;
                        continue; // Skip this coupon
                    }

                    // Insert new coupon
                    const couponData = {
                        store_id: storeId,
                        title: coupon.promotionTitle,
                        subtitle: coupon.subtitle || 'other', // Map JSON subtitle to database subtitle field
                        code: coupon.couponCode || null,
                        type: coupon.couponCode ? 'code' : 'deal',
                        discount_value: coupon.subtitle || 'Special Offer', // Use subtitle as discount_value or fallback
                        description: coupon.description || `${coupon.promotionTitle} at ${coupon.merchantName}`, // Use description from JSON
                        url: coupon.url || '', // Use VigLink URL from JSON
                        external_id: 'worthepenny_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
                    };

                    const couponResponse = await fetch(`${config.url}/rest/v1/coupons`, {
                        method: 'POST',
                        headers: {
                            'apikey': config.key,
                            'Authorization': `Bearer ${config.key}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(couponData)
                    });

                    if (!couponResponse.ok) {
                        console.error('Failed to insert coupon:', await couponResponse.text());
                    } else {
                        console.log(`Successfully inserted coupon: ${coupon.promotionTitle}`);
                        totalInserted++;
                    }
                }
            }

            return { success: true, inserted: totalInserted, skipped: totalSkipped };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    function generateAlias(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    function showDbLoading(show) {
        dbLoadingDiv.style.display = show ? 'block' : 'none';
        insertDbBtn.disabled = show;
    }

    async function copyToClipboard() {
        try {
            const text = jsonOutput.textContent;
            await navigator.clipboard.writeText(text);
            
            // Show temporary success message
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.backgroundColor = '#10b981';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '#6b7280';
            }, 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            showStatus('Failed to copy to clipboard', 'error');
        }
    }

    // Check current tab URL and show appropriate message
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentTab = tabs[0];
        const isWorthepennyCouponPage = currentTab && (currentTab.url.includes('worthepenny.com/coupon/') || 
                                                     currentTab.url.includes('worthepenny.com/store/'));
        if (!isWorthepennyCouponPage) {
            showStatus('Navigate to a Worthepenny coupon or store page to start scraping', 'info');
        }
    });
});