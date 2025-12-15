"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Holiday } from '@/lib/holidays';

interface HolidaySaleCalendarProps {
  initialHolidays?: Holiday[];
  showCountdown?: boolean;
  showFilters?: boolean;
  showViewAllButtons?: boolean;
  onSubscribe?: (holiday: Holiday) => void;
}

export default function HolidaySaleCalendar({ 
  initialHolidays = [], 
  showCountdown = false,
  showFilters = true,
  showViewAllButtons = true,
  onSubscribe
}: HolidaySaleCalendarProps) {
  const t = useTranslations('advancedHolidayCalendar');
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  // 标记客户端渲染
  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
  }, []);

  // 实时更新时间 - DISABLED to improve performance
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentTime(new Date());
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, []);

  // 如果没有初始数据，从API获取
  useEffect(() => {
    if (initialHolidays.length === 0) {
      fetchHolidays();
    }
  }, [initialHolidays]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/holidays?count=3&type=sale');
      const data = await response.json();
      if (data.success) {
        setHolidays(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤假期，限制为3个并优先显示购物相关节日
  const filteredHolidays = selectedType === 'all' 
    ? holidays.slice(0, 3)
    : holidays.filter(holiday => holiday.type === selectedType).slice(0, 3);

  // 计算实时倒计时
  const getRealTimeCountdown = (targetDate: Date) => {
    if (!currentTime) return t('countdown.loading');
    const now = currentTime;
    const diff = targetDate.getTime() - now.getTime();
    
    if (diff <= 0) return t('countdown.today');
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return t('countdown.formattedDaysHours', { days, hours });
    if (hours > 0) return t('countdown.formattedHoursMinutes', { hours, minutes });
    return t('countdown.formattedMinutes', { minutes });
  };

  // 获取假期图标
  const getHolidayIcon = (title: string) => {
    const icons: { [key: string]: string } = {
      "New Year's Day": "🎆",
      "Valentine's Day": "💝",
      "St. Patrick's Day": "☘️",
      "Easter Sunday": "🐰",
      "Mother's Day": "🌷",
      "Memorial Day": "🇺🇸",
      "Father's Day": "👨‍👧‍👦",
      "Independence Day": "🎆",
      "Labor Day": "🏭",
      "Halloween": "🎃",
      "Thanksgiving Day": "🦃",
      "Black Friday": "🛍️",
      "Cyber Monday": "💻",
      "Christmas Day": "🎄",
      "Boxing Day": "📦"
    };
    return icons[title] || "📅";
  };

  if (loading) {
    return (
      <div className="w-full bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">{t('title')}</h2>
        <div className="flex items-center gap-4">
          {showCountdown && isClient && currentTime && (
            <div className="text-sm text-text-secondary">
              {currentTime.toLocaleTimeString()}
            </div>
          )}
          {showViewAllButtons && (
            <Link 
              href="/holidays"
              className="bg-gradient-to-r from-brand-medium to-brand-light text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              {t('viewAll')}
            </Link>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'Federal Holiday', 'Shopping Event', 'Observance'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-brand-light text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all'
                ? t('filters.all')
                : type === 'Federal Holiday'
                  ? t('filters.federal')
                  : type === 'Shopping Event'
                    ? t('filters.shopping')
                    : t('filters.observance')}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {filteredHolidays.map((holiday, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 border border-card-border rounded-xl hover:bg-card-bg/50 transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">{getHolidayIcon(holiday.eventTitle)}</span>
              
              <div className="flex flex-col">
                <span className="text-sm bg-brand-lightest text-brand-light px-2 py-1 rounded font-medium w-fit">
                  {holiday.date}
                </span>
                {showCountdown && holiday.fullDate && (
                  <span className="text-xs text-text-secondary mt-1">
                    {getRealTimeCountdown(holiday.fullDate)}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <span className="font-semibold text-text-primary">{holiday.eventTitle}</span>                
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {holiday.daysUntil !== undefined && holiday.daysUntil <= 3 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium animate-pulse">
                  {t('countdown.comingSoon')}
                </span>
              )}
              <button 
                onClick={() => onSubscribe?.(holiday)}
                className="bg-brand-light text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-accent transition-colors"
              >
                Subscribe
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredHolidays.length === 0 && (
        <div className="text-center py-8 text-text-secondary">
          <p>{t('empty')}</p>
        </div>
      )}

      {showViewAllButtons && (
        <div className="mt-6 text-center space-y-3">
          <Link 
            href="/holidays"
            className="inline-flex items-center text-brand-light hover:text-brand-accent font-medium transition-colors text-sm"
          >
            <span>{t('cta.viewAll')}</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-xs text-text-secondary">{t('cta.subscribe')}</p>
        </div>
      )}
    </div>
  );
} 
