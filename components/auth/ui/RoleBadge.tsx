'use client';

/**
 * Role Badge Component
 * Displays user role with appropriate styling
 */

import React from 'react';
import { Shield, User, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RoleService } from '@/lib/auth/services/role-service';
import type { UserRole } from '@/lib/auth/config/auth-types';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  // Get role info
  const displayName = RoleService.getRoleDisplayName(role);
  const colorClass = RoleService.getRoleColor(role);
  const description = RoleService.getRoleDescription(role);

  // Get role icon
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3 h-3" />;
      case 'user':
        return <User className="w-3 h-3" />;
      case 'guest':
        return <Eye className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2',
  };

  return (
    <Badge
      className={`
        ${colorClass}
        ${sizeClasses[size]}
        ${showIcon ? 'flex items-center space-x-1' : ''}
        ${className}
      `}
      title={description}
    >
      {showIcon && getRoleIcon(role)}
      <span>{displayName}</span>
    </Badge>
  );
};










