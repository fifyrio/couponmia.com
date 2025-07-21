"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from '../common/Icons';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is CouponMia.com?",
      answer: "CouponMia.com is a comprehensive coupon and deals aggregator that helps users find the best discounts, promo codes, and special offers from thousands of online retailers. We curate and verify deals to ensure you get the most savings on your purchases."
    },
    {
      question: "How does CouponMia collect and verify deals?",
      answer: "We use advanced algorithms and manual verification processes to collect deals from various sources including retailer websites, affiliate networks, and user submissions. Each deal is verified for validity and current availability before being published."
    },
    {
      question: "Are all coupons and deals on CouponMia free to use?",
      answer: "Yes, all coupons and deals featured on CouponMia are completely free to use. We don't charge any fees for accessing our coupon database. Simply copy the code or click through to the retailer to apply the discount."
    },
    {
      question: "How do I use a coupon code found on CouponMia?",
      answer: "To use a coupon code, simply copy the code from our website and paste it into the promo code field during checkout on the retailer's website. For deals that require clicking through, just click the 'Get Deal' button to be redirected with the discount automatically applied."
    },
    {
      question: "Why does my coupon code doesn't work?",
      answer: "Coupon codes may not work due to expiration, regional restrictions, minimum purchase requirements, or exclusions on certain products. Always check the terms and conditions, and ensure you're using the code before the expiration date."
    },
    {
      question: "How often are new deals and coupons added?",
      answer: "We update our database multiple times daily with new deals and coupons. Our team works around the clock to ensure you have access to the latest and most relevant offers from your favorite retailers."
    },
    {
      question: "What if there are no active coupons available?",
      answer: "If no active coupons are available for a specific retailer, we recommend checking back regularly as new deals are added frequently. You can also sign up for our newsletter to receive notifications about new coupons."
    },
    {
      question: "Can I submit a coupon on deal I found?",
      answer: "Absolutely! We welcome user submissions. If you find a great deal or coupon that's not on our site, you can submit it through our submission form. Our team will verify and add it to our database if it meets our quality standards."
    },
    {
      question: "What types of products and services can I find deals from?",
      answer: "You can find deals on virtually everything including electronics, clothing, home goods, travel, food delivery, subscription services, and much more. We partner with thousands of retailers across all major categories."
    },
    {
      question: "Is my personal information and finance safe posted?",
      answer: "Yes, your privacy and security are our top priorities. We never store your personal financial information. When you click through to make a purchase, you're dealing directly with the retailer's secure checkout system."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-8 text-text-primary px-4">FAQ About CouponMia</h2>
      
      <div className="bg-card-bg/90 backdrop-blur-sm border-t border-b border-card-border shadow-lg overflow-hidden">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-card-border last:border-b-0">
            <div 
              className="flex items-center justify-between p-5 hover:bg-brand-lightest/30 cursor-pointer transition-all duration-200"
              onClick={() => toggleFAQ(index)}
            >
              <span className="text-sm text-text-secondary font-medium">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="text-brand-accent w-2 h-2" />
              ) : (
                <ChevronDown className="text-brand-accent w-2 h-2" />
              )}
            </div>
            {openIndex === index && (
              <div className="px-5 pb-5">
                <p className="text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}