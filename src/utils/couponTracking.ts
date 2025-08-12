/**
 * Utility functions for coupon click tracking and referral code injection
 */

/**
 * Adds referral code to coupon URL for tracking purposes
 * @param originalUrl - The original coupon URL
 * @param referralCode - User's referral code (optional)
 * @returns Modified URL with referral tracking parameter
 */
export function addReferralTrackingToUrl(originalUrl: string, referralCode?: string): string {
  if (!referralCode || !originalUrl) {
    return originalUrl;
  }

  try {
    const url = new URL(originalUrl);
    
    // Add the referral code as a query parameter
    url.searchParams.set('id', referralCode);
    
    return url.toString();
  } catch (error) {
    // If URL parsing fails, return original URL
    console.warn('Failed to parse coupon URL for tracking:', error);
    return originalUrl;
  }
}

/**
 * Logs coupon click event for analytics (future implementation)
 * @param couponId - ID of the clicked coupon
 * @param userId - ID of the user (optional)
 * @param referralCode - User's referral code (optional)
 */
export function logCouponClick(couponId: string | number, userId?: string, referralCode?: string): void {
  // This can be extended in the future to log clicks to analytics or database
  if (process.env.NODE_ENV === 'development') {
    console.log('Coupon clicked:', {
      couponId,
      userId,
      referralCode,
      timestamp: new Date().toISOString()
    });
  }
}