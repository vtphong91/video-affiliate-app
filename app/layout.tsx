import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from '@/components/providers/ClientProviders';

export const metadata: Metadata = {
  title: 'VideoAffiliate - Tự động hóa Video Affiliate Marketing',
  description: 'Phân tích video, tạo nội dung AI và đăng bài tự động lên Facebook. Tối ưu hóa quy trình affiliate marketing của bạn với công nghệ AI tiên tiến.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}