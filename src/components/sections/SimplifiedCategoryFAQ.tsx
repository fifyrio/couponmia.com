'use client';

import { useState } from 'react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  content_type?: 'faq' | 'content';
  section_title?: string;
}

interface CategoryFAQProps {
  categoryName: string;
  faqs: FAQ[];
}

interface FAQSection {
  title: string;
  items: FAQ[];
  type: 'faq' | 'content';
  priority: number;
}

export default function SimplifiedCategoryFAQ({ categoryName, faqs }: CategoryFAQProps) {
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

  // Organize FAQs into sections
  const sections: FAQSection[] = [];
  const sectionMap = new Map<string, FAQ[]>();

  // Group FAQs by type and section
  faqs.forEach(faq => {
    const sectionTitle = faq.section_title || 'Frequently Asked Questions';
    
    if (!sectionMap.has(sectionTitle)) {
      sectionMap.set(sectionTitle, []);
    }
    sectionMap.get(sectionTitle)!.push(faq);
  });

  // Convert to sections array with priorities
  sectionMap.forEach((items, title) => {
    const sortedItems = [...items].sort((a, b) => a.display_order - b.display_order);
    const contentType = sortedItems[0]?.content_type || 'faq';
    
    // Assign priorities (lower number = higher priority)
    let priority = 5; // Default for FAQ sections
    if (title.includes('About')) priority = 1;
    else if (title.includes('Applications')) priority = 2;
    else if (title.includes('Unique')) priority = 3;
    else if (title.includes('Tips')) priority = 4;
    
    sections.push({
      title,
      items: sortedItems,
      type: contentType,
      priority
    });
  });

  // Sort sections by priority
  sections.sort((a, b) => a.priority - b.priority);

  const getSectionIcon = (sectionTitle: string) => {
    if (sectionTitle.includes('About')) return '📖';
    if (sectionTitle.includes('Applications') || sectionTitle.includes('Industries')) return '🏭';
    if (sectionTitle.includes('Unique') || sectionTitle.includes('Apps') || sectionTitle.includes('Tools')) return '🛠️';
    if (sectionTitle.includes('Tips') || sectionTitle.includes('Tricks')) return '💡';
    return '❓'; // Default for FAQ sections
  };

  const renderFAQSection = (section: FAQSection) => (
    <div key={section.title} className="mb-12">
      <div className="flex items-center mb-6">
        <span className="text-2xl mr-3">{getSectionIcon(section.title)}</span>
        <h3 className="text-2xl font-bold text-text-primary">
          {section.title.replace('{categoryName}', categoryName)}
        </h3>
      </div>

      <div className="space-y-4">
        {section.items.map((faq) => {
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
                <h4 className="font-semibold text-text-primary pr-4">
                  {faq.question.replace('{categoryName}', categoryName)}
                </h4>
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
                isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 py-4 bg-card-bg/30 border-t border-card-border">
                  <div className="text-text-secondary leading-relaxed prose prose-sm max-w-none">
                    {faq.answer.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="mb-3 last:mb-0">
                          {paragraph.replace(/\{categoryName\}/g, categoryName)}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderContentSection = (section: FAQSection) => (
    <div key={section.title} className="mb-12">
      <div className="flex items-center mb-6">
        <span className="text-2xl mr-3">{getSectionIcon(section.title)}</span>
        <h3 className="text-2xl font-bold text-text-primary">
          {section.title.replace('{categoryName}', categoryName)}
        </h3>
      </div>

      <div className="bg-card-bg/40 rounded-xl p-6 border border-card-border/50">
        {section.items.map((item, index) => (
          <div key={item.id} className={index > 0 ? 'mt-6 pt-6 border-t border-card-border/30' : ''}>
            <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed">
              {item.answer.split('\n').map((paragraph, pIndex) => (
                paragraph.trim() && (
                  <p key={pIndex} className="mb-4 last:mb-0">
                    {paragraph.replace(/\{categoryName\}/g, categoryName)}
                  </p>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 mb-8">
      <div className="flex items-center mb-8">
        <span className="text-2xl mr-3">💬</span>
        <h2 className="text-3xl font-bold text-text-primary">
          {categoryName} Knowledge Center
        </h2>
      </div>

      {/* Render all sections */}
      {sections.map(section => 
        section.type === 'faq' 
          ? renderFAQSection(section)
          : renderContentSection(section)
      )}

      {/* Additional Help Section */}
      <div className="mt-8 pt-6 border-t border-card-border">
        <div className="text-center">
          <p className="text-text-secondary mb-4">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/info/contact-us"
              className="inline-flex items-center px-4 py-2 bg-brand-light/10 text-brand-light hover:bg-brand-light/20 rounded-lg transition-all duration-200 font-medium"
            >
              <span className="mr-2">📧</span>
              Contact Support
            </a>
            <a
              href="/submission/coupon/add"
              className="inline-flex items-center px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-all duration-200 font-medium"
            >
              <span className="mr-2">🎁</span>
              Submit a Deal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}