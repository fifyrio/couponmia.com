interface Store {
  name: string;
  logo_url: string | null;
  description: string;
  rating: number;
  reviewCount: number;
  activeOffers: number;
  categories: string[];
  website: string;
}

interface StoreHeroProps {
  store: Store;
}

export default function StoreHero({ store }: StoreHeroProps) {
  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 mb-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
        {/* Store Logo */}
        <div className="flex-shrink-0">
          {store.logo_url ? (
            <img
              src={store.logo_url}
              alt={`${store.name} logo`}
              className="w-24 h-24 rounded-2xl shadow-lg object-contain bg-white border border-card-border"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-24 h-24 bg-gradient-to-br from-brand-light to-brand-accent rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg ${store.logo_url ? 'hidden' : ''}`}>
            {store.name.charAt(0)}
          </div>
        </div>

        {/* Store Info */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2 sm:mb-0">
              {store.name} Discount Codes
            </h1>
            <button className="bg-gradient-to-r from-brand-light to-brand-accent text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-200 shadow-lg">
              Visit Store →
            </button>
          </div>

          <p className="text-text-secondary leading-relaxed mb-6">
            {store.description}
          </p>

          {/* Store Stats */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i < Math.floor(store.rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="text-text-primary font-medium">{store.rating}</span>
              <span className="text-text-secondary">({store.reviewCount.toLocaleString()} reviews)</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {store.activeOffers} Active Offers
              </span>
            </div>

            <div className="flex items-center space-x-2">
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
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {store.categories.map((category, index) => (
              <span
                key={index}
                className="bg-brand-lightest text-brand-light px-3 py-1 rounded-full text-sm font-medium border border-brand-light/20"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}