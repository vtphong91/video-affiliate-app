'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Eye, MousePointer, Calendar, Loader2, User, TrendingUp } from 'lucide-react';
import type { Review, Category } from '@/types';

export default function BlogPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch published reviews
      const reviewsRes = await fetch('/api/reviews?status=published');
      const reviewsData = await reviewsRes.json();

      // Fetch categories
      const categoriesRes = await fetch('/api/categories');
      const categoriesData = await categoriesRes.json();

      if (reviewsData.success) {
        setReviews(reviewsData.reviews);
      }

      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    return !selectedCategory || review.category_id === selectedCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getCategoryById = (categoryId?: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  // Get top reviews by views
  const topReviews = [...reviews].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Video className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">VideoReviews</span>
            </Link>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="ghost">Trang chủ</Button>
              </Link>
              <Link href="/blog">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Tất cả Reviews
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Heartfelt <span className="text-blue-600">Reflections</span>: Đánh Giá
            <br />
            Sản Phẩm Chân Thực
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá những review chất lượng được tạo bởi AI và con người.
            Tìm sản phẩm phù hợp với bạn qua các đánh giá chi tiết và chân thực.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b py-6">
        <div className="container mx-auto px-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 text-center">
            Explore Trending Topics
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-3">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('')}
              className="rounded-full"
            >
              <Video className="w-4 h-4 mr-2" />
              Tất cả
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full"
                style={{
                  backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
                  borderColor: selectedCategory === category.id ? category.color : '#e5e7eb',
                  color: selectedCategory === category.id ? 'white' : '#374151',
                }}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Reviews Grid - 2/3 width */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-20">
                <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Không tìm thấy reviews</h3>
                <p className="text-gray-600">
                  {selectedCategory
                    ? 'Chọn danh mục khác để xem thêm reviews'
                    : 'Chưa có review nào được publish'}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredReviews.map((review) => {
                  const category = getCategoryById(review.category_id);

                  return (
                    <Card
                      key={review.id}
                      className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg group"
                    >
                      <Link href={`/review/${review.slug}`}>
                        <div className="grid md:grid-cols-5 gap-0">
                          {/* Image Section */}
                          <div className="md:col-span-2 relative">
                            <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
                              {category && (
                                <Badge
                                  className="backdrop-blur-sm"
                                  style={{
                                    backgroundColor: category.color,
                                    color: 'white',
                                  }}
                                >
                                  {category.icon} {category.name}
                                </Badge>
                              )}
                              <Badge className="bg-purple-600 text-white">
                                Reviews
                              </Badge>
                            </div>
                            <img
                              src={review.video_thumbnail}
                              alt={review.video_title}
                              className="w-full h-full min-h-[280px] object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>

                          {/* Content Section */}
                          <div className="md:col-span-3 p-6 bg-white flex flex-col justify-between">
                            <div>
                              {/* Author & Date */}
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <User className="h-4 w-4" />
                                  <span className="font-medium">AI Review</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(review.created_at)}
                                </div>
                              </div>

                              {/* Title */}
                              <h3 className="font-bold text-2xl mb-3 line-clamp-2 group-hover:text-blue-600 transition">
                                {review.custom_title || review.video_title}
                              </h3>

                              {/* Summary */}
                              <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4">
                                {review.summary}
                              </p>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span>{review.views} lượt xem</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MousePointer className="h-4 w-4" />
                                <span>{review.clicks} clicks</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="lg:col-span-1 space-y-6">
            {/* About Section */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Reviewer</h3>
                    <p className="text-sm text-gray-600">Reflective Blogger</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Tôi chia sẻ những đánh giá sâu sắc về sản phẩm, công nghệ và cuộc sống.
                  Khám phá nội dung được tạo bởi AI để có những lựa chọn thông minh hơn.
                </p>
                <div className="flex gap-2">
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Trang chủ
                    </Button>
                  </Link>
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Featured Posts */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Reviews nổi bật
                </h3>
                <div className="space-y-4">
                  {topReviews.slice(0, 5).map((review) => {
                    const category = getCategoryById(review.category_id);
                    return (
                      <Link
                        key={review.id}
                        href={`/review/${review.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <img
                            src={review.video_thumbnail}
                            alt={review.video_title}
                            className="w-20 h-16 object-cover rounded group-hover:scale-105 transition"
                          />
                          <div className="flex-1 min-w-0">
                            {category && (
                              <Badge
                                className="mb-1 text-xs"
                                style={{ backgroundColor: category.color, color: 'white' }}
                              >
                                {category.icon}
                              </Badge>
                            )}
                            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition">
                              {review.custom_title || review.video_title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Eye className="w-3 h-3" />
                              {review.views}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Danh mục</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="mr-2">{cat.icon}</span>
                      <span className="flex-1">{cat.name}</span>
                      <span className="text-gray-400 text-xs">
                        {reviews.filter(r => r.category_id === cat.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16 mt-12">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Subscribe to our Newsletter</h2>
          <p className="text-gray-600 mb-6">
            Nhận thông báo về các review mới và xu hướng sản phẩm hot nhất
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter Your Email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 px-6">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Video className="h-6 w-6" />
                <span className="text-xl font-bold">VideoReviews</span>
              </div>
              <p className="text-gray-400 text-sm">
                Nền tảng đánh giá sản phẩm qua video được hỗ trợ bởi AI.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Homepages</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition">Landing</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {categories.slice(0, 4).map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setSelectedCategory(cat.id)}
                      className="hover:text-white transition"
                    >
                      {cat.icon} {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Pages</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition">Trang chủ</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Reviews</Link></li>
                <li><Link href="/dashboard/categories" className="hover:text-white transition">Danh mục</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 - VideoReviews. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
