"use client";

import { useMemo } from 'react';
import { Star } from '../common/Icons';
import { useMessages, useTranslations, type AbstractIntlMessages } from 'next-intl';

interface Review {
  rating?: number;
  title: string;
  content: string;
  author_name: string;
}

type ReviewMessages = AbstractIntlMessages & {
  home?: {
    reviews?: {
      title?: string;
      items?: { title?: string; content?: string; author?: string }[];
    };
  };
};

const fallbackReviews: Review[] = [
  {
    rating: 5,
    title: "We go to our online customer review",
    content: "Great value, good shopping deals and coupons to people. I have tons of money compared to the best shopping experience!",
    author_name: "Jennifer"
  },
  {
    rating: 4,
    title: "We thought about stores information,",
    content: "This site is super helpful because it has coupons. I have learned about shopping information about them in the store.",
    author_name: "Sarah"
  },
  {
    rating: 5,
    title: "It's really good! I needed a fast information.",
    content: "This is absolutely the best store I have. I have been looking for deals for quite some time and found this app!",
    author_name: "Stephanie"
  },
  {
    rating: 4,
    title: "Definitely a trustworthy service.",
    content: "Everyone who is looking for discounts should definitely come here. It really is saving me hundreds of dollars!",
    author_name: "Frank"
  }
];

export default function Reviews() {
  const t = useTranslations('home.reviews');
  const messages = useMessages();
  const reviewMessages = (messages as ReviewMessages).home?.reviews;

  const reviews = useMemo<Review[]>(() => {
    if (reviewMessages?.items?.length) {
      return reviewMessages.items.map((item, index) => ({
        rating: fallbackReviews[index]?.rating ?? 5,
        title: item.title ?? fallbackReviews[index]?.title ?? '',
        content: item.content ?? fallbackReviews[index]?.content ?? '',
        author_name: item.author ?? fallbackReviews[index]?.author_name ?? ''
      }));
    }
    return fallbackReviews;
  }, [reviewMessages]);

  const title = reviewMessages?.title ?? t('title');

  const StarRating = ({ rating = 5 }: { rating?: number }) => (
    <div className="flex mb-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          className={`${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      ))}
    </div>
  );

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-8 text-text-primary">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reviews.map((review, index) => (
          <div key={review.title ?? index} className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <StarRating rating={review.rating ?? 5} />
            <div className="font-semibold text-sm mb-3 text-text-primary">{review.title}</div>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">{review.content}</p>
            <p className="text-sm text-brand-accent font-medium">{review.author_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
