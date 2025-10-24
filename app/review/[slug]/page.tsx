import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/lib/db/supabase';
import { ReviewPreview } from '@/components/ReviewPreview';
import { AuthButton } from '@/components/auth/AuthButton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, FileText, Tag, User } from 'lucide-react';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const review = await db.getReviewBySlug(params.slug);

    if (!review) {
      return {
        title: 'Review Not Found',
        description: 'The requested review could not be found.',
      };
    }

    const title = review.custom_title || review.video_title;
    const description = review.summary?.substring(0, 160) || 'Review content';
    const image = review.video_thumbnail;

    return {
      title: `${title} - Review Chi Tiết`,
      description,
      openGraph: {
        title,
        description,
        images: [image],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      keywords: review.seo_keywords,
    };
  } catch {
    return {
      title: 'Review Not Found',
    };
  }
}

export default async function ReviewLandingPage({ params }: PageProps) {
  let review;
  let relatedReviews: any[] = [];

  try {
    review = await db.getReviewBySlug(params.slug);

    if (!review) {
      notFound();
    }

    // Get related reviews (same category, published, exclude current)
    if (review.category_id) {
      const allReviews = await db.getReviews({
        status: 'published',
        limit: 4,
      });
      relatedReviews = allReviews
        .filter(r => r.category_id === review.category_id && r.id !== review.id)
        .slice(0, 3);
    }

    // TODO: Implement incrementViews method
    // await db.incrementViews(review.id);
  } catch (error) {
    console.error('Error loading review:', error);
    notFound();
  }

  // Convert database format to component props
  const videoInfo = {
    platform: review.video_platform,
    videoId: review.video_id,
    title: review.video_title,
    thumbnail: review.video_thumbnail,
    description: review.video_description || '',
    duration: '0:00', // Not stored in DB
    channelName: review.channel_name || '',
    channelUrl: review.channel_url || '',
  };

  const analysis = {
    summary: review.summary,
    pros: review.pros,
    cons: review.cons,
    keyPoints: review.key_points,
    comparisonTable: review.comparison_table,
    targetAudience: review.target_audience,
    cta: review.cta,
    seoKeywords: review.seo_keywords,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Navigation */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl">VideoAffiliate</span>
            </Link>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                <Home className="h-4 w-4" />
                <span>Trang chủ</span>
              </Link>
              <Link href="/reviews" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                <FileText className="h-4 w-4" />
                <span>Reviews</span>
              </Link>
              <Link href="/about" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                <User className="h-4 w-4" />
                <span>Giới thiệu</span>
              </Link>
              <Link href="/contact" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                <Tag className="h-4 w-4" />
                <span>Liên hệ</span>
              </Link>
            </nav>

            {/* CTA Button - Dynamic based on auth state */}
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <ReviewPreview
          videoInfo={videoInfo}
          analysis={analysis}
          affiliateLinks={review.affiliate_links}
          customTitle={review.custom_title}
          customContent={review.custom_content}
        />

        {/* Related Reviews Section */}
        {relatedReviews.length > 0 && (
          <section className="mt-12">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  📚 Reviews Liên Quan
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {relatedReviews.map((related) => (
                    <Link
                      key={related.id}
                      href={`/review/${related.slug}`}
                      className="group"
                    >
                      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                        <img
                          src={related.video_thumbnail}
                          alt={related.video_title}
                          className="w-full h-32 object-cover group-hover:scale-105 transition"
                        />
                        <div className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600 transition">
                            {related.custom_title || related.video_title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {related.video_platform === 'youtube' ? '📺 YouTube' : '🎵 TikTok'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Disclaimer Section */}
        <section className="mt-8">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                ⚠️ Miễn Trừ Trách Nhiệm
              </h3>
              <div className="text-sm text-amber-800 space-y-2">
                <p>
                  <strong>📹 Bản quyền video:</strong> Toàn bộ video được nhúng từ {' '}
                  <a
                    href={videoInfo.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-amber-900"
                  >
                    {videoInfo.channelName}
                  </a>
                  . Chúng tôi tôn trọng và ghi nhận đầy đủ bản quyền thuộc về tác giả gốc.
                </p>
                <p>
                  <strong>💭 Nội dung review:</strong> Những đánh giá và nhận xét trong bài viết được tổng hợp từ nhiều nguồn khác nhau, bao gồm trải nghiệm thực tế của người dùng, phân tích đặc điểm sản phẩm và thông tin công khai. Nội dung mang tính chất tham khảo và không đại diện cho quan điểm chính thức của thương hiệu.
                </p>
                <p>
                  <strong>🛒 Quyết định mua hàng:</strong> Bạn nên tự nghiên cứu kỹ và cân nhắc nhu cầu cá nhân trước khi quyết định mua sản phẩm. Chúng tôi khuyến khích bạn đọc thêm các review khác và tham khảo ý kiến từ nhiều nguồn khác nhau để có cái nhìn toàn diện nhất.
                </p>
                <p>
                  <strong>🤝 Liên kết affiliate:</strong> Một số liên kết trong bài có thể là liên kết tiếp thị liên kết (affiliate link). Khi bạn mua hàng qua các liên kết này, chúng tôi có thể nhận được hoa hồng nhỏ mà không làm tăng giá sản phẩm bạn phải trả. Điều này giúp chúng tôi duy trì hoạt động và tiếp tục cung cấp nội dung chất lượng miễn phí cho bạn.
                </p>
                <p className="text-xs text-amber-700 mt-3 italic">
                  Cảm ơn bạn đã tin tưởng và đọc bài review của chúng tôi! 💙
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg">VideoAffiliate</span>
              </div>
              <p className="text-sm text-gray-400">
                Nền tảng review sản phẩm từ video, giúp bạn đưa ra quyết định mua hàng thông minh hơn.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Liên Kết Nhanh</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition">Trang chủ</Link></li>
                <li><Link href="/reviews" className="hover:text-white transition">Tất cả Reviews</Link></li>
                <li><Link href="/about" className="hover:text-white transition">Giới thiệu</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Liên hệ</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-bold mb-4">Danh Mục</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/reviews" className="hover:text-white transition">Đồ gia dụng</Link></li>
                <li><Link href="/reviews" className="hover:text-white transition">Công nghệ</Link></li>
                <li><Link href="/reviews" className="hover:text-white transition">Làm đẹp</Link></li>
                <li><Link href="/reviews" className="hover:text-white transition">Sức khỏe</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">Liên Hệ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 Email: contact@videoaffiliate.com</li>
                <li>📱 Hotline: 1900-xxxx</li>
                <li>🌐 Website: videoaffiliate.com</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 VideoAffiliate. Nội dung được tạo tự động bằng AI. Mọi thông tin mang tính chất tham khảo.
            </p>
            <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
              <Link href="/privacy" className="hover:text-gray-300 transition">Chính sách bảo mật</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-gray-300 transition">Điều khoản sử dụng</Link>
              <span>•</span>
              <Link href="/affiliate-policy" className="hover:text-gray-300 transition">Chính sách Affiliate</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
