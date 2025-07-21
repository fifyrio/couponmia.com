import Link from 'next/link';

interface SimilarStore {
  name: string;
  logo: string;
  offers: number;
}

interface SimilarStoresProps {
  stores: SimilarStore[];
  currentStore: string;
}

export default function SimilarStores({ stores, currentStore }: SimilarStoresProps) {
  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 mb-8">
      <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
        Similar Stores of {currentStore}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stores.map((store, index) => (
          <Link
            key={index}
            href={`/store/${store.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
            className="group"
          >
            <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl border border-card-border p-4 text-center hover:shadow-md hover:border-brand-light/50 transition-all duration-200 group-hover:scale-105">
              {/* Store Logo Placeholder */}
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-brand-light to-brand-accent rounded-lg flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                {store.name.charAt(0)}
              </div>
              
              {/* Store Name */}
              <div className="font-semibold text-text-primary text-sm mb-1 group-hover:text-brand-light transition-colors">
                {store.name}
              </div>
              
              {/* Offers Count */}
              <p className="text-xs text-text-secondary">
                {store.offers} offers
              </p>
              
              {/* View Deals Button */}
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs bg-brand-light/20 text-brand-light px-3 py-1 rounded-full border border-brand-light/30">
                  View Deals
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/stores/startwith/a"
          className="inline-flex items-center justify-center space-x-2 bg-brand-light/10 hover:bg-brand-light/20 text-brand-light hover:text-brand-accent transition-all duration-200 font-medium px-6 py-3 rounded-lg border border-brand-light/20 hover:border-brand-light/30"
        >
          <span>View All Stores</span>
          <span className="text-lg">→</span>
        </Link>
      </div>
    </div>
  );
}