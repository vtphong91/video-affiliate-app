/**
 * User Hook
 * Provides user-specific functionality and profile management
 */

import { useAuth } from './useAuth';
import type { UserProfile, ProfileUpdateData } from '../config/auth-types';

export const useUser = () => {
  const { user, userProfile, loading } = useAuth();

  // Get user display name
  const getDisplayName = (): string => {
    if (userProfile?.full_name) return userProfile.full_name;
    if (user?.email) return user.email;
    return 'User';
  };

  // Get user avatar URL
  const getAvatarUrl = (): string | null => {
    // For now, return null - can be extended later
    return null;
  };

  // Get user profile
  const getProfile = () => {
    return userProfile || null;
  };

  // Check if user profile is complete
  const isProfileComplete = (): boolean => {
    if (!user) return false;
    
    const profile = getProfile();
    return !!(
      profile?.full_name &&
      profile?.role
    );
  };

  // Update user profile
  const updateUserProfile = async (data: ProfileUpdateData) => {
    // TODO: Implement updateProfile method
    return { success: false, error: 'Not implemented' };
  };

  // Get user initials for avatar
  const getInitials = (): string => {
    const displayName = getDisplayName();
    if (!displayName || displayName === 'User') return 'U';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Get user role
  const getUserRole = (): string | null => {
    return userProfile?.role || user?.user_metadata?.role || null;
  };

  // Get user permissions
  const getUserPermissions = (): string[] => {
    return userProfile?.permissions || [];
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return getUserRole() === 'admin';
  };

  // Check if user is verified
  const isVerified = (): boolean => {
    return !!user?.email_confirmed_at;
  };

  // Get user creation date
  const getCreatedAt = (): string | null => {
    return user?.created_at || null;
  };

  // Get last sign in date
  const getLastSignIn = (): string | null => {
    return user?.last_sign_in_at || null;
  };

  return {
    // User data
    user,
    profile: getProfile(),
    displayName: getDisplayName(),
    avatarUrl: getAvatarUrl(),
    initials: getInitials(),
    role: getUserRole(),
    permissions: getUserPermissions(),
    
    // User status
    isProfileComplete: isProfileComplete(),
    isAdmin: isAdmin(),
    isVerified: isVerified(),
    
    // User dates
    createdAt: getCreatedAt(),
    lastSignIn: getLastSignIn(),
    
    // Actions
    updateProfile: updateUserProfile,
    
    // Loading and error states
    loading,
    error: null, // TODO: Add error handling
  };
};










