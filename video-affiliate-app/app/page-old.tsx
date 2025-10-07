import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Sparkles, Share2, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Video className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">VideoAffiliate</span>
          </div>
          <div className="flex gap-4">
            <Link href="/blog">
              <Button variant="ghost">Blog Reviews</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/dashboard/create">
              <Button>Tạo Review</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Tạo Landing Page Review
          <br />
          Tự Động Với AI
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Chỉ cần nhập link video YouTube/TikTok, AI sẽ tự động phân tích và tạo
          landing page review chuyên nghiệp trong vài phút
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard/create">
            <Button size="lg" className="text-lg px-8">
              Bắt Đầu Ngay - Miễn Phí
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Xem Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tính Năng Nổi Bật
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Video className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Hỗ Trợ Đa Nền Tảng</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Tự động phân tích video từ YouTube và TikTok, lấy thông tin chi tiết
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>AI Phân Tích Thông Minh</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Tạo nội dung review chi tiết: ưu/nhược điểm, so sánh, đối tượng phù hợp
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Share2 className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Đăng Facebook Tự Động</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Đăng bài lên Facebook với preview đẹp, link đến landing page của bạn
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Tích Hợp Affiliate</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Thêm link affiliate, theo dõi clicks và conversions dễ dàng
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-blue-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-12">
          Cách Hoạt Động
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="font-bold text-lg mb-2">Nhập Link Video</h3>
            <p className="text-gray-600">
              Paste link YouTube hoặc TikTok vào form
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-bold text-lg mb-2">AI Phân Tích</h3>
            <p className="text-gray-600">
              AI tự động tạo nội dung review chuyên nghiệp
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-bold text-lg mb-2">Chia Sẻ & Kiếm Tiền</h3>
            <p className="text-gray-600">
              Đăng lên Facebook và bắt đầu nhận affiliate
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Sẵn Sàng Bắt Đầu?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Tạo landing page review đầu tiên của bạn ngay hôm nay
        </p>
        <Link href="/dashboard/create">
          <Button size="lg" className="text-lg px-12">
            Tạo Review Ngay
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 VideoAffiliate App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
