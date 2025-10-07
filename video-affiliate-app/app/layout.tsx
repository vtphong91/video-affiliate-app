import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SettingsProvider } from "@/lib/contexts/settings-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Video Affiliate App - Tạo Review Tự Động",
  description: "Tạo landing page review từ video YouTube/TikTok với AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <SettingsProvider>
          {children}
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  );
}
