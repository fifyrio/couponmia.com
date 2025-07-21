'use client';

import { getUpcomingHolidays } from '@/lib/holidays';
import { useState } from 'react';

export default function HolidaySaleCalendar() {
  const [selectedEvent, setSelectedEvent] = useState<null | {eventTitle: string; date: string; type: string; description?: string; daysUntil?: number}>(null);
  const [showModal, setShowModal] = useState(false);
  
  // 获取即将到来的假期（服务端渲染）
  const upcomingEvents = getUpcomingHolidays(6);

  // 根据假期类型获取不同的按钮样式
  const getButtonStyle = (type: string) => {
    switch (type) {
      case 'Federal Holiday':
        return 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700';
      case 'Shopping Event':
        return 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700';
      case 'Observance':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';
      default:
        return 'bg-gradient-to-r from-brand-medium to-brand-light hover:from-brand-light hover:to-brand-accent';
    }
  };

  // 根据假期类型获取图标
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Federal Holiday':
        return '🏛️';
      case 'Shopping Event':
        return '🛍️';
      case 'Observance':
        return '🎉';
      default:
        return '📅';
    }
  };

  // 格式化天数显示
  const formatDaysUntil = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    return `${Math.floor(days / 30)} months`;
  };

  // 获取假期描述
  const getHolidayDescription = (eventTitle: string) => {
    const descriptions: { [key: string]: string } = {
      "New Year's Day": "Celebrate the beginning of a new year with family and friends.",
      "Valentine's Day": "A day to express love and affection to your special someone.",
      "St. Patrick's Day": "Celebrate Irish culture with parades, green attire, and festivities.",
      "Easter Sunday": "A Christian holiday celebrating the resurrection of Jesus Christ.",
      "Mother's Day": "Honor and celebrate mothers and mother figures in your life.",
      "Memorial Day": "Remember and honor those who died while serving in the military.",
      "Father's Day": "Celebrate fathers and father figures with love and appreciation.",
      "Independence Day": "Celebrate America's independence with fireworks and festivities.",
      "Labor Day": "Honor the contributions of workers and the labor movement.",
      "Halloween": "A fun holiday for costumes, candy, and spooky celebrations.",
      "Thanksgiving Day": "Give thanks and celebrate with family and a traditional feast.",
      "Black Friday": "The biggest shopping day of the year with massive discounts.",
      "Cyber Monday": "Online shopping deals and discounts for tech and electronics.",
      "Christmas Day": "Celebrate the birth of Jesus Christ with family and gifts.",
      "Boxing Day": "A shopping holiday with great deals and discounts."
    };
    return descriptions[eventTitle] || "A special day to celebrate and enjoy with loved ones.";
  };

  const handleEventClick = (event: {eventTitle: string; date: string; type: string; description?: string; daysUntil?: number}) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  return (
    <>
      <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 mb-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-text-primary">Holiday Sale Calendar</h2>
          <div className="text-sm text-text-secondary">
            {upcomingEvents.length} upcoming events
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-6 text-text-secondary">Upcoming Holidays</h3>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between py-4 px-4 border border-card-border rounded-xl hover:bg-card-bg/50 transition-all duration-200 cursor-pointer group"
                onClick={() => handleEventClick(event)}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {getEventIcon(event.type)}
                  </span>
                  <div className="flex flex-col items-center">
                    <span className="text-sm bg-brand-lightest text-brand-light px-3 py-2 rounded-lg font-medium">
                      {event.date}
                    </span>
                    <span className="text-xs text-text-secondary mt-1 font-medium">
                      {event.daysUntil !== undefined && formatDaysUntil(event.daysUntil)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-text-primary group-hover:text-brand-light transition-colors">
                      {event.eventTitle}
                    </span>
                    <span className="text-xs text-text-secondary">{event.type}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {event.daysUntil !== undefined && event.daysUntil <= 7 && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                      Soon!
                    </span>
                  )}
                  <button 
                    className={`text-sm text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm ${getButtonStyle(event.type)} hover:scale-105`}
                    onClick={(e) => {
                      e.stopPropagation();
                      // 这里可以添加订阅功能
                    }}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-text-secondary">Federal Holidays</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-text-secondary">Shopping Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-text-secondary">Observances</span>
          </div>
        </div>
        
        <div className="text-center text-xs text-text-secondary">
          <p>Click on any holiday for more details and exclusive deals!</p>
        </div>
      </div>

      {/* 假期详情弹窗 */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-text-primary">{selectedEvent.eventTitle}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getEventIcon(selectedEvent.type)}</span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{selectedEvent.date}</p>
                  <p className="text-xs text-text-secondary">{selectedEvent.type}</p>
                </div>
              </div>
              
              <p className="text-sm text-text-secondary leading-relaxed">
                {getHolidayDescription(selectedEvent.eventTitle)}
              </p>
              
              {selectedEvent.daysUntil !== undefined && (
                <div className="bg-brand-lightest rounded-lg p-3">
                  <p className="text-sm font-medium text-brand-light">
                    {selectedEvent.daysUntil === 0 ? 'Today!' : 
                     selectedEvent.daysUntil === 1 ? 'Tomorrow!' : 
                     `${selectedEvent.daysUntil} days until ${selectedEvent.eventTitle}`}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button className={`flex-1 text-white py-2 rounded-lg font-medium ${getButtonStyle(selectedEvent.type)}`}>
                  Get Deals
                </button>
                <button className="flex-1 border border-card-border text-text-primary py-2 rounded-lg font-medium hover:bg-card-bg/50 transition-colors">
                  Set Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}