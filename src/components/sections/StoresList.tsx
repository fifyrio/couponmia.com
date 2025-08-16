'use client';

import { useState } from 'react';

interface Store {
  id: string;
  name: string;
  alias: string;
  couponsCount: number;
  rating: number;
  reviewCount: number;
  category: string;
}

interface StoresListProps {
  stores: Store[];
}

export default function StoresList({ stores }: StoresListProps) {
  const [hoveredStore, setHoveredStore] = useState<string | null>(null);

  const getStoreLogo = (storeName: string) => {
    // Generate a simple colored circle with first letter - no external images for better performance
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[storeName.length % colors.length];
  };

  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏪</div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">No stores found</h3>
        <p className="text-text-secondary">There are no stores starting with this letter yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stores.map((store) => {
        return (
          <a
            key={store.id}
            href={`https://couponmia.com/store/${store.alias}`}
            target="_blank"
            className="group"
            onMouseEnter={() => setHoveredStore(store.name)}
            onMouseLeave={() => setHoveredStore(null)}
          >
            <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl border border-card-border p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 hover:border-brand-light">
              <div className="flex items-center space-x-3 mb-3">
                {/* Store Initial Circle - No external images for better performance */}
                <div className={`w-12 h-12 rounded-lg ${getStoreLogo(store.name)} flex items-center justify-center text-white font-bold text-lg`}>
                  {store.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary truncate group-hover:text-brand-light transition-colors">
                    {store.name}
                  </h3>
                  <p className="text-xs text-text-secondary">{store.category}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-brand-light font-medium">
                    {store.couponsCount} coupons
                  </span>
                  {store.rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-text-secondary">{store.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                {hoveredStore === store.name && (
                  <div className="text-brand-light font-medium animate-pulse">
                    View Deals →
                  </div>
                )}
              </div>
              
              {/* Popular indicator for high rating stores or stores with many coupons */}
              {(store.rating >= 4.5 || store.couponsCount >= 20) && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    🔥 Popular
                  </span>
                </div>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}