'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/layout/HeroSection';
import { TrendingTopics } from '@/components/layout/TrendingTopics';
import { ArticleGrid } from '@/components/layout/ArticleGrid';
import { Sidebar } from '@/components/layout/Sidebar';
import { NewsletterSection } from '@/components/layout/NewsletterSection';
import { Footer } from '@/components/layout/Footer';
import { Pagination } from '@/components/layout/Pagination';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [totalPages, setTotalPages] = useState(1); // Khởi tạo với 1

  useEffect(() => {
    fetchTotalPages();
  }, [selectedCategory]); // Fetch total pages khi category thay đổi

  const fetchTotalPages = async () => {
    try {
      const params = new URLSearchParams({
        page: '1', // Chỉ cần lấy tổng số trang, không cần dữ liệu bài viết
        limit: '8'
      });
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();
      if (data.success && data.pagination) {
        setTotalPages(data.pagination.totalPages);
      } else {
        setTotalPages(1); // Fallback nếu có lỗi
      }
    } catch (error) {
      console.error('Error fetching total pages:', error);
      setTotalPages(1); // Fallback nếu có lỗi
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page when changing category
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Trending Topics */}
      <TrendingTopics onTopicChange={handleCategoryChange} />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Article Grid - Takes 3 columns */}
          <div className="lg:col-span-3">
            <ArticleGrid 
              currentPage={currentPage}
              onPageChange={handlePageChange}
              selectedCategory={selectedCategory}
            />
            
            {/* Pagination */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
          
          {/* Sidebar - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Sidebar />
          </div>
        </div>
      </main>
      
      {/* Newsletter Section */}
      <NewsletterSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}