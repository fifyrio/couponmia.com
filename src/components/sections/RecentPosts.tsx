'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getRecentPosts } from '@/lib/api';

interface Post {
  title: string;
  date: string;
  image: string;
}

export default function RecentPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getRecentPosts(5);
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch recent posts:', error);
        // Fallback to mock data
        setPosts([
          {
            title: "How to Register Using a Phone Number at Garmin Calculator",
            date: "December 20, 2024",
            image: "/api/placeholder/300/200"
          },
          {
            title: "Save for Independents and Shoe Store! Holiday and Affordable Ideas from MAS",
            date: "December 19, 2024", 
            image: "/api/placeholder/300/200"
          },
          {
            title: "What to Read in Your Model Car - Your Ultimate Shopping Guide",
            date: "December 18, 2024",
            image: "/api/placeholder/300/200"
          },
          {
            title: "Playing Smart! How to Optimize Your Photography Use of a Lifetime Database",
            date: "December 17, 2024",
            image: "/api/placeholder/300/200"
          },
          {
            title: 'Unveiling "Song Kok Sang Mini" - Why This Seoul Sang Yum Yum!',
            date: "December 16, 2024",
            image: "/api/placeholder/300/200"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-8 text-text-primary">Recent Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-300"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-8 text-text-primary">Recent Posts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <article key={index} className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video bg-card-border relative overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-6">
              <div className="font-semibold text-sm mb-3 leading-relaxed line-clamp-3 text-text-primary">
                {post.title}
              </div>
              <p className="text-xs text-text-muted font-medium">{post.date}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}