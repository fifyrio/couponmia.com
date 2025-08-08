'use client';

import { useRef } from 'react';
import HeroSearchBox, { HeroSearchBoxRef } from './HeroSearchBox';

export default function Hero() {
  const searchInputRef = useRef<HeroSearchBoxRef>(null);

  return (
    <div className="relative overflow-hidden">
      {/* 渐变背景 - 参考第二张图片的颜色方案 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-600 to-purple-400">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/50 to-yellow-200/60"></div>
      </div>
      
      {/* 内容区域 */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          {/* 主标题 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Coupon Mia: Search any hidden Deals.
            <br />
            <span className="text-yellow-200">Unbelievable Prices.</span>
          </h1>
          
          {/* 副标题 */}
          <p className="text-xl sm:text-2xl text-purple-100 mb-12 max-w-2xl mx-auto">
            AI-powered savings, instantly.
          </p>
          
          {/* 搜索表单 */}
          <div className="max-w-4xl mx-auto">
            <HeroSearchBox ref={searchInputRef} />
          </div>
          
          {/* 搜索建议或快捷链接 */}
          <div className="mt-8">
            <p className="text-purple-200 text-sm mb-4">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Amazon', 'Nike', 'Apple', 'Samsung', 'Fashion', 'Electronics'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    searchInputRef.current?.setExternalQuery(term);
                  }}
                  className="px-4 py-2 text-sm text-purple-200 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200 backdrop-blur-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
          
          {/* 统计数字 */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-200 mb-2">10,000+</div>
              <div className="text-purple-200">Active Deals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-200 mb-2">500+</div>
              <div className="text-purple-200">Partner Stores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-200 mb-2">$2M+</div>
              <div className="text-purple-200">Savings Generated</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 底部装饰波浪 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-24 text-background" viewBox="0 0 1440 120" fill="currentColor">
          <path d="M0,60L48,65C96,70,192,80,288,75C384,70,480,50,576,45C672,40,768,50,864,60C960,70,1056,80,1152,75C1248,70,1344,50,1392,40L1440,30V120H1392C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120H0V60Z"></path>
        </svg>
      </div>
    </div>
  );
}