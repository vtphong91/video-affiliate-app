'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-purple-400 mb-4 block">
              VIDEO AFFILIATE
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Welcome to ultimate source for fresh perspectives! Explore curated content to 
              enlighten, entertain and engage global readers.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                📘
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                📷
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-700 transition-colors">
                💼
              </a>
            </div>
          </div>

          {/* Homepages - Hidden for public users */}
          <div>
            <h3 className="text-lg font-semibold mb-4">HOMEPAGES</h3>
            <ul className="space-y-2 text-sm">
              {/* Dashboard links hidden for public users */}
              {/* <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/create" className="text-gray-400 hover:text-white transition-colors">Create Review</Link></li>
              <li><Link href="/dashboard/schedules" className="text-gray-400 hover:text-white transition-colors">Schedules</Link></li>
              <li><Link href="/dashboard/reviews" className="text-gray-400 hover:text-white transition-colors">Reviews</Link></li>
              <li><Link href="/dashboard/settings" className="text-gray-400 hover:text-white transition-colors">Settings</Link></li> */}
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">CATEGORIES</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/technology" className="text-gray-400 hover:text-white transition-colors">Technology</Link></li>
              <li><Link href="/category/travel" className="text-gray-400 hover:text-white transition-colors">Travel</Link></li>
              <li><Link href="/category/sport" className="text-gray-400 hover:text-white transition-colors">Sport</Link></li>
              <li><Link href="/category/business" className="text-gray-400 hover:text-white transition-colors">Business</Link></li>
            </ul>
          </div>

          {/* Pages */}
          <div>
            <h3 className="text-lg font-semibold mb-4">PAGES</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
              <li><Link href="/categories" className="text-gray-400 hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contacts</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 - Video Affiliate App. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
