"use client";

import { getUpcomingHolidays, type Holiday } from '@/lib/holidays';
import { useMessages, useTranslations, type AbstractIntlMessages } from 'next-intl';
import { useState } from 'react';

type HolidayDescriptions = Record<string, string>;

type HolidayCalendarMessages = AbstractIntlMessages & {
  home?: {
    holidayCalendar?: {
      descriptions?: HolidayDescriptions;
      defaultDescription?: string;
    };
  };
};

const DESCRIPTION_KEY_MAP: Record<string, string> = {
  "New Year's Day": "newYearsDay",
  "Valentine's Day": "valentinesDay",
  "St. Patrick's Day": "stPatricksDay",
  "Easter Sunday": "easterSunday",
  "Mother's Day": "mothersDay",
  "Memorial Day": "memorialDay",
  "Father's Day": "fathersDay",
  "Independence Day": "independenceDay",
  "Labor Day": "laborDay",
  "Halloween": "halloween",
  "Thanksgiving Day": "thanksgivingDay",
  "Black Friday": "blackFriday",
  "Cyber Monday": "cyberMonday",
  "Christmas Day": "christmasDay",
  "Boxing Day": "boxingDay"
};

export default function HolidaySaleCalendar() {
  const t = useTranslations('home.holidayCalendar');
  const messages = useMessages();
  const calendarMessages = (messages as HolidayCalendarMessages).home?.holidayCalendar;
  const descriptions = calendarMessages?.descriptions;
  const defaultDescription = calendarMessages?.defaultDescription ?? t('defaultDescription');

  const [selectedEvent, setSelectedEvent] = useState<Holiday | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const upcomingEvents = getUpcomingHolidays(6);
  const eventsCountLabel = t('eventsCount', { count: upcomingEvents.length });

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'Federal Holiday':
        return t('filterFederalHoliday');
      case 'Shopping Event':
        return t('filterShoppingEvent');
      case 'Observance':
        return t('filterObservance');
      default:
        return type;
    }
  };

  const formatDaysUntil = (days?: number) => {
    if (typeof days !== 'number') return '';
    if (days === 0) return t('countdown.today');
    if (days === 1) return t('countdown.tomorrow');
    if (days < 7) return t('countdown.days', { count: days });
    if (days < 30) return t('countdown.weeks', { count: Math.floor(days / 7) });
    return t('countdown.months', { count: Math.max(1, Math.floor(days / 30)) });
  };

  const getHolidayDescription = (eventTitle: string) => {
    const key = DESCRIPTION_KEY_MAP[eventTitle];
    if (key && descriptions?.[key]) {
      return descriptions[key];
    }
    return defaultDescription;
  };

  const handleEventClick = (event: Holiday) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  return (
    <>
      <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 mb-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-text-primary">{t('title')}</h2>
          <div className="text-sm text-text-secondary">
            {eventsCountLabel}
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-6 text-text-secondary">{t('upcomingTitle')}</h3>
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
                      {formatDaysUntil(event.daysUntil)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-text-primary group-hover:text-brand-light transition-colors">
                      {event.eventTitle}
                    </span>
                    <span className="text-xs text-text-secondary">{getTypeLabel(event.type)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {event.daysUntil !== undefined && event.daysUntil <= 7 && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                      {t('badgeSoon')}
                    </span>
                  )}
                  <button 
                    className={`text-sm text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm ${getButtonStyle(event.type)} hover:scale-105`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {t('buttons.subscribe')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-text-secondary">{t('legend.federal')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-text-secondary">{t('legend.shopping')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-text-secondary">{t('legend.observance')}</span>
          </div>
        </div>
        
        <div className="text-center text-xs text-text-secondary">
          <p>{t('footerText')}</p>
        </div>
      </div>

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
                  <p className="text-xs text-text-secondary">{getTypeLabel(selectedEvent.type)}</p>
                </div>
              </div>
              
              <p className="text-sm text-text-secondary leading-relaxed">
                {getHolidayDescription(selectedEvent.eventTitle)}
              </p>
              
              {selectedEvent.daysUntil !== undefined && (
                <div className="bg-brand-lightest rounded-lg p-3">
                  <p className="text-sm font-medium text-brand-light">
                    {selectedEvent.daysUntil === 0
                      ? t('modal.headerToday')
                      : selectedEvent.daysUntil === 1
                        ? t('modal.headerTomorrow')
                        : t('modal.daysUntil', {
                            count: selectedEvent.daysUntil,
                            event: selectedEvent.eventTitle
                          })}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button className={`flex-1 text-white py-2 rounded-lg font-medium ${getButtonStyle(selectedEvent.type)}`}>
                  {t('buttons.getDeals')}
                </button>
                <button className="flex-1 border border-card-border text-text-primary py-2 rounded-lg font-medium hover:bg-card-bg/50 transition-colors">
                  {t('buttons.setReminder')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
