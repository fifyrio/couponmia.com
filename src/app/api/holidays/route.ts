import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingHolidays, getHolidaysForCurrentYear } from '@/lib/holidays';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = searchParams.get('count');
    const type = searchParams.get('type');
    const year = searchParams.get('year');
    
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
    
    return NextResponse.json({
      success: true,
      data: holidays,
      count: holidays.length,
      timestamp: new Date().toISOString()
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