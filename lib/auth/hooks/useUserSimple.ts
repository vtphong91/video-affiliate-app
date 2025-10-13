/**
 * Simple User Hook
 * Provides user-specific functionality for SimpleAuthProvider
 */

import { useAuth } from '../SupabaseAuthProvider';

export const useUser = () => {
  const { user, updateProfile } = useAuth();

  // Get user display name
  const getDisplayName = (): string => {
    if (!user) return '';
    return user.name || user.email || 'Unknown User';
  };

  // Get user avatar URL
  const getAvatarUrl = (): string | null => {
    // SimpleAuthProvider doesn't have avatar support yet
    return null;
  };

  // Get user profile (mock for SimpleAuthProvider)
  const getProfile = () => {
    if (!user) return null;
    
    return {
      id: user.id,
      user_id: user.id,
      full_name: user.name,
      phone: '',
      avatar_url: null,
      bio: '',
      website: '',
      location: '',
      role: user.role,
      is_verified: true,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  };

  // Check if user profile is complete
  const isProfileComplete = (): boolean => {
    if (!user) return false;
    return !!(user.name && user.email);
  };

  // Get user initials
  const getInitials = (): string => {
    if (!user) return 'U';
    
    const name = user.name || user.email || '';
    const words = name.split(' ');
    
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    
    return name[0]?.toUpperCase() || 'U';
  };

  // Check if user is verified
  const isVerified = (): boolean => {
    return user ? true : false; // SimpleAuthProvider users are considered verified
  };

  // Get user creation date
  const getCreatedAt = (): string | null => {
    return user?.created_at || null;
  };

  // Get last sign in date
  const getLastSignIn = (): string | null => {
    return user?.updated_at || null; // Use updated_at as last sign in for SimpleAuthProvider
  };

  // Update user profile
  const updateUserProfile = async (data: any) => {
    if (!updateProfile) {
      throw new Error('updateProfile not available');
    }
    
    return await updateProfile(data);
  };

  // Check if user can update profile
  const canUpdateProfile = (): boolean => {
    return !!user;
  };

  // Get user role
  const getUserRole = (): string => {
    return user?.role || 'guest';
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  // Check if user is regular user
  const isUser = (): boolean => {
    return user?.role === 'user';
  };

  // Check if user is guest
  const isGuest = (): boolean => {
    return !user || user.role === 'guest';
  };

  return {
    // User data
    user,
    profile: getProfile(),
    displayName: getDisplayName(),
    avatarUrl: getAvatarUrl(),
    initials: getInitials(),
    isVerified: isVerified(),
    createdAt: getCreatedAt(),
    lastSignIn: getLastSignIn(),
    
    // Profile management
    isProfileComplete: isProfileComplete(),
    canUpdateProfile: canUpdateProfile(),
    updateProfile: updateUserProfile,
    
    // Role checking
    role: getUserRole(),
    isAdmin: isAdmin(),
    isUser: isUser(),
    isGuest: isGuest(),
  };
};






