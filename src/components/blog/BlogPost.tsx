'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MDXProvider } from '@mdx-js/react';

interface TableOfContentsItem {
  id: string;
  title: string;
}

interface FeaturedCoupon {
  store: string;
  title: string;
  discount: string;
}

interface BlogPostProps {
  title: string;
  publishDate: string;
  readTime: string;
  author: string;
  category: string;
  featuredImage: string;
  excerpt: string;
  tableOfContents: TableOfContentsItem[];
  content: string;
  featuredCoupons: FeaturedCoupon[];
  featuredStores: unknown[];
}

export default function BlogPost({
  title,
  publishDate,
  readTime,
  author,
  category,
  featuredImage,
  excerpt,
  tableOfContents,
  content,
  featuredCoupons
}: BlogPostProps) {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.map(item => document.getElementById(item.id)).filter(Boolean);
      const currentSection = sections.find(section => {
        if (!section) return false;
        const rect = section.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= window.innerHeight / 2;
      });
      
      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tableOfContents]);

  const components = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white" {...props} />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-8 text-purple-300" {...props} />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className="text-xl md:text-2xl font-semibold mb-3 mt-6 text-purple-200" {...props} />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="text-gray-300 leading-relaxed mb-4" {...props} />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="text-gray-300 mb-4 pl-6 space-y-2" {...props} />
    ),
    li: (props: React.HTMLAttributes<HTMLLIElement>) => (
      <li className="list-disc" {...props} />
    ),
    strong: (props: React.HTMLAttributes<HTMLElement>) => (
      <strong className="text-white font-semibold" {...props} />
    ),
    blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote className="border-l-4 border-purple-500 bg-purple-900/20 p-4 my-6 italic text-purple-100" {...props} />
    ),
    code: (props: React.HTMLAttributes<HTMLElement>) => (
      <code className="bg-gray-800 text-purple-300 px-2 py-1 rounded text-sm" {...props} />
    ),
    hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
      <hr className="border-gray-700 my-8" {...props} />
    )
  };

  const processContent = (content: string) => {
    const lines = content.split('\n');
    const processedLines: React.ReactElement[] = [];

    lines.forEach((line, index) => {
      if (line.trim() === '') {
        processedLines.push(<br key={`br-${index}`} />);
        return;
      }

      // Headers
      if (line.startsWith('# ')) {
        const text = line.substring(2);
        const match = text.match(/^(.*?)\s*\{#([^}]+)\}$/);
        if (match) {
          processedLines.push(
            <h1 key={index} id={match[2]} className="text-3xl md:text-4xl font-bold mb-6 text-white scroll-mt-8">
              {match[1]}
            </h1>
          );
        } else {
          processedLines.push(
            <h1 key={index} className="text-3xl md:text-4xl font-bold mb-6 text-white">
              {text}
            </h1>
          );
        }
      } else if (line.startsWith('## ')) {
        const text = line.substring(3);
        processedLines.push(
          <h2 key={index} className="text-2xl md:text-3xl font-bold mb-4 mt-8 text-purple-300">
            {text}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        const text = line.substring(4);
        processedLines.push(
          <h3 key={index} className="text-xl md:text-2xl font-semibold mb-3 mt-6 text-purple-200">
            {text}
          </h3>
        );
      }
      // Blockquotes
      else if (line.startsWith('> ')) {
        const text = line.substring(2);
        processedLines.push(
          <blockquote key={index} className="border-l-4 border-purple-500 bg-purple-900/20 p-4 my-6 italic text-purple-100">
            {parseInlineContent(text)}
          </blockquote>
        );
      }
      // Lists
      else if (line.startsWith('- ')) {
        const text = line.substring(2);
        processedLines.push(
          <li key={index} className="list-disc ml-6 text-gray-300 mb-2">
            {parseInlineContent(text)}
          </li>
        );
      }
      // Horizontal rule
      else if (line.trim() === '---') {
        processedLines.push(<hr key={index} className="border-gray-700 my-8" />);
      }
      // Regular paragraphs
      else {
        processedLines.push(
          <p key={index} className="text-gray-300 leading-relaxed mb-4">
            {parseInlineContent(line)}
          </p>
        );
      }
    });

    return processedLines;
  };

  const parseInlineContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      } else if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-gray-800 text-purple-300 px-2 py-1 rounded text-sm">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-black/40" />
        <Image
          src={featuredImage}
          alt={title}
          fill
          className="object-cover mix-blend-overlay"
        />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {category}
              </span>
              <span className="text-gray-300">{publishDate}</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-300">{readTime}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              {title}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              {excerpt}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4 text-purple-300">Table of Contents</h3>
                <nav className="space-y-2">
                  {tableOfContents.map((item) => (
                    <Link
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-sm hover:text-purple-400 transition-colors ${
                        activeSection === item.id ? 'text-purple-400 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Featured Coupons Widget */}
              {featuredCoupons.length > 0 && (
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20 mt-6">
                  <h3 className="text-lg font-semibold mb-4 text-yellow-400">🔥 Today&apos;s Hot Deals</h3>
                  <div className="space-y-3">
                    {featuredCoupons.slice(0, 3).map((coupon, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-semibold text-white truncate">{coupon.store}</div>
                        <div className="text-purple-300 truncate">{coupon.title}</div>
                        <div className="text-yellow-400 font-bold">{coupon.discount}</div>
                      </div>
                    ))}
                  </div>
                  <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-4 block">
                    View All Deals →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="prose prose-invert max-w-none">
              <MDXProvider components={components}>
                <div className="blog-content">
                  {processContent(content)}
                </div>
              </MDXProvider>
            </article>

            {/* Author Info */}
            <div className="mt-12 p-6 bg-gray-900/50 rounded-xl border border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">CM</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{author}</h4>
                  <p className="text-gray-400">
                    Expert savings strategist with over 10 years of experience helping consumers maximize their purchasing power through smart coupon strategies.
                  </p>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6 text-purple-300">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Top 10 Cashback Apps That Actually Pay",
                    excerpt: "Compare the best cashback apps and learn which ones provide the highest returns for your shopping habits.",
                    category: "Tools & Apps"
                  },
                  {
                    title: "Black Friday Strategy Guide 2024",
                    excerpt: "Plan your Black Friday shopping with our comprehensive guide to the best deals and timing strategies.",
                    category: "Seasonal Savings"
                  }
                ].map((article, index) => (
                  <div key={index} className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                    <span className="text-purple-400 text-sm font-medium">{article.category}</span>
                    <h4 className="text-lg font-semibold text-white mt-2 mb-3">{article.title}</h4>
                    <p className="text-gray-400 text-sm mb-4">{article.excerpt}</p>
                    <Link href="#" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                      Read More →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-t border-gray-800">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Get More Money-Saving Tips</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of smart shoppers who receive our weekly newsletter with exclusive coupon codes, 
            flash sales, and insider savings strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-purple-500"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors">
              Subscribe Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}