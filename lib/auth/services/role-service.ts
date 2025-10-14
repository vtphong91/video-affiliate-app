/**
 * Role Service
 * Provides role-related utilities and constants
 */

import type { UserRole } from '@/lib/auth/config/auth-types';

export class RoleService {
  /**
   * Get display name for a role
   */
  static getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'user':
        return 'User';
      case 'guest':
        return 'Guest';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get color class for a role
   */
  static getRoleColor(role: UserRole): string {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'user':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'guest':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Get description for a role
   */
  static getRoleDescription(role: UserRole): string {
    switch (role) {
      case 'admin':
        return 'Administrator with full access';
      case 'user':
        return 'Regular user with standard access';
      case 'guest':
        return 'Guest with limited access';
      default:
        return 'Unknown role';
    }
  }

  /**
   * Check if role has admin privileges
   */
  static isAdmin(role: UserRole): boolean {
    return role === 'admin';
  }

  /**
   * Check if role has user privileges
   */
  static isUser(role: UserRole): boolean {
    return role === 'user' || role === 'admin';
  }

  /**
   * Get all available roles
   */
  static getAllRoles(): UserRole[] {
    return ['admin', 'user', 'guest'];
  }
}
