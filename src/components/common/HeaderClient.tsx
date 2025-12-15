'use client';

import { useState } from 'react';
import { Menu } from './Icons';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import SearchBox from './SearchBox';
import UserMenu from '@/components/auth/UserMenu';
import CategoriesDropdown from './CategoriesDropdown';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { X, Download } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

interface HeaderClientProps {
  categories: Category[];
}

export default function HeaderClient({ categories }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showExtensionBanner, setShowExtensionBanner] = useState(true);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <>
      {/* Chrome Extension Banner */}
      {showExtensionBanner && (
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white py-3 px-4 text-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/ChromeExtension.png"
                alt="Chrome Extension"
                width={24}
                height={24}
                className="flex-shrink-0"
              />
              <span className="font-medium">
                CouponMia - Total Privacy, Zero Ads, AI Shopping Agent.
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="https://chromewebstore.google.com/detail/couponmia-smart-coupon-fi/lecnpmdlhpiapkjjaadbpkkbknodmeof"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Install Now</span>
              </a>
              <button
                onClick={() => setShowExtensionBanner(false)}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-all duration-200"
                aria-label="Close banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Header */}
      <header className="bg-card-bg/90 backdrop-blur-md border-b border-card-border py-4 sm:py-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo - 使用logo.svg */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="CouponMia Logo"
                width={120}
                height={40}
                className="h-10 sm:h-12 w-auto hover:opacity-80 transition-opacity cursor-pointer"
                priority
              />
            </Link>
          </div>
          
          {/* Navigation and Search */}
          <div className="hidden sm:flex items-center flex-1 mx-8">
            {/* Categories Dropdown */}
            <CategoriesDropdown categories={categories} />
            
            {/* Search Box */}
            <div className="flex-1 max-w-xl ml-6">
              <SearchBox 
                placeholder="Search for coupons, stores..."
                className="w-full"
                variant="default"
              />
            </div>
          </div>

          {/* Language Switcher & User Menu */}
          <div className="hidden sm:flex items-center gap-3 ml-4">
            <LanguageSwitcher />
            <UserMenu />
          </div>

          {/* 手机端Menu按钮 */}
          <div className="sm:hidden">
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-lg bg-card-bg/70 border border-card-border hover:bg-card-bg transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <Menu className="text-text-primary w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 手机端搜索框 - 在logo下方显示 */}
        <div className="sm:hidden mt-4">
          <SearchBox 
            placeholder="Search for coupons, stores..."
            className="w-full"
            variant="compact"
            inputClassName="text-sm py-3"
          />
        </div>

        {/* 移动端菜单 */}
        {isMenuOpen && (
          <div className="sm:hidden mt-4 py-4 border-t border-card-border">
            <nav className="flex flex-col space-y-4">
              {/* Categories Link for Mobile */}
              <Link 
                href="/categories" 
                className="flex items-center gap-3 text-text-primary hover:text-brand-accent transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-brand-medium to-brand-light rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-base font-medium">Categories</div>
                  <div className="text-sm text-text-muted">Browse by category</div>
                </div>
              </Link>
              
              {/* 移动端语言切换器和用户菜单 */}
              <div className="pt-2 border-t border-card-border space-y-4">
                <LanguageSwitcher />
                <UserMenu />
              </div>
            </nav>
          </div>
        )}
      </div>
      </header>
    </>
  );
}