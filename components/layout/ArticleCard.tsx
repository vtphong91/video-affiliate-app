'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  imageUrl?: string;
  backgroundColor: string;
  imageComponent?: React.ReactNode;
}

export function ArticleCard({
  id,
  title,
  excerpt,
  category,
  author,
  date,
  imageUrl,
  backgroundColor,
  imageComponent
}: ArticleCardProps) {
  return (
    <article className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Image Section */}
      <div className="h-48 relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            onError={(e) => {
              // Fallback to background color if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.className = `h-48 ${backgroundColor} flex items-center justify-center relative`;
                parent.innerHTML = `
                  <div class="text-center text-gray-600">
                    <div class="text-4xl mb-2">📱</div>
                    <div class="text-sm">Video Thumbnail</div>
                  </div>
                `;
              }
            }}
          />
        ) : imageComponent ? (
          <div className={`h-full ${backgroundColor} flex items-center justify-center relative`}>
            {imageComponent}
          </div>
        ) : (
          <div className={`h-full ${backgroundColor} flex items-center justify-center relative`}>
            <div className="text-center text-gray-600">
              <div className="text-4xl mb-2">📱</div>
              <div className="text-sm">No Image</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        {/* Category Tags */}
        <div className="flex gap-2 mb-3">
          <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
            {category}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 hover:text-purple-600 transition-colors">
          <Link href={`/article/${id}`}>
            {title}
          </Link>
        </h3>
        
        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {excerpt}
        </p>
        
        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>{author}</span>
            <span>{date}</span>
          </div>
          <Link 
            href={`/article/${id}`}
            className="text-purple-600 hover:text-purple-700 transition-colors"
          >
            →
          </Link>
        </div>
      </div>
    </article>
  );
}
