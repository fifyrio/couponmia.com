interface Store {
  name: string;
  website: string;
  established: string;
  headquarters: string;
  categories: string[];
  description: string;
}

interface StoreInfoProps {
  store: Store;
}

export default function StoreInfo({ store }: StoreInfoProps) {
  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 mb-8">
      <h3 className="text-2xl font-bold text-text-primary mb-8 flex items-center">
        
        About {store.name}
      </h3>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Store Details */}
        <div className="space-y-6">
          <div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-card-border">
                <span className="text-text-secondary">Website:</span>
                <a 
                  href={`https://${store.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-light hover:text-brand-accent transition-colors font-medium"
                >
                  {store.website}
                </a>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-card-border">
                <span className="text-text-secondary">Established:</span>
                <span className="text-text-primary font-medium">{store.established}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-card-border">
                <span className="text-text-secondary">Headquarters:</span>
                <span className="text-text-primary font-medium">{store.headquarters}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              {store.categories.map((category, index) => (
                <span
                  key={index}
                  className="bg-brand-lightest text-brand-light px-3 py-2 rounded-lg text-sm font-medium border border-brand-light/20"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Store Description & Tips */}
        <div className="space-y-6">
          <div>
            <p className="text-text-secondary leading-relaxed">
              {store.description}
            </p>
          </div>

          <div className="bg-card-bg/50 border border-card-border rounded-lg p-6">
            <h4 className="font-semibold text-text-primary mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Money-Saving Tips
            </h4>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• Sign up for newsletters to get exclusive discount codes</li>
              <li>• Follow {store.name} on social media for flash sales</li>
              <li>• Check for seasonal sales and holiday promotions</li>
              <li>• Use cashback apps in combination with coupon codes</li>
              <li>• Compare prices before making a purchase</li>
            </ul>
          </div>

          <div className="bg-brand-light/10 border border-brand-light/20 rounded-lg p-6">
            <h4 className="font-semibold text-brand-light mb-3 flex items-center">
              <span className="mr-2">✅</span>
              How to Use Coupons
            </h4>
            <ol className="text-sm text-text-secondary space-y-2">
              <li>1. Copy the coupon code from CouponMia</li>
              <li>2. Click &quot;Visit Store&quot; to go to {store.name}</li>
              <li>3. Add items to your cart and proceed to checkout</li>
              <li>4. Paste the code in the promo code field</li>
              <li>5. Apply the code and enjoy your savings!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}