export interface Holiday {
  date: string;
  eventTitle: string;
  type: 'Federal Holiday' | 'Observance' | 'Shopping Event';
  month: number;
  day: number;
  isDynamic?: boolean;
  daysUntil?: number;
  fullDate?: Date;
}

// 计算复活节日期（使用Meeus/Jones/Butcher算法）
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

// 计算动态假期的日期
function calculateDynamicHolidays(year: number): Holiday[] {
  const dynamicHolidays: Holiday[] = [];
  
  // 复活节
  const easter = calculateEaster(year);
  dynamicHolidays.push({
    date: easter.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    eventTitle: "Easter Sunday",
    type: "Observance",
    month: easter.getMonth() + 1,
    day: easter.getDate(),
    isDynamic: true,
    fullDate: easter
  });
  
  // 感恩节 - 11月的第四个星期四
  const thanksgiving = getNthDayOfMonth(year, 11, 4, 4); // 4 = 星期四
  dynamicHolidays.push({
    date: thanksgiving.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    eventTitle: "Thanksgiving Day",
    type: "Federal Holiday",
    month: 11,
    day: thanksgiving.getDate(),
    isDynamic: true,
    fullDate: thanksgiving
  });
  
  // 黑色星期五 - 感恩节后的第二天
  const blackFriday = new Date(thanksgiving);
  blackFriday.setDate(thanksgiving.getDate() + 1);
  dynamicHolidays.push({
    date: blackFriday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    eventTitle: "Black Friday",
    type: "Shopping Event",
    month: 11,
    day: blackFriday.getDate(),
    isDynamic: true,
    fullDate: blackFriday
  });
  
  // 网络星期一 - 感恩节后的第一个星期一
  const cyberMonday = new Date(thanksgiving);
  const daysToAdd = (8 - thanksgiving.getDay()) % 7; // 计算到下一个星期一的天数
  cyberMonday.setDate(thanksgiving.getDate() + daysToAdd);
  dynamicHolidays.push({
    date: cyberMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    eventTitle: "Cyber Monday",
    type: "Shopping Event",
    month: 11,
    day: cyberMonday.getDate(),
    isDynamic: true,
    fullDate: cyberMonday
  });
  
  // 母亲节 - 5月的第二个星期日
  const mothersDay = getNthDayOfMonth(year, 5, 2, 0); // 0 = 星期日
  dynamicHolidays.push({
    date: mothersDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    eventTitle: "Mother's Day",
    type: "Observance",
    month: 5,
    day: mothersDay.getDate(),
    isDynamic: true,
    fullDate: mothersDay
  });
  
  // 父亲节 - 6月的第三个星期日
  const fathersDay = getNthDayOfMonth(year, 6, 3, 0); // 0 = 星期日
  dynamicHolidays.push({
    date: fathersDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    eventTitle: "Father's Day",
    type: "Observance",
    month: 6,
    day: fathersDay.getDate(),
    isDynamic: true,
    fullDate: fathersDay
  });
  
  // 马丁·路德·金纪念日 - 1月的第三个星期一
  const mlkDay = getNthDayOfMonth(year, 1, 3, 1); // 1 = 星期一
  dynamicHolidays.push({
    date: mlkDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    eventTitle: "Martin Luther King Jr. Day",
    type: "Federal Holiday",
    month: 1,
    day: mlkDay.getDate(),
    isDynamic: true,
    fullDate: mlkDay
  });
  
  // 总统日 - 2月的第三个星期一
  const presidentsDay = getNthDayOfMonth(year, 2, 3, 1); // 1 = 星期一
  dynamicHolidays.push({
    date: presidentsDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    eventTitle: "Presidents' Day",
    type: "Federal Holiday",
    month: 2,
    day: presidentsDay.getDate(),
    isDynamic: true,
    fullDate: presidentsDay
  });
  
  // 阵亡将士纪念日 - 5月的最后一个星期一
  const memorialDay = getLastMondayOfMonth(year, 5);
  dynamicHolidays.push({
    date: memorialDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    eventTitle: "Memorial Day",
    type: "Federal Holiday",
    month: 5,
    day: memorialDay.getDate(),
    isDynamic: true,
    fullDate: memorialDay
  });
  
  // 劳动节 - 9月的第一个星期一
  const laborDay = getNthDayOfMonth(year, 9, 1, 1); // 1 = 星期一
  dynamicHolidays.push({
    date: laborDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    eventTitle: "Labor Day",
    type: "Federal Holiday",
    month: 9,
    day: laborDay.getDate(),
    isDynamic: true,
    fullDate: laborDay
  });
  
  // 哥伦布日 - 10月的第二个星期一
  const columbusDay = getNthDayOfMonth(year, 10, 2, 1); // 1 = 星期一
  dynamicHolidays.push({
    date: columbusDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    eventTitle: "Columbus Day",
    type: "Federal Holiday",
    month: 10,
    day: columbusDay.getDate(),
    isDynamic: true,
    fullDate: columbusDay
  });
  
  return dynamicHolidays;
}

// 获取指定月份的第n个指定星期几
function getNthDayOfMonth(year: number, month: number, nth: number, dayOfWeek: number): Date {
  const firstDay = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDay.getDay();
  const offset = (dayOfWeek - firstDayOfWeek + 7) % 7;
  const targetDate = new Date(year, month - 1, 1 + offset + (nth - 1) * 7);
  return targetDate;
}

// 获取指定月份的最后一个星期一
function getLastMondayOfMonth(year: number, month: number): Date {
  const lastDay = new Date(year, month, 0);
  const lastDayOfWeek = lastDay.getDay();
  const daysToSubtract = (lastDayOfWeek - 1 + 7) % 7;
  const targetDate = new Date(year, month - 1, lastDay.getDate() - daysToSubtract);
  return targetDate;
}

// 计算距离指定日期的天数
function calculateDaysUntil(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// 美国主要假期数据（固定日期）
export const usHolidays: Holiday[] = [
  // 1月
  { date: "Jan 1", eventTitle: "New Year's Day", type: "Federal Holiday", month: 1, day: 1 },
  
  // 2月
  { date: "Feb 14", eventTitle: "Valentine's Day", type: "Observance", month: 2, day: 14 },
  
  // 3月
  { date: "Mar 17", eventTitle: "St. Patrick's Day", type: "Observance", month: 3, day: 17 },
  
  // 4月
  { date: "Apr 1", eventTitle: "April Fools' Day", type: "Observance", month: 4, day: 1 },
  { date: "Apr 15", eventTitle: "Tax Day", type: "Observance", month: 4, day: 15 },
  { date: "Apr 22", eventTitle: "Earth Day", type: "Observance", month: 4, day: 22 },
  
  // 5月
  { date: "May 5", eventTitle: "Cinco de Mayo", type: "Observance", month: 5, day: 5 },
  
  // 6月
  { date: "Jun 19", eventTitle: "Juneteenth", type: "Federal Holiday", month: 6, day: 19 },
  
  // 7月
  { date: "Jul 4", eventTitle: "Independence Day", type: "Federal Holiday", month: 7, day: 4 },
  
  // 8月
  { date: "Aug 26", eventTitle: "Women's Equality Day", type: "Observance", month: 8, day: 26 },
  
  // 10月
  { date: "Oct 31", eventTitle: "Halloween", type: "Observance", month: 10, day: 31 },
  
  // 11月
  { date: "Nov 11", eventTitle: "Veterans Day", type: "Federal Holiday", month: 11, day: 11 },
  
  // 12月
  { date: "Dec 25", eventTitle: "Christmas Day", type: "Federal Holiday", month: 12, day: 25 },
  { date: "Dec 26", eventTitle: "Boxing Day", type: "Shopping Event", month: 12, day: 26 },
];

// 获取即将到来的假期
export function getUpcomingHolidays(count: number = 5): Holiday[] {
  const currentYear = new Date().getFullYear();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  
  // 获取动态假期
  const dynamicHolidays = calculateDynamicHolidays(currentYear);
  
  // 为固定假期添加完整日期和天数计算
  const fixedHolidaysWithDates = usHolidays.map(holiday => {
    const fullDate = new Date(currentYear, holiday.month - 1, holiday.day);
    return {
      ...holiday,
      fullDate,
      daysUntil: calculateDaysUntil(fullDate)
    };
  });
  
  // 为动态假期添加天数计算
  const dynamicHolidaysWithDates = dynamicHolidays.map(holiday => ({
    ...holiday,
    daysUntil: calculateDaysUntil(holiday.fullDate!)
  }));
  
  // 合并固定和动态假期
  const allHolidays = [...fixedHolidaysWithDates, ...dynamicHolidaysWithDates];
  
  // 过滤出未来的假期
  const upcomingHolidays = allHolidays.filter(holiday => {
    if (holiday.month > currentMonth) return true;
    if (holiday.month === currentMonth && holiday.day >= currentDay) return true;
    return false;
  });
  
  // 按天数排序（最近的在前）
  upcomingHolidays.sort((a, b) => (a.daysUntil || 0) - (b.daysUntil || 0));
  
  return upcomingHolidays.slice(0, count);
}

// 获取当前年份的假期（用于计算实际日期）
export function getHolidaysForCurrentYear(): Holiday[] {
  const currentYear = new Date().getFullYear();
  const dynamicHolidays = calculateDynamicHolidays(currentYear);
  
  return [...usHolidays, ...dynamicHolidays];
} 