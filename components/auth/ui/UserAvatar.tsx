'use client';

/**
 * User Avatar Component
 * Displays user avatar with fallback to initials
 */

import React from 'react';
import { User } from 'lucide-react';
import { authHelpers } from '@/lib/auth/config/supabase-auth';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = 'User',
  initials,
  size = 'md',
  className = '',
  onClick,
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  // Get initials from alt if not provided
  const displayInitials = initials || authHelpers.getUserInitials({ email: alt } as any);

  // Avatar content
  const avatarContent = (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full bg-gray-200 flex items-center justify-center
        ${onClick ? 'cursor-pointer hover:bg-gray-300 transition-colors' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  ${displayInitials}
                </div>
              `;
            }
          }}
        />
      ) : (
        <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
          {displayInitials}
        </div>
      )}
    </div>
  );

  return avatarContent;
};










