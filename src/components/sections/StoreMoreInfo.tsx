interface DiscountAnalysis {
  total_offers: number;
  parsed_discounts: number;
  min_percent: number | null;
  max_percent: number | null;
  avg_percent: number | null;
  min_amount: number | null;
  max_amount: number | null;
  discount_types: string[];
  best_offer: string;
  analyzed_at: string;
}

interface StoreMoreInfoProps {
  storeName: string;
  discountAnalysis?: DiscountAnalysis | null;
}

export default function StoreMoreInfo({ storeName, discountAnalysis }: StoreMoreInfoProps) {
  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-text-primary mb-4">More About {storeName} Promo Codes</h2>
      </div>

      <div className="space-y-6">
        {/* Summary Card with Discount Analysis */}
        <div className="bg-card-bg/50 border border-card-border rounded-xl p-6">
          <h3 className="font-semibold text-text-primary mb-4 text-lg">
            📊 Summary
          </h3>
          <p className="text-text-secondary leading-relaxed mb-6">
            All active {storeName} coupons are verified and updated regularly to ensure maximum savings for our users.
          </p>

          {discountAnalysis ? (
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-600 mb-1">
                    {discountAnalysis.total_offers}
                  </div>
                  <div className="text-xs text-green-700 font-medium">Active Offers</div>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-600 mb-1">
                    {discountAnalysis.avg_percent || 0}%
                  </div>
                  <div className="text-xs text-blue-700 font-medium">Avg Discount</div>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-purple-600 mb-1">
                    {discountAnalysis.discount_types.length}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">Offer Types</div>
                </div>
              </div>

              {/* Detailed Analysis Table */}
              <div className="bg-card-bg/30 border border-card-border/50 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-3 text-sm">Detailed Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-card-border/30">
                    <span className="text-text-secondary">Best Available Offer:</span>
                    <span className="font-semibold text-brand-light text-right">
                      {(() => {
                        const offer = discountAnalysis.best_offer;
                        
                        return typeof offer === 'string' ? offer : String(offer);
                      })()}
                    </span>
                  </div>
                  
                  {(discountAnalysis.min_percent !== null && discountAnalysis.max_percent !== null && (discountAnalysis.min_percent > 0 || discountAnalysis.max_percent > 0)) && (
                    <div className="flex justify-between items-center py-2 border-b border-card-border/30">
                      <span className="text-text-secondary">Percentage Range:</span>
                      <span className="font-semibold text-text-primary text-right">
                        {discountAnalysis.min_percent}% - {discountAnalysis.max_percent}%
                      </span>
                    </div>
                  )}
                  
                  {(discountAnalysis.min_amount !== null && discountAnalysis.max_amount !== null && (discountAnalysis.min_amount > 0 || discountAnalysis.max_amount > 0)) && (
                    <div className="flex justify-between items-center py-2 border-b border-card-border/30">
                      <span className="text-text-secondary">Dollar Range:</span>
                      <span className="font-semibold text-text-primary text-right">
                        ${discountAnalysis.min_amount} - ${discountAnalysis.max_amount}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Last Updated:</span>
                    <span className="font-semibold text-text-primary text-right">
                      {(() => {
                        try {
                          return new Date(discountAnalysis.analyzed_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          });
                        } catch {
                          return 'Recently';
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-brand-light/5 border border-brand-light/20 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-sm text-text-secondary">
                Discount analysis data is being generated for {storeName}
              </div>
            </div>
          )}
        </div>

        {/* Free Delivery Card */}
        <div className="bg-brand-light/10 border border-brand-light/20 rounded-xl p-6">
          <h3 className="font-semibold text-brand-light mb-3 text-lg">
            {storeName} Free Delivery Offers
          </h3>
          <p className="text-text-secondary leading-relaxed">
            Get free shipping on your {storeName} orders with qualifying purchases and special promotion codes.
          </p>
        </div>

        {/* Newsletter Card */}
        <div className="bg-card-bg/50 border border-card-border rounded-xl p-6">
          <h3 className="font-semibold text-text-primary mb-3 text-lg">
            {storeName} Newsletter Sign-Up Deals
          </h3>
          <p className="text-text-secondary leading-relaxed">
            Subscribe to {storeName} newsletter to receive exclusive coupon codes and early access to sales.
          </p>
        </div>

        {/* Disclosure Card */}
        <div className="bg-brand-light/10 border border-brand-light/20 rounded-xl p-6">
          <h3 className="font-semibold text-brand-light mb-3 text-lg">
            Disclosure
          </h3>
          <p className="text-text-secondary leading-relaxed">
            CouponMia may earn a commission when you use our {storeName} coupon codes to make a purchase.
          </p>
        </div>
      </div>
    </div>
  );
}