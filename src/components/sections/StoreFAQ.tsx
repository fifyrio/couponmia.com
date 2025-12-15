"use client";

import { useTranslations } from 'next-intl';

interface FAQItem {
  question: string;
  answer: string;
}

interface StoreFAQProps {
  faq: FAQItem[];
  storeName: string;
  faqImage?: string | null;
}

export default function StoreFAQ({ faq, storeName, faqImage }: StoreFAQProps) {
  const t = useTranslations('store.faqSection');
  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8">
      <h2 className="text-3xl font-bold text-text-primary mb-8 text-center flex items-center justify-center">
        <span className="text-3xl mr-3">❓</span>
        {t('title', { storeName })}
      </h2>

      <div className="space-y-4">
        {/* Special FAQ with Image - shown first if faqImage exists */}
        {faqImage && (
          <div className="border border-card-border rounded-xl overflow-hidden">
            <div className="w-full">
              <h3 className="px-6 py-4 text-left bg-card-bg/90 text-text-primary font-semibold">
                {t('imageQuestion', { storeName })}
              </h3>
              <div className="px-6 py-4 bg-card-bg/50 border-t border-card-border">
                <div className="rounded-lg overflow-hidden border border-card-border">
                  <img
                    src={faqImage}
                    alt={t('imageQuestion', { storeName })}
                    className="w-full h-[300px] object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.parentElement?.classList.add('hidden');
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular FAQs */}
        {faq.map((item, index) => (
          <div
            key={index}
            className="border border-card-border rounded-xl overflow-hidden"
          >
            <div className="w-full px-6 py-4 bg-card-bg/90">
              <h3 className="font-semibold text-text-primary mb-2">
                {item.question}
              </h3>
              <div className="px-0 py-2 bg-card-bg/50">
                <p className="text-text-secondary leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-brand-light/10 border border-brand-light/20 rounded-xl p-6 text-center">
        <p className="mb-4 text-text-secondary">
          {t('needHelp')}
        </p>
        <button className="bg-brand-light text-white font-semibold px-6 py-2 rounded-lg hover:bg-brand-accent transition-colors duration-200">
          {t('contactSupport')}
        </button>
      </div>

    </div>
  );
}
