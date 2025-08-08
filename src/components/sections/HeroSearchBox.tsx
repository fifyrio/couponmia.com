'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  name: string;
  alias: string;
  logo?: string;
  offers: number;
  rating: number;
  featured: boolean;
}

interface HeroSearchBoxProps {
  onQueryChange?: (query: string) => void;
}

export interface HeroSearchBoxRef {
  setExternalQuery: (query: string) => void;
}

const HeroSearchBox = forwardRef<HeroSearchBoxRef, HeroSearchBoxProps>(({ onQueryChange }, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Effect to perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/search/stores?q=${encodeURIComponent(debouncedSearchQuery)}&limit=8`);
          const data = await response.json();
          setSearchResults(data.stores || []);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Notify parent component of query changes
  useEffect(() => {
    if (onQueryChange) {
      onQueryChange(searchQuery);
    }
  }, [searchQuery, onQueryChange]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    // If there are search results, navigate to the first one
    if (searchResults.length > 0) {
      router.push(`/store/${searchResults[0].alias}`);
    } else {
      // Fallback: redirect based on first character
      const firstChar = searchQuery.trim().charAt(0).toLowerCase();
      if (firstChar.match(/[a-z]/)) {
        router.push(`/stores/startwith/${firstChar}`);
      } else {
        router.push('/stores/startwith/other');
      }
    }
    
    setShowResults(false);
  };

  const handleResultClick = (storeAlias: string) => {
    // Don't clear the search immediately, keep user context
    setShowResults(false);
    router.push(`/store/${storeAlias}`);
  };

  // Expose method to set search query externally
  const setExternalQuery = (query: string) => {
    setSearchQuery(query);
    searchInputRef.current?.focus();
  };

  // Expose the setQuery function via ref
  useImperativeHandle(ref, () => ({
    setExternalQuery
  }));

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 relative">
        <div className="flex-1 relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
            placeholder="Search for store, brand, or product..."
            className="w-full px-6 py-4 text-lg text-gray-900 placeholder-gray-500 bg-white border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-lg"
            disabled={isSearching}
          />
          
          {/* Search Results Dropdown */}
          {showResults && (searchResults.length > 0 || debouncedSearchQuery.trim().length >= 2) && (
            <div 
              ref={resultsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto"
            >
              {isSearching && (
                <div className="px-6 py-4 text-center text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching...</span>
                  </div>
                </div>
              )}
              
              {!isSearching && searchResults.length === 0 && debouncedSearchQuery.trim().length >= 2 && (
                <div className="px-6 py-4 text-center text-gray-500">
                  No stores found for &quot;{debouncedSearchQuery}&quot;
                </div>
              )}
              
              {!isSearching && searchResults.length > 0 && (
                <>
                  <div className="px-6 py-2 text-sm text-gray-600 border-b border-gray-100">
                    Found {searchResults.length} stores
                  </div>
                  {searchResults.map((store) => (
                    <button
                      key={store.id}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input from losing focus
                        handleResultClick(store.alias);
                      }}
                      type="button"
                      className="w-full px-6 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded bg-purple-500 flex items-center justify-center text-white font-medium text-sm">
                        {store.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {store.name}
                          {store.featured && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {store.offers} offers available
                          {store.rating > 0 && (
                            <span className="ml-2">
                              ⭐ {store.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isSearching || !searchQuery.trim()}
          className="hidden px-8 py-4 text-lg font-semibold text-white bg-gray-800 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-r-xl sm:rounded-l-none rounded-l-xl transition-colors duration-200 shadow-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
        >
          {isSearching ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Searching...</span>
            </div>
          ) : (
            'Search Deals'
          )}
        </button>
      </div>
    </form>
  );
});

HeroSearchBox.displayName = 'HeroSearchBox';

export default HeroSearchBox;