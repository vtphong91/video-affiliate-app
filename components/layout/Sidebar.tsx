'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface FeaturedReview {
  id: string;
  title: string;
  views: number;
  imageUrl: string;
  category: string;
}

export function Sidebar() {
  const [featuredReviews, setFeaturedReviews] = useState<FeaturedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedReviews();
  }, []);

  const fetchFeaturedReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/articles?limit=4');
      const data = await response.json();

      if (data.success) {
        // Sort by views descending and take top 4
        const sortedReviews = data.articles
          .sort((a: any, b: any) => b.views - a.views)
          .slice(0, 4)
          .map((article: any) => ({
            id: article.id,
            title: article.title,
            views: article.views,
            imageUrl: article.imageUrl,
            category: article.category
          }));
        
        setFeaturedReviews(sortedReviews);
      }
    } catch (error) {
      console.error('Error fetching featured reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Reviewer Profile Card */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-start space-x-4">
          {/* AI Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            AI
          </div>
          
          {/* Profile Info */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">AI Reviewer</h3>
            <p className="text-sm text-gray-600 mb-3">Reflective Blogger</p>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Tôi chia sẻ những đánh giá sâu sắc về sản phẩm, công nghệ và cuộc sống. 
              Khám phá nội dung được tạo bởi AI để có những lựa chọn thông minh hơn.
            </p>
            
            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Trang chủ
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg text-sm hover:from-purple-600 hover:to-blue-700 transition-all">
                Xem thêm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Reviews */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center mb-4">
          <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center mr-2">
            <span className="text-blue-600 text-xs">↗</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Reviews nổi bật</h3>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex space-x-3 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {featuredReviews.map((review, index) => (
              <div key={review.id} className="flex space-x-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  {review.imageUrl ? (
                    <Image
                      src={review.imageUrl}
                      alt={review.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-lg">📱</span>
                    </div>
                  )}
                  
                  {/* Overlay icon for first item */}
                  {index === 0 && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs">▶</span>
                    </div>
                  )}
                  
                  {/* Overlay icon for third item */}
                  {index === 2 && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs">Y</span>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {review.title}
                  </h4>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="mr-1">👁</span>
                    <span>{review.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
