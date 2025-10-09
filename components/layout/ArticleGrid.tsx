'use client';

import { useState, useEffect } from 'react';
import { ArticleCard } from './ArticleCard';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  imageUrl?: string;
  backgroundColor: string;
  slug: string;
  views: number;
  clicks: number;
}

interface ArticleGridProps {
  currentPage?: number;
  onPageChange?: (page: number) => void;
  selectedCategory?: string;
}

export function ArticleGrid({ currentPage = 1, onPageChange, selectedCategory }: ArticleGridProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, [currentPage, selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '8'
      });
      
      // Only add category filter if it's not 'all' or empty
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.articles);
      } else {
        setError('Failed to load articles');
        // Fallback to mock data
        setArticles(getMockArticles());
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles');
      // Fallback to mock data
      setArticles(getMockArticles());
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string): string => {
    const categoryMap: { [key: string]: string } = {
      'cong-nghe': 'Công nghệ',
      'dien-gia-dung': 'Điện gia dụng',
      'gia-dung': 'Gia dụng',
      'lam-dep': 'Làm đẹp',
      'nha-cua': 'Nhà cửa',
      'suc-khoe': 'Sức khỏe',
      'the-thao': 'Thể thao',
      'thoi-trang': 'Thời trang',
      'xe-may': 'Xe máy',
      'kinh-doanh': 'Kinh doanh',
      'du-lich': 'Du lịch'
    };
    return categoryMap[categoryId] || categoryId;
  };

  const getMockArticles = (): Article[] => [
    {
      id: '1',
      title: 'AI in Business Management: Improving Efficiency and Decision Making',
      excerpt: 'How AI is revolutionizing business operations and decision-making processes.',
      category: 'Business',
      author: 'AI Content Creator',
      date: 'Dec 15, 2024',
      backgroundColor: 'bg-gradient-to-br from-blue-400 to-purple-500',
      slug: 'ai-business-management',
      views: 1250,
      clicks: 89
    },
    {
      id: '2',
      title: 'The Future of Remote Work: Technology Trends',
      excerpt: 'Exploring the latest technology trends shaping the future of remote work.',
      category: 'Technology',
      author: 'Tech Analyst',
      date: 'Dec 14, 2024',
      backgroundColor: 'bg-gradient-to-br from-green-400 to-blue-500',
      slug: 'future-remote-work',
      views: 980,
      clicks: 67
    },
    {
      id: '3',
      title: 'Sustainable Travel: Eco-Friendly Adventures',
      excerpt: 'Discover how to travel sustainably while exploring the world.',
      category: 'Travel',
      author: 'Travel Expert',
      date: 'Dec 13, 2024',
      backgroundColor: 'bg-gradient-to-br from-orange-400 to-red-500',
      slug: 'sustainable-travel',
      views: 756,
      clicks: 45
    },
    {
      id: '4',
      title: 'Startup Success Stories: Lessons Learned',
      excerpt: 'Real stories from successful startups and the lessons they learned.',
      category: 'Startups',
      author: 'Entrepreneur',
      date: 'Dec 12, 2024',
      backgroundColor: 'bg-gradient-to-br from-purple-400 to-pink-500',
      slug: 'startup-success-stories',
      views: 1100,
      clicks: 78
    },
    {
      id: '5',
      title: 'Digital Marketing Trends for 2024',
      excerpt: 'The latest digital marketing trends that will shape 2024.',
      category: 'Marketing',
      author: 'Marketing Pro',
      date: 'Dec 11, 2024',
      backgroundColor: 'bg-gradient-to-br from-indigo-400 to-purple-500',
      slug: 'digital-marketing-trends',
      views: 890,
      clicks: 56
    },
    {
      id: '6',
      title: 'Health Tech Innovations: Improving Lives',
      excerpt: 'How health technology is improving lives and healthcare delivery.',
      category: 'Health',
      author: 'Health Tech Expert',
      date: 'Dec 10, 2024',
      backgroundColor: 'bg-gradient-to-br from-teal-400 to-green-500',
      slug: 'health-tech-innovations',
      views: 1340,
      clicks: 92
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-xl"></div>
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😔</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load articles</h3>
        <p className="text-gray-600 mb-4">There was an error loading the latest articles.</p>
        <button 
          onClick={fetchArticles}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            id={article.id}
            title={article.title}
            excerpt={article.excerpt}
            category={article.category}
            author={article.author}
            date={article.date}
            imageUrl={article.imageUrl}
            backgroundColor={article.backgroundColor}
            imageComponent={
              !article.imageUrl ? (
                <div className="text-center text-white">
                  <div className="text-6xl mb-2">📱</div>
                  <div className="text-sm opacity-90">
                    {article.views} views • {article.clicks} clicks
                  </div>
                </div>
              ) : undefined
            }
          />
        ))}
      </div>

      {articles.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {selectedCategory && selectedCategory !== 'all' 
              ? `Chưa có bài reviews nào trong danh mục "${getCategoryName(selectedCategory)}"`
              : 'Chưa có bài reviews nào'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {selectedCategory && selectedCategory !== 'all'
              ? 'Hãy thử chọn danh mục khác để xem thêm bài reviews.'
              : 'Các bài reviews sẽ được cập nhật sớm nhất.'
            }
          </p>
        </div>
      )}
    </div>
  );
}