'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFeaturedStores } from '@/lib/api';


interface Store {
  name: string;
  alias: string;
}

export default function NewStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await getFeaturedStores(20);
        setStores(data);
      } catch (error) {
        console.error('Failed to fetch featured stores:', error);
        // Fallback to mock data with aliases
        setStores([
          { name: "Ecostair", alias: "ecostair" },
          { name: "Thermomedcare", alias: "thermomedcare" },
          { name: "Solocompetitor", alias: "solocompetitor" },
          { name: "Memoryhearts", alias: "memoryhearts" },
          { name: "Gamechangers", alias: "gamechangers" },
          { name: "Welcomemat AU", alias: "welcomemat-au" },
          { name: "Welcomemat", alias: "welcomemat" },
          { name: "The Artema", alias: "the-artema" },
          { name: "MJMJMJK", alias: "mjmjmjk" },
          { name: "Liferelated", alias: "liferelated" },
          { name: "La Femme UK Promi...", alias: "la-femme-uk-promi" },
          { name: "legends/holidays AU", alias: "legends-holidays-au" },
          { name: "legends Holiday Parks", alias: "legends-holiday-parks" },
          { name: "Myharvest", alias: "myharvest" },
          { name: "Target", alias: "target" },
          { name: "Good Store", alias: "good-store" },
          { name: "Fynstrade UK", alias: "fynstrade-uk" },
          { name: "Eltam", alias: "eltam" },
          { name: "Localbasket.DE", alias: "localbasket-de" },
          { name: "Eatworkshop", alias: "eatworkshop" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const handleStoreClick = (storeAlias: string) => {
    router.push(`/store/${storeAlias}`);
  };

  if (loading) {
    return (
      <div className="w-full mb-8">
        <h2 className="text-2xl font-bold mb-8 text-text-primary px-4">New Stores</h2>
        <div className="bg-card-bg/90 backdrop-blur-sm border border-card-border shadow-lg overflow-hidden rounded-2xl">
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {[...Array(20)].map((_, index) => (
                <div key={index} className="h-12 bg-gray-300 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      <h2 className="text-2xl font-bold mb-8 text-text-primary px-4">New Stores</h2>
      
      <div className="bg-card-bg/90 backdrop-blur-sm border border-card-border shadow-lg overflow-hidden rounded-2xl">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {stores.slice(0, 20).map((store, index) => (
              <div 
                key={index} 
                className="text-xs sm:text-sm text-text-secondary hover:text-brand-accent cursor-pointer transition-all duration-300 font-medium p-2 sm:p-3 rounded-xl hover:bg-brand-lightest hover:shadow-md hover:-translate-y-0.5 text-center border border-transparent hover:border-brand-accent/20 truncate"
                title={store.name}
                onClick={() => handleStoreClick(store.alias)}
              >
                {store.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}