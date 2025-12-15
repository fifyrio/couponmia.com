'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronDown, Grid3x3 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

interface CategoriesDropdownProps {
  categories: Category[];
}

export default function CategoriesDropdown({ categories }: CategoriesDropdownProps) {
  const t = useTranslations('categoriesPage');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const handleCategoryClick = () => {
    setIsOpen(false);
  };

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Categories Button */}
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          isOpen
            ? 'bg-brand-medium text-white shadow-md'
            : 'text-text-secondary hover:text-text-primary hover:bg-card-bg/50'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Grid3x3 className="w-4 h-4" />
        <span>{t('grid.title')}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu - Always rendered but hidden/shown with CSS for SEO */}
      <div className={`absolute top-full left-0 mt-1 w-80 bg-card-bg/95 backdrop-blur-md border border-card-border rounded-xl shadow-xl z-50 transition-all duration-200 ${
        isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
      }`}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-card-border">
            <Grid3x3 className="w-5 h-5 text-brand-medium" />
            <h3 className="font-semibold text-text-primary">{t('grid.title')}</h3>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}-coupons`}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-brand-medium/10 hover:text-brand-medium transition-all duration-200 group"
                onClick={handleCategoryClick}
              >
                {/* Category Icon */}
                <div className="w-8 h-8 bg-gradient-to-br from-brand-medium to-brand-light rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {category.name.charAt(0)}
                </div>
                
                {/* Category Name */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary group-hover:text-brand-medium transition-colors">
                    {category.name}
                  </div>
                  <div className="text-xs text-text-muted">
                    {t('grid.cardSubtitle')}
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="text-text-muted group-hover:text-brand-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Categories Link */}
          <div className="pt-3 mt-3 border-t border-card-border">
            <Link
              href="/categories"
              className="block text-center px-4 py-2 bg-gradient-to-r from-brand-medium to-brand-light text-white rounded-lg font-medium hover:from-brand-light hover:to-brand-medium transition-all duration-200 shadow-md"
              onClick={handleCategoryClick}
            >
              {t('grid.viewAll')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
