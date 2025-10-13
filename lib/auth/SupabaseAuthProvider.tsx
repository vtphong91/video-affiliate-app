'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/db/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  permissions?: string[];
  is_active?: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  // Enhanced permission and role checking
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Force clear loading state if stuck
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⚠️ SupabaseAuthProvider: Loading stuck, forcing to false');
        setLoading(false);
      }
    }, 1000); // 1 second timeout - faster
    
    return () => clearTimeout(timeout);
  }, [loading]);

  // Additional timeout for initial load
  useEffect(() => {
    const initialTimeout = setTimeout(() => {
      console.log('⚠️ SupabaseAuthProvider: Initial timeout, forcing loading to false');
      setLoading(false);
    }, 2000); // 2 seconds for initial load
    
    return () => clearTimeout(initialTimeout);
  }, []);

  // Initialize auth state
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        console.log('🔍 SupabaseAuthProvider: Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 SupabaseAuthProvider: Initial session:', !!session, session?.user?.email);
        
        if (session?.user) {
          console.log('🔍 SupabaseAuthProvider: Setting user from initial session');
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('❌ SupabaseAuthProvider: Error getting initial session:', error);
      } finally {
        console.log('🔍 SupabaseAuthProvider: Setting loading to false');
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 SupabaseAuthProvider: Auth state change:', event, session?.user?.email);
      
      if (session?.user) {
        console.log('🔍 SupabaseAuthProvider: Setting user from auth change');
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        console.log('🔍 SupabaseAuthProvider: Clearing user and profile');
        setUser(null);
        setUserProfile(null);
      }
      console.log('🔍 SupabaseAuthProvider: Setting loading to false after auth change');
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 SupabaseAuthProvider: Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        console.log('🔍 SupabaseAuthProvider: User profile found:', data);
        setUserProfile(data);
      } else {
        console.log('🔍 SupabaseAuthProvider: User profile not found, using default');
        // Create default profile
        const defaultProfile = {
          id: userId,
          full_name: 'User',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error('❌ SupabaseAuthProvider: Error fetching user profile:', error);
      // Use default profile
      const defaultProfile = {
        id: userId,
        full_name: 'User',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setUserProfile(defaultProfile);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Enhanced permission checking
  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;
    
    // Admin has all permissions
    if (userProfile.role === 'admin') return true;
    
    // Check specific permissions
    return userProfile.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!userProfile) return false;
    
    // Admin has all permissions
    if (userProfile.role === 'admin') return true;
    
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!userProfile) return false;
    
    // Admin has all permissions
    if (userProfile.role === 'admin') return true;
    
    return permissions.every(permission => hasPermission(permission));
  };

  // Enhanced role checking
  const hasRole = (role: string): boolean => {
    return userProfile?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return userProfile ? roles.includes(userProfile.role) : false;
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    // Enhanced permission and role checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}
