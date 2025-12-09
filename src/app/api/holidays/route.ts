import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingHolidays, getHolidaysForCurrentYear } from '@/lib/holidays';
import { apiCache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = searchParams.get('count');
    const type = searchParams.get('type');
    const year = searchParams.get('year');

    // Generate cache key based on query parameters
    const cacheKey = `holidays:${year || 'upcoming'}:${count || '10'}:${type || 'all'}`;

    // Check cache
    const cachedHolidays = apiCache.get(cacheKey);
    if (cachedHolidays !== null) {
      return NextResponse.json({
        success: true,
        data: cachedHolidays,
        count: cachedHolidays.length,
        timestamp: new Date().toISOString(),
        cached: true
      });
    }

    let holidays;

    if (year) {
      // 获取指定年份的所有假期
      holidays = getHolidaysForCurrentYear();
    } else {
      // 获取即将到来的假期
      const limit = count ? parseInt(count) : 10;
      holidays = getUpcomingHolidays(limit);
    }

    // 如果指定了类型，进行过滤
    if (type) {
      holidays = holidays.filter(holiday => holiday.type === type);
    }

    // Cache the results
    apiCache.set(cacheKey, holidays);

    return NextResponse.json({
      success: true,
      data: holidays,
      count: holidays.length,
      timestamp: new Date().toISOString(),
      cached: false
    });

  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch holidays',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 