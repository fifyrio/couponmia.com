"use client";

import { useFormatter, useTranslations } from 'next-intl';

interface DiscountAnalysis {
  total_offers: number;
  parsed_discounts: number;
  min_percent: number | null;
  max_percent: number | null;
  avg_percent: number | null;
  min_amount: number | null;
  max_amount: number | null;
  discount_types: string[];
  best_offer: string;
  analyzed_at: string;
}

interface StoreMoreInfoProps {
  storeName: string;
  discountAnalysis?: DiscountAnalysis | null;
}

export default function StoreMoreInfo({ storeName, discountAnalysis }: StoreMoreInfoProps) {
  const t = useTranslations('store.moreInfo');
  const formatter = useFormatter();

  const formatDate = (dateString: string) => {
    try {
      return formatter.dateTime(new Date(dateString), {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return t('summary.details.recently');
    }
  };

  const formatCurrency = (value: number) =>
    formatter.number(value, { style: 'currency', currency: 'USD' });

  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-text-primary mb-4">
          {t('title', { storeName })}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Summary Card with Discount Analysis */}
        <div className="bg-card-bg/50 border border-card-border rounded-xl p-6">
          <h3 className="font-semibold text-text-primary mb-4 text-lg">
            {t('summary.title')}
          </h3>
          <p className="text-text-secondary leading-relaxed mb-6">
            {t('summary.description', { storeName })}
          </p>

          {discountAnalysis ? (
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-600 mb-1">
                    {discountAnalysis.total_offers}
                  </div>
                  <div className="text-xs text-green-700 font-medium">
                    {t('summary.stats.activeOffers')}
                  </div>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-600 mb-1">
                    {discountAnalysis.avg_percent || 0}%
                  </div>
                  <div className="text-xs text-blue-700 font-medium">
                    {t('summary.stats.avgDiscount')}
                  </div>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-purple-600 mb-1">
                    {discountAnalysis.discount_types.length}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    {t('summary.stats.offerTypes')}
                  </div>
                </div>
              </div>

              {/* Detailed Analysis Table */}
              <div className="bg-card-bg/30 border border-card-border/50 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-3 text-sm">
                  {t('summary.details.title')}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-card-border/30">
                    <span className="text-text-secondary">{t('summary.details.bestOffer')}</span>
                    <span className="font-semibold text-brand-light text-right">
                      {(() => {
                        const offer = discountAnalysis.best_offer;
                        
                        return typeof offer === 'string' ? offer : String(offer);
                      })()}
                    </span>
                  </div>
                  
                  {(discountAnalysis.min_percent !== null && discountAnalysis.max_percent !== null && (discountAnalysis.min_percent > 0 || discountAnalysis.max_percent > 0)) && (
                    <div className="flex justify-between items-center py-2 border-b border-card-border/30">
                      <span className="text-text-secondary">{t('summary.details.percentageRange')}</span>
                      <span className="font-semibold text-text-primary text-right">
                        {discountAnalysis.min_percent}% - {discountAnalysis.max_percent}%
                      </span>
                    </div>
                  )}
                  
                  {(discountAnalysis.min_amount !== null && discountAnalysis.max_amount !== null && (discountAnalysis.min_amount > 0 || discountAnalysis.max_amount > 0)) && (
                    <div className="flex justify-between items-center py-2 border-b border-card-border/30">
                      <span className="text-text-secondary">{t('summary.details.dollarRange')}</span>
                      <span className="font-semibold text-text-primary text-right">
                        {formatCurrency(discountAnalysis.min_amount)} - {formatCurrency(discountAnalysis.max_amount)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">{t('summary.details.lastUpdated')}</span>
                    <span className="font-semibold text-text-primary text-right">
                      {formatDate(discountAnalysis.analyzed_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-brand-light/5 border border-brand-light/20 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-sm text-text-secondary">
                {t('summary.noData', { storeName })}
              </div>
            </div>
          )}
        </div>

        {/* Free Delivery Card */}
        <div className="bg-brand-light/10 border border-brand-light/20 rounded-xl p-6">
          <h2 className="font-semibold text-brand-light mb-3 text-lg">
            {t('freeDelivery.title', { storeName })}
          </h2>
          <p className="text-text-secondary leading-relaxed">
            {t('freeDelivery.description', { storeName })}
          </p>
        </div>

        {/* Newsletter Card */}
        <div className="bg-card-bg/50 border border-card-border rounded-xl p-6">
          <h2 className="font-semibold text-text-primary mb-3 text-lg">
            {t('newsletter.title', { storeName })}
          </h2>
          <p className="text-text-secondary leading-relaxed">
            {t('newsletter.description', { storeName })}
          </p>
        </div>

        {/* Disclosure Card */}
        <div className="bg-brand-light/10 border border-brand-light/20 rounded-xl p-6">
          <h2 className="font-semibold text-brand-light mb-3 text-lg">
            {t('disclosure.title')}
          </h2>
          <p className="text-text-secondary leading-relaxed">
            {t('disclosure.description', { storeName })}
          </p>
        </div>
      </div>
    </div>
  );
}
