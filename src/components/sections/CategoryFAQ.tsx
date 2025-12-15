"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
}

interface CategoryFAQProps {
  categoryName: string;
  faqs: FAQ[];
}

export default function CategoryFAQ({ categoryName, faqs }: CategoryFAQProps) {
  const t = useTranslations('categoryPage.faq');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (faqId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedItems(newExpanded);
  };

  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Sort FAQs by display_order
  const sortedFaqs = [...faqs].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 mb-8">
      <div className="flex items-center mb-8">
        <span className="text-2xl mr-3">❓</span>
        <h2 className="text-3xl font-bold text-text-primary">
          {t('title', { categoryName })}
        </h2>
      </div>

      <div className="space-y-4">
        {sortedFaqs.map((faq) => {
          const isExpanded = expandedItems.has(faq.id);
          
          return (
            <div
              key={faq.id}
              className="border border-card-border rounded-xl overflow-hidden transition-all duration-200 hover:border-brand-light/50"
            >
              <button
                onClick={() => toggleExpanded(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-card-bg/50 hover:bg-brand-light/5 transition-all duration-200"
              >
                <h3 className="font-semibold text-text-primary pr-4">
                  {faq.question}
                </h3>
                <div className={`transform transition-transform duration-200 text-brand-light ${
                  isExpanded ? 'rotate-180' : 'rotate-0'
                }`}>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 py-4 bg-card-bg/30 border-t border-card-border">
                  <p className="text-text-secondary leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Help Section */}
      <div className="mt-8 pt-6 border-t border-card-border">
        <div className="text-center">
          <p className="text-text-secondary mb-4">
            {t('additionalHelp')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/info/contact-us"
              className="inline-flex items-center px-4 py-2 bg-brand-light/10 text-brand-light hover:bg-brand-light/20 rounded-lg transition-all duration-200 font-medium"
            >
              <span className="mr-2">📧</span>
              {t('contactSupport')}
            </a>
            <a
              href="/submission/coupon/add"
              className="inline-flex items-center px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-all duration-200 font-medium"
            >
              <span className="mr-2">🎁</span>
              {t('submitDeal')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
