'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface HolidaySale {
  holiday_name: string;
  holiday_type: string;
  holiday_date: string;
  coupon_count: number;
  sample_coupons: Array<{
    id: string;
    title: string;
    store_name: string;
    discount_value: string;
  }>;
}


export default function HolidaySales() {
  const [holidaySales, setHolidaySales] = useState<HolidaySale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHolidaySales();
  }, []);

  const fetchHolidaySales = async () => {
    try {
      // 获取节日促销统计数据
      const { data, error } = await supabase
        .from('holiday_coupons')
        .select(`
          holiday_name,
          holiday_type,
          holiday_date,
          coupon:coupons (
            id,
            title,
            discount_value,
            store:stores (
              name
            )
          )
        `)
        .not('coupon.store.name', 'is', null)
        .order('holiday_date')
        .limit(1000);

      if (error) {
        console.error('获取节日促销数据失败:', error);
        return;
      }

      if (!data) return;

      // 按节日名称分组数据
      const groupedData = data.reduce((acc: { [key: string]: HolidaySale }, item) => {
        const holidayKey = item.holiday_name;
        
        if (!acc[holidayKey]) {
          acc[holidayKey] = {
            holiday_name: item.holiday_name,
            holiday_type: item.holiday_type || 'Observance',
            holiday_date: item.holiday_date || '',
            coupon_count: 0,
            sample_coupons: []
          };
        }

        // 增加优惠券数量
        acc[holidayKey].coupon_count++;

        // 添加示例优惠券（最多3个）
        if (acc[holidayKey].sample_coupons.length < 3 && item.coupon) {
          const coupon = Array.isArray(item.coupon) ? item.coupon[0] : item.coupon;
          if (coupon) {
            acc[holidayKey].sample_coupons.push({
              id: coupon.id,
              title: coupon.title,
              store_name: Array.isArray(coupon.store) ? coupon.store[0]?.name || 'Unknown Store' : (coupon.store as { name: string })?.name || 'Unknown Store',
              discount_value: coupon.discount_value
            });
          }
        }

        return acc;
      }, {});

      // 转换为数组并排序
      const salesArray = Object.values(groupedData)
        .filter(sale => sale.coupon_count > 0)
        .sort((a, b) => b.coupon_count - a.coupon_count);

      setHolidaySales(salesArray);
    } catch (error) {
      console.error('获取节日促销数据异常:', error);
    } finally {
      setLoading(false);
    }
  };


  // Convert holiday name to URL-friendly slug
  const holidayNameToSlug = (holidayName: string) => {
    return holidayName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'Federal Holiday':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Shopping Event':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };


  if (loading) {
    return (
      <div className="w-full mb-12">
        <h2 className="text-3xl font-bold text-text-primary mb-6 text-center">
          Holiday Sales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-12">
      <h2 className="text-3xl font-bold text-text-primary mb-6 text-center">
        Holiday Sales & Promotions
      </h2>
      <p className="text-text-secondary text-center mb-8">
        Discover exclusive deals and discounts for every holiday celebration
      </p>

      {/* 节日促销卡片网格 - 只显示优惠券数量>=10的节日 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {holidaySales
          .filter(sale => sale.coupon_count >= 10) // 只显示优惠券数量>=10的节日
          .map((sale) => (
          <Link
            key={sale.holiday_name}
            href={`/holidays/${holidayNameToSlug(sale.holiday_name)}`}
            className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-text-primary">
                {sale.holiday_name} Sale
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getTypeStyle(sale.holiday_type)}`}>
                {sale.holiday_type}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold text-brand-accent mb-1">
                {sale.coupon_count}
              </div>
              <div className="text-sm text-text-secondary">
                Available Deals
              </div>
            </div>

            {sale.sample_coupons.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-text-primary mb-2">Featured Stores:</div>
                {sale.sample_coupons.slice(0, 3).map((coupon) => (
                  <div key={coupon.id} className="text-xs text-text-secondary">
                    • {coupon.store_name} - {coupon.discount_value}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-card-border">
              <span className="text-sm text-brand-accent hover:text-brand-light font-medium">
                View All Deals →
              </span>
            </div>
          </Link>
        ))}
      </div>


      {holidaySales.filter(sale => sale.coupon_count >= 10).length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary text-lg mb-4">
            No holiday sales with sufficient deals found at the moment
          </p>
          <p className="text-text-muted text-sm">
            Holiday sales are only displayed when they have 10 or more available deals
          </p>
        </div>
      )}
    </div>
  );
}