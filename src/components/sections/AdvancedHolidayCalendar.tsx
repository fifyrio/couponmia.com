'use client';

import { useState, useEffect } from 'react';
import { Holiday } from '@/lib/holidays';

interface HolidaySaleCalendarProps {
  initialHolidays?: Holiday[];
  showCountdown?: boolean;
  showFilters?: boolean;
  onSubscribe?: (holiday: Holiday) => void;
}

export default function HolidaySaleCalendar({ 
  initialHolidays = [], 
  showCountdown = true,
  showFilters = true,
  onSubscribe
}: HolidaySaleCalendarProps) {
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  // 标记客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 实时更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    const now = currentTime;
    const diff = targetDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Today!';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // 获取假期类型样式
  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'Federal Holiday':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Shopping Event':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Observance':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
        <h2 className="text-2xl font-bold text-text-primary">Holiday Sale Calendar</h2>
        {showCountdown && isClient && (
          <div className="text-sm text-text-secondary">
            {currentTime.toLocaleTimeString()}
          </div>
        )}
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
              {type === 'all' ? 'All Events' : type}
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
                <span className={`text-xs px-2 py-1 rounded-full border ${getTypeStyle(holiday.type)}`}>
                  {holiday.type}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {holiday.daysUntil !== undefined && holiday.daysUntil <= 3 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium animate-pulse">
                  Coming Soon!
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
          <p>No holidays found for the selected filter.</p>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-text-secondary">
        <p>Real-time countdown • Subscribe for exclusive deals</p>
      </div>
    </div>
  );
} 