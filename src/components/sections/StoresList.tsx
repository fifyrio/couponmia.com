'use client';

import Link from 'next/link';
import { useState } from 'react';

interface StoresListProps {
  stores: string[];
}

export default function StoresList({ stores }: StoresListProps) {
  const [hoveredStore, setHoveredStore] = useState<string | null>(null);

  // Generate mock store data with additional info
  const getStoreInfo = (storeName: string) => ({
    name: storeName,
    slug: storeName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    couponsCount: Math.floor(Math.random() * 50) + 5,
    rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
    category: getStoreCategory(storeName),
    logo: getStoreLogo(storeName)
  });

  const getStoreCategory = (storeName: string) => {
    const categories = ['Fashion', 'Electronics', 'Home & Garden', 'Health & Beauty', 'Sports', 'Books', 'Travel'];
    return categories[storeName.length % categories.length];
  };

  const getStoreLogo = (storeName: string) => {
    // Generate a simple colored circle with first letter
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
      {stores.map((store, index) => {
        const storeInfo = getStoreInfo(store);
        
        return (
          <Link
            key={index}
            href={`/store/${storeInfo.slug}`}
            className="group"
            onMouseEnter={() => setHoveredStore(store)}
            onMouseLeave={() => setHoveredStore(null)}
          >
            <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl border border-card-border p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 hover:border-brand-light">
              <div className="flex items-center space-x-3 mb-3">
                {/* Store Logo */}
                <div className={`w-12 h-12 rounded-lg ${storeInfo.logo} flex items-center justify-center text-white font-bold text-lg`}>
                  {store.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary truncate group-hover:text-brand-light transition-colors">
                    {store}
                  </h3>
                  <p className="text-xs text-text-secondary">{storeInfo.category}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-brand-light font-medium">
                    {storeInfo.couponsCount} coupons
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-text-secondary">{storeInfo.rating}</span>
                  </div>
                </div>
                
                {hoveredStore === store && (
                  <div className="text-brand-light font-medium animate-pulse">
                    View Deals →
                  </div>
                )}
              </div>
              
              {/* Popular indicator for some stores */}
              {index < 3 && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    🔥 Popular
                  </span>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}