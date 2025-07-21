'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface StoreFAQProps {
  faq: FAQItem[];
  storeName: string;
}

export default function StoreFAQ({ faq, storeName }: StoreFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8">
      <h2 className="text-3xl font-bold text-text-primary mb-8 text-center flex items-center justify-center">
        <span className="text-3xl mr-3">❓</span>
        FAQ on {storeName} Promo Codes
      </h2>

      <div className="space-y-4">
        {faq.map((item, index) => (
          <div
            key={index}
            className="border border-card-border rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 text-left bg-card-bg/90 hover:bg-card-bg transition-colors duration-200 flex items-center justify-between"
            >
              <span className="font-semibold text-text-primary pr-4">
                {item.question}
              </span>
              <span className={`text-2xl transition-transform duration-200 ${
                openIndex === index ? 'rotate-180' : ''
              }`}>
                ▼
              </span>
            </button>
            
            {openIndex === index && (
              <div className="px-6 py-4 bg-card-bg/50 border-t border-card-border">
                <p className="text-text-secondary leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 bg-brand-light/10 border border-brand-light/20 rounded-xl p-6 text-center">
        <p className="mb-4 text-text-secondary">
          Can&apos;t find what you&apos;re looking for? Our support team is here to help!
        </p>
        <button className="bg-brand-light text-white font-semibold px-6 py-2 rounded-lg hover:bg-brand-accent transition-colors duration-200">
          Contact Support
        </button>
      </div>

    </div>
  );
}