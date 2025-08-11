'use client';

import { useState } from 'react';
import { Menu } from './Icons';
import Image from 'next/image';
import Link from 'next/link';
import SearchBox from './SearchBox';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
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
            {/* Navigation Links */}
            <nav className="flex items-center space-x-6 mr-6">
                            
            </nav>
            
            {/* Search Box */}
            <div className="flex-1 max-w-xl">
              <SearchBox 
                placeholder="Search for coupons, stores..."
                className="w-full"
                variant="default"
              />
            </div>
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
              <Link 
                href="/stores/startwith/a" 
                className="text-text-primary hover:text-brand-accent transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Stores
              </Link>
              <Link 
                href="/blog" 
                className="text-text-primary hover:text-brand-accent transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>            
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}