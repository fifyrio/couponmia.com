interface StoreMoreInfoProps {
  storeName: string;
}

export default function StoreMoreInfo({ storeName }: StoreMoreInfoProps) {
  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-text-primary mb-4">More About {storeName} Promo Codes</h2>
      </div>

      <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-card-bg/50 border border-card-border rounded-xl p-6">
          <h3 className="font-semibold text-text-primary mb-3 text-lg">
            Summary
          </h3>
          <p className="text-text-secondary leading-relaxed">
            All active {storeName} coupons are verified and updated regularly to ensure maximum savings for our users.
          </p>
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