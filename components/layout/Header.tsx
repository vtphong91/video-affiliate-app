'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthButton } from '@/components/auth/ui/AuthButton';

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              VIDEO AFFILIATE
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-purple-600 transition-colors">
                Homepages
                <span className="ml-1">▼</span>
              </button>
              {/* Dropdown menu would go here */}
            </div>
            
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-purple-600 transition-colors">
                Features
                <span className="ml-1">▼</span>
              </button>
              {/* Dropdown menu would go here */}
            </div>
            
            <Link href="/about" className="text-gray-700 hover:text-purple-600 transition-colors">
              About
            </Link>
            
            <Link href="/contact" className="text-gray-700 hover:text-purple-600 transition-colors">
              Contacts
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-gray-700 hover:text-purple-600 transition-colors">
              🔍
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* CTA Button - Hidden for public users */}
            {/* <Link 
              href="/dashboard"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Dashboard
            </Link> */}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {/* Dashboard link hidden for public users */}
              {/* <Link href="/dashboard" className="text-gray-700 hover:text-purple-600 transition-colors">
                Dashboard
              </Link> */}
              <Link href="/about" className="text-gray-700 hover:text-purple-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-purple-600 transition-colors">
                Contacts
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
