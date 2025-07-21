import { Search, Menu } from './Icons';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
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
          
          {/* 搜索框 - 在手机端隐藏，在桌面端显示 */}
          <div className="hidden sm:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for coupons, stores..."
                className="w-full px-6 py-3 border border-card-border rounded-xl bg-card-bg/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all duration-200 text-text-primary placeholder-text-muted"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
            </div>
          </div>

          {/* 手机端Menu按钮 */}
          <div className="sm:hidden">
            <button className="p-2 rounded-lg bg-card-bg/70 border border-card-border hover:bg-card-bg transition-colors duration-200">
              <Menu className="text-text-primary w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 手机端搜索框 - 在logo下方显示 */}
        <div className="sm:hidden mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for coupons, stores..."
              className="w-full px-4 py-3 border border-card-border rounded-xl bg-card-bg/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all duration-200 text-text-primary placeholder-text-muted text-sm"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}