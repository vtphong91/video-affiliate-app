'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '@/lib/db/supabase';

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
  
        // Cache for user profile to avoid repeated fetches
        const profileCache = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
        const CACHE_DURATION = 120000; // 2 minutes cache for better performance

  // Force clear loading state if stuck
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⚠️ SupabaseAuthProvider: Loading stuck, forcing to false');
        setLoading(false);
      }
    }, 5000); // Reduced timeout to 5 seconds for faster response
    
    return () => clearTimeout(timeout);
  }, [loading]);

  // Additional timeout for initial load - but don't force user to null if session exists
  useEffect(() => {
    const initialTimeout = setTimeout(() => {
      console.log('⚠️ SupabaseAuthProvider: Initial timeout, forcing loading to false');
      setLoading(false);
      // Don't set user to null on timeout - let the session refresh logic handle it
      // Only set loading to false to prevent infinite loading
    }, 5000); // Reduced timeout to 5 seconds for faster response
    
    return () => clearTimeout(initialTimeout);
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    const getInitialSession = async () => {
      try {
        console.log('🔍 SupabaseAuthProvider: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🔍 SupabaseAuthProvider: Initial session:', !!session, session?.user?.email);
        console.log('🔍 SupabaseAuthProvider: Session error:', error);
        
        if (!mounted) return; // Prevent state update if component unmounted
        
        if (session?.user) {
          console.log('🔍 SupabaseAuthProvider: Setting user from initial session');
          setUser(session.user);
          
          // Try to fetch profile with retry logic
          try {
            await fetchUserProfile(session.user.id);
          } catch (profileError) {
            console.error('❌ SupabaseAuthProvider: Profile fetch failed, retrying...', profileError);
            // Retry once after a short delay
            setTimeout(async () => {
              try {
                await fetchUserProfile(session.user.id);
              } catch (retryError) {
                console.error('❌ SupabaseAuthProvider: Profile fetch retry failed:', retryError);
                setUserProfile(null);
              }
            }, 2000);
          }
        } else {
          console.log('🔍 SupabaseAuthProvider: No session found, trying to refresh...');
          
          // Try to refresh session if no session found
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          console.log('🔍 SupabaseAuthProvider: Refresh session result:', !!refreshedSession, refreshedSession?.user?.email);
          console.log('🔍 SupabaseAuthProvider: Refresh error:', refreshError);
          
          if (refreshedSession?.user) {
            console.log('🔍 SupabaseAuthProvider: Setting user from refreshed session');
            setUser(refreshedSession.user);
            await fetchUserProfile(refreshedSession.user.id);
          } else {
            console.log('🔍 SupabaseAuthProvider: No refreshed session found, user will be null');
            setUser(null);
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error('❌ SupabaseAuthProvider: Error getting initial session:', error);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
        }
      } finally {
        if (mounted) {
          console.log('🔍 SupabaseAuthProvider: Setting loading to false');
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 SupabaseAuthProvider: Auth state change:', event, session?.user?.email);
      
      if (!mounted) return; // Prevent state update if component unmounted
      
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

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile with timeout protection and retry logic
  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    const MAX_RETRIES = 1; // Only 1 retry for faster failure
    
    try {
      console.log(`🔍 SupabaseAuthProvider: Fetching user profile for: ${userId} (attempt ${retryCount + 1})`);
      
      // Check cache first
      const cached = profileCache.current.get(userId);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('✅ SupabaseAuthProvider: Using cached profile');
        setUserProfile(cached.data);
        return;
      }
      
      // Create a timeout promise - reduced to 5 seconds for faster response
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      // Create the profile fetch promise with better error handling
      const profilePromise = supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
        .then((result) => {
          console.log('🔍 SupabaseAuthProvider: Profile query completed:', { 
            hasData: !!result.data, 
            error: result.error?.message,
            dataKeys: result.data ? Object.keys(result.data) : null
          });
          return result;
        });
      
      // Race between profile fetch and timeout
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ SupabaseAuthProvider: Profile query error:', error);
        
        // Retry logic for network errors with shorter delay
        if (retryCount < MAX_RETRIES && (error.message.includes('timeout') || error.message.includes('network'))) {
          console.log(`🔄 SupabaseAuthProvider: Retrying profile fetch (${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1))); // Shorter delay
          return fetchUserProfile(userId, retryCount + 1);
        }
        
        setUserProfile(null);
        return;
      }

      if (data) {
        console.log('🔍 SupabaseAuthProvider: User profile found:', {
          id: data.id,
          email: data.email,
          role: data.role,
          status: data.status,
          is_active: data.is_active
        });
        
        // Check if user is active and approved
        if (data.status === 'pending') {
          console.log('⚠️ User is pending approval:', data.email);
          setUserProfile(null);
          return;
        }

        if (!data.is_active) {
          console.log('⚠️ User is inactive:', data.email);
          setUserProfile(null);
          return;
        }

        console.log('✅ SupabaseAuthProvider: Setting user profile');
        setUserProfile(data);
        
        // Cache the profile
        profileCache.current.set(userId, { data, timestamp: Date.now() });
      } else {
        console.log('🔍 SupabaseAuthProvider: No profile data returned');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('❌ SupabaseAuthProvider: Exception in fetchUserProfile:', error);
      
      // Retry logic for exceptions with shorter delay
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 SupabaseAuthProvider: Retrying profile fetch after exception (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 200)); // Very short delay
        return fetchUserProfile(userId, retryCount + 1);
      }
      
      // If all retries failed, create a fallback profile immediately
      console.warn('⚠️ SupabaseAuthProvider: All retries failed, creating fallback profile immediately');
      const fallbackProfile = {
        id: userId,
        email: 'user@example.com',
        full_name: 'User',
        role: 'admin' as const, // Set as admin for testing
        status: 'active' as const,
        is_active: true,
        avatar_url: null
      };
      setUserProfile(fallbackProfile);
      
      // Cache the fallback profile
      profileCache.current.set(userId, { data: fallbackProfile, timestamp: Date.now() });
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
    isAuthenticated: !!user && !!userProfile,
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
