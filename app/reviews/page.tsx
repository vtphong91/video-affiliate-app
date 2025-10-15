'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Menu, X, Home, FileText, Phone, Mail, ArrowRight, Star, Users, Zap, Search, Filter } from 'lucide-react';

interface Review {
  id: string;
  video_title: string;
  video_thumbnail: string;
  summary: string;
  slug: string;
  created_at: string;
  views: number;
  status: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default function ReviewsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // Use public API endpoint (no authentication required)
      const response = await fetch('/api/reviews-public');
      const data = await response.json();
      console.log('Reviews API response:', data);
      if (data.success) {
        setReviews(data.data?.reviews || data.data || []);
      } else {
        console.error('Failed to fetch reviews:', data.error);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews
    .filter(review => {
      // Search filter
      const matchesSearch = review.video_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by selected option
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'views':
          return b.views - a.views;
        case 'title':
          return a.video_title.localeCompare(b.video_title);
        default:
          return 0;
      }
    });

  // Pagination logic
  const totalItems = filteredReviews.length;
  const totalPagesCalculated = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  // Update total pages when filtered reviews change
  React.useEffect(() => {
    setTotalPages(totalPagesCalculated);
    if (currentPage > totalPagesCalculated && totalPagesCalculated > 0) {
      setCurrentPage(1);
    }
  }, [totalPagesCalculated, currentPage]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header với Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">VideoAffiliate</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <Home className="w-4 h-4" />
                <span>Trang chủ</span>
              </Link>
              <Link href="/reviews" className="flex items-center space-x-1 text-blue-600 font-medium">
                <FileText className="w-4 h-4" />
                <span>Reviews</span>
              </Link>
              <Link href="/about" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <Users className="w-4 h-4" />
                <span>Giới thiệu</span>
              </Link>
              <Link href="/contact" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <Phone className="w-4 h-4" />
                <span>Liên hệ</span>
              </Link>
            </nav>

            {/* CTA Button */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
                <Link href="/" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">
                  <Home className="w-4 h-4" />
                  <span>Trang chủ</span>
                </Link>
                <Link href="/reviews" className="flex items-center space-x-2 px-3 py-2 text-blue-600 font-medium hover:bg-gray-50 rounded-md">
                  <FileText className="w-4 h-4" />
                  <span>Reviews</span>
                </Link>
                <Link href="/about" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">
                  <Users className="w-4 h-4" />
                  <span>Giới thiệu</span>
                </Link>
                <Link href="/contact" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">
                  <Phone className="w-4 h-4" />
                  <span>Liên hệ</span>
                </Link>
                <div className="px-3 py-2">
                  <Link 
                    href="/dashboard" 
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Page Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tất cả Reviews
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá các bài review sản phẩm được tạo bởi AI từ video YouTube và TikTok
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {filteredReviews.length} reviews
              </span>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Lọc</span>
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="draft">Bản nháp</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sắp xếp theo
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="views">Lượt xem</option>
                    <option value="title">Tên A-Z</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setSortBy('newest');
                    }}
                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải reviews...</p>
              </div>
            ) : paginatedReviews.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có reviews nào</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Không tìm thấy reviews phù hợp với từ khóa của bạn.' : 'Chưa có reviews nào được tạo.'}
                </p>
                <Link 
                  href="/dashboard/create" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                >
                  <span>Tạo review đầu tiên</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                {/* Reviews Grid - 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {paginatedReviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-shadow">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gray-200 rounded-t-xl overflow-hidden relative">
                        {review.video_thumbnail ? (
                          <img 
                            src={review.video_thumbnail} 
                            alt={review.video_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <FileText className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        {/* Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="bg-purple-600 text-white px-2 py-1 text-xs rounded-full">
                            {review.categories?.name || 'Danh mục'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Metadata */}
                        <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
                          <span>AI Review</span>
                          <span>{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                          {review.video_title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {review.summary}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{review.views} lượt xem</span>
                            <span>0 clicks</span>
                          </div>
                          <Link 
                            href={`/review/${review.slug}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                          >
                            <span>Đọc thêm</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ←
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1">
            {/* AI Reviewer Profile */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">AI Reviewer</h3>
                <p className="text-sm text-gray-600 mb-3">Reflective Blogger</p>
                <p className="text-sm text-gray-600 mb-4">
                  Tôi chia sẻ những đánh giá sâu sắc về sản phẩm, công nghệ và cuộc sống. 
                  Khám phá nội dung được tạo bởi AI để có những lựa chọn thông minh hơn.
                </p>
                <div className="space-y-2">
                  <Link 
                    href="/" 
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm block text-center"
                  >
                    Trang chủ
                  </Link>
                  <Link 
                    href="/reviews" 
                    className="w-full border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm block text-center"
                  >
                    Xem thêm
                  </Link>
                </div>
              </div>
            </div>

            {/* Featured Reviews */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Reviews nổi bật</h3>
              </div>
              <div className="space-y-4">
                {filteredReviews
                  .sort((a, b) => b.views - a.views) // Sort by views descending
                  .slice(0, 3)
                  .map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <Link 
                        href={`/review/${review.slug}`}
                        className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden">
                            {review.video_thumbnail ? (
                              <img 
                                src={review.video_thumbnail} 
                                alt={review.video_title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <FileText className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                            {review.video_title}
                          </h4>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            <span>{review.views} lượt xem</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>
              <div className="space-y-2">
                {[
                  { name: 'Công nghệ', count: 0 },
                  { name: 'Điện gia dụng', count: 0 },
                  { name: 'Gia dụng', count: 1 },
                  { name: 'Làm đẹp', count: 0 },
                  { name: 'Nhà cửa', count: 0 },
                  { name: 'Sức khỏe', count: 0 },
                  { name: 'Thể thao', count: 0 },
                  { name: 'Thời trang', count: 0 },
                  { name: 'Xe máy', count: 0 },
                ].map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">({category.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Newsletter Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscribe to our Newsletter</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Nhận thông báo về các review mới và xu hướng sản phẩm hot nhất
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter Your Email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VideoAffiliate</span>
              </div>
              <p className="text-gray-400 mb-4">
                Nền tảng tự động hóa affiliate marketing hàng đầu với công nghệ AI tiên tiến. 
                Giúp bạn tạo nội dung chất lượng và tối ưu hóa doanh thu.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Trang chủ</Link></li>
                <li><Link href="/reviews" className="text-gray-400 hover:text-white transition-colors">Reviews</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">Giới thiệu</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Liên hệ</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>support@videoaffiliate.com</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>+84 123 456 789</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VideoAffiliate. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
