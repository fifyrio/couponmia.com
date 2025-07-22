'use client';

import { useState, useEffect } from 'react';
import { Star } from '../common/Icons';
import { getFeaturedReviews } from '@/lib/api';
import type { Review } from '@/lib/supabase';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getFeaturedReviews(4);
        setReviews(data);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        // Fallback to mock data
        setReviews([
          {
            id: '1',
            rating: 5,
            title: "We go to our online customer review",
            content: "Great value, good shopping deals and coupons to people. I have tons of money compared to the best shopping experience!",
            author_name: "Jennifer",
            is_featured: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            rating: 4, 
            title: "We thought about stores information,",
            content: "This site is super helpful because it has coupons. I have learned about shopping information about them in the store.",
            author_name: "Sarah",
            is_featured: true,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            rating: 5,
            title: "It's really good! I needed a fast information.",
            content: "This is absolutely the best store I have. I have been looking for deals for quite some time and found this app!",
            author_name: "Stephanie",
            is_featured: true,
            created_at: new Date().toISOString()
          },
          {
            id: '4',
            rating: 4,
            title: "Definitely a trustworthy service.",
            content: "Everyone who is looking for discounts should definitely come here. It really is saving me hundreds of dollars!",
            author_name: "Frank",
            is_featured: true,
            created_at: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex mb-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          className={`${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-8 text-text-primary">Reviews About CouponMia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-8 text-text-primary">Reviews About CouponMia</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reviews.map((review, index) => (
          <div key={index} className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <StarRating rating={review.rating} />
            <div className="font-semibold text-sm mb-3 text-text-primary">{review.title}</div>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">{review.content}</p>
            <p className="text-sm text-brand-accent font-medium">{review.author_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}