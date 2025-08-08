'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { Search } from './Icons';

interface SearchResult {
  id: string;
  name: string;
  alias: string;
  logo?: string;
  offers: number;
  rating: number;
  featured: boolean;
}

interface SearchBoxProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  variant?: 'default' | 'compact';
}

export default function SearchBox({ 
  placeholder = "Search for store, brand, or product...", 
  className = "",
  inputClassName = "",
  dropdownClassName = "",
  variant = 'default'
}: SearchBoxProps) {
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
          const response = await fetch(`/api/search/stores?q=${encodeURIComponent(debouncedSearchQuery)}&limit=6`);
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

    // Use a slight delay to prevent conflicts with click events
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    setSearchQuery(''); // Clear search after navigation
  };

  const handleResultClick = (storeAlias: string) => {
    // Don't clear the search query immediately, let user keep their search context
    setShowResults(false);
    router.push(`/store/${storeAlias}`);
  };

  const baseInputClasses = variant === 'compact' 
    ? "w-full px-4 py-2 text-sm"
    : "w-full px-6 py-3 text-base";

  const defaultInputClasses = "border border-card-border rounded-xl bg-card-bg/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all duration-200 text-text-primary placeholder-text-muted";

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch}>
        <div className="relative">
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
            placeholder={placeholder}
            className={`${baseInputClasses} ${defaultInputClasses} ${inputClassName}`}
            disabled={isSearching}
          />
          <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted ${variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (searchResults.length > 0 || debouncedSearchQuery.trim().length >= 2) && (
        <div 
          ref={resultsRef}
          className={`absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto ${dropdownClassName}`}
        >
          {isSearching && (
            <div className="px-6 py-4 text-center text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Searching...</span>
              </div>
            </div>
          )}
          
          {!isSearching && searchResults.length === 0 && debouncedSearchQuery.trim().length >= 2 && (
            <div className="px-6 py-4 text-center text-gray-500 text-sm">
              No stores found for &quot;{debouncedSearchQuery}&quot;
            </div>
          )}
          
          {!isSearching && searchResults.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs text-gray-600 border-b border-gray-100">
                Found {searchResults.length} stores
              </div>
              {searchResults.map((store) => (
                <button
                  key={store.id}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input from losing focus
                    handleResultClick(store.alias);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-purple-500 flex items-center justify-center text-white font-medium text-sm">
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate text-sm">
                      {store.name}
                      {store.featured && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
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
  );
}