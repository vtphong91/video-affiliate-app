import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Video, LayoutDashboard, PlusCircle, List, Settings, Tag, Home } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <Video className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">VideoAffiliate</span>
            </Link>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/create">
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Tạo Mới
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              <Link href="/" target="_blank">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="h-4 w-4 mr-2" />
                  Trang Chủ
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/create">
                <Button variant="ghost" className="w-full justify-start">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Tạo Review
                </Button>
              </Link>
              <Link href="/dashboard/reviews">
                <Button variant="ghost" className="w-full justify-start">
                  <List className="h-4 w-4 mr-2" />
                  Reviews
                </Button>
              </Link>
              <Link href="/dashboard/categories">
                <Button variant="ghost" className="w-full justify-start">
                  <Tag className="h-4 w-4 mr-2" />
                  Danh Mục
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Cài Đặt
                </Button>
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
