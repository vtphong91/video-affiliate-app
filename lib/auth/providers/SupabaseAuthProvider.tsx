'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<{ success: boolean }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string; user?: User | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface SupabaseAuthProviderProps {
  children: ReactNode;
}

// Mock user interface for fallback
interface MockUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [useMockAuth, setUseMockAuth] = useState(false);
  
  // Force clear loading state if stuck
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⚠️ Loading state stuck, forcing to false');
        setLoading(false);
        // Clear any stale session data
        setUser(null);
        setUserProfile(null);
      }
    }, 3000); // Reduced to 3 seconds timeout
    
    return () => clearTimeout(timeout);
  }, [loading]);
  
  // Additional safety: clear loading after 3 seconds if user exists but no profile
  useEffect(() => {
    if (user && !userProfile && loading) {
      const timeout = setTimeout(() => {
        console.log('⚠️ User exists but no profile, clearing loading');
        setLoading(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [user, userProfile, loading]);

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase') || supabaseKey.includes('your_supabase')) {
      console.error('❌ Supabase not configured properly. Please check your .env.local file.');
      console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
      setUseMockAuth(true);
      setLoading(false);
      return;
    }

    console.log('✅ Using Supabase Auth');
    setUseMockAuth(false);
    setLoading(false); // Add this line
  }, [supabaseUrl, supabaseKey]);

  // Create Supabase client only if configured
  const supabase = useMemo(() => {
    console.log('🔍 Creating Supabase client...');
    console.log('🔍 supabaseUrl:', supabaseUrl);
    console.log('🔍 supabaseKey exists:', !!supabaseKey);
    console.log('🔍 useMockAuth:', useMockAuth);
    
    if (!supabaseUrl || !supabaseKey || useMockAuth) {
      console.log('❌ Cannot create Supabase client - missing config or using mock auth');
      return null;
    }
    
    const client = createBrowserClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    
    // Test the client immediately and wait for session
    const testSession = async () => {
      try {
        const { data: { session }, error } = await client.auth.getSession();
        console.log('🔍 Initial session check:', session?.user?.email, error);
        
        if (session) {
          console.log('🔍 Session found, setting user immediately');
          setUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error in initial session check:', error);
      }
    };
    
    testSession();
    
    return client;
  }, [supabaseUrl, supabaseKey, useMockAuth]);

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    console.log('🔍 fetchUserProfile called with userId:', userId);
    console.log('🔍 supabase client exists:', !!supabase);
    
    if (!supabase) {
      console.log('❌ No supabase client, returning null');
      return null;
    }
    
    try {
      console.log('🔍 Fetching user profile for userId:', userId);
      console.log('🔍 Supabase URL:', supabase.supabaseUrl);
      
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 Current session:', session?.user?.email, sessionError);
      
      // Try to get user profile with different approaches
      let data = null;
      let error = null;
      
      // Approach 1: Direct query with RLS bypass
      const result1 = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('🔍 Approach 1 result:', result1.data, result1.error);
      
      if (result1.data) {
        data = result1.data;
        error = result1.error;
      } else {
        // Approach 2: Try with user_id field
        const result2 = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        console.log('🔍 Approach 2 result:', result2.data, result2.error);
        
        if (result2.data) {
          data = result2.data;
          error = result2.error;
        } else {
          // Approach 3: Try without .single() to see all records
          const result3 = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId);
          
          console.log('🔍 Approach 3 result:', result3.data, result3.error);
          data = result3.data?.[0] || null;
          error = result3.error;
          
          // Approach 4: Try to get by email if ID doesn't work
          if (!data && session?.user?.email) {
            const result4 = await supabase
              .from('user_profiles')
              .select('*')
              .eq('email', session.user.email)
              .single();
            
            console.log('🔍 Approach 4 (by email) result:', result4.data, result4.error);
            if (result4.data) {
              data = result4.data;
              error = result4.error;
            }
          }
        }
      }
      
      console.log('🔍 Query result - data:', data);
      console.log('🔍 Query result - error:', error);
      
      // If we have data, return it immediately
      if (data) {
        console.log('✅ User profile found:', data);
        return data;
      }
      
      if (error) {
        console.error('❌ Error fetching user profile:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        
        // If user profile doesn't exist, create a default one
        if (error.code === 'PGRST116' || !data) {
          console.log('🔍 User profile not found, creating default profile...');
          
          const defaultProfile = {
            id: userId,
            email: session?.user?.email || 'unknown@example.com',
            full_name: session?.user?.user_metadata?.full_name || 'User',
            role: 'user',
            permissions: ['read:reviews', 'write:reviews'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Try to insert the profile
          try {
            const { data: insertData, error: insertError } = await supabase
              .from('user_profiles')
              .insert(defaultProfile)
              .select()
              .single();
            
            if (insertError) {
              console.error('❌ Error inserting profile:', insertError);
              console.log('✅ Using default profile without saving');
              return defaultProfile;
            }
            
            console.log('✅ Created and saved profile:', insertData);
            return insertData;
          } catch (insertErr) {
            console.error('❌ Error inserting profile:', insertErr);
            console.log('✅ Using default profile without saving');
            return defaultProfile;
          }
        }
        
        // If no data found and no error, create default profile
        console.log('🔍 No data found, creating default profile...');
        const defaultProfile = {
          id: userId,
          email: session?.user?.email || 'unknown@example.com',
          full_name: session?.user?.user_metadata?.full_name || 'User',
          role: 'user',
          permissions: ['read:reviews', 'write:reviews'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('✅ Created default profile:', defaultProfile);
        return defaultProfile;
      }
      
      console.log('✅ User profile loaded:', data);
      console.log('✅ User profile role:', data?.role);
      console.log('✅ User profile permissions:', data?.permissions);
      return data;
    } catch (error) {
      console.error('❌ Error in fetchUserProfile:', error);
      console.error('❌ Error stack:', error.stack);
      return null;
    }
  };

  useEffect(() => {
    console.log('🔍 SupabaseAuthProvider useEffect - useMockAuth:', useMockAuth, 'loading:', loading);
    
    if (useMockAuth) {
      console.log('✅ Using Mock Auth - setting loading to false');
      setLoading(false);
      return;
    }
    
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔍 getInitialSession called - supabase:', !!supabase);
      if (!supabase) {
        console.log('❌ No supabase client, setting loading to false');
        setLoading(false);
        return;
      }
      
      try {
        console.log('🔍 Getting session from Supabase...');
        
        // Wait a bit for session to be available
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try multiple times to get session
        let session = null;
        let error = null;
        
        for (let i = 0; i < 3; i++) {
          const result = await supabase.auth.getSession();
          session = result.data.session;
          error = result.error;
          
          if (session) {
            console.log(`🔍 Session found on attempt ${i + 1}`);
            break;
          }
          
          console.log(`🔍 Session attempt ${i + 1} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log('🔍 Session result - session:', !!session, 'error:', error);
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setUser(null);
          setUserProfile(null);
        } else {
          console.log('🔍 Setting user from session:', session?.user?.email);
          setUser(session?.user ?? null);
          if (session?.user) {
            console.log('🔍 Fetching user profile for session user...');
            const profile = await fetchUserProfile(session.user.id);
            console.log('🔍 Setting userProfile from session:', profile);
            setUserProfile(profile);
            
            // Ensure loading is set to false after profile is loaded
            if (profile) {
              console.log('✅ Profile loaded successfully, setting loading to false');
              setLoading(false);
            }
          } else {
            console.log('🔍 No session user, clearing profile');
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        console.log('🔍 getInitialSession finally - checking if loading should be set to false');
        // Only set loading to false if we don't have a user or if we have a user but no profile yet
        // This prevents infinite loading when profile is being fetched
        setTimeout(() => {
          console.log('🔍 Final loading check - setting loading to false');
          setLoading(false);
        }, 1000);
      }
    };

    getInitialSession();

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 Auth state changed:', event, session?.user?.email);
        console.log('🔍 Auth state change - setting user:', !!session?.user);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('🔍 Auth state change - fetching profile...');
          const profile = await fetchUserProfile(session.user.id);
          console.log('🔍 Auth state change - Setting userProfile:', profile);
          setUserProfile(profile);
        } else {
          console.log('🔍 Auth state change - clearing profile');
          setUserProfile(null);
        }
        console.log('🔍 Auth state change - setting loading to false');
        setLoading(false);
      }
    );

      return () => subscription.unsubscribe();
    }
  }, [supabase, useMockAuth]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Use mock auth if Supabase not configured
    if (useMockAuth) {
      return mockLogin(email, password);
    }
    
    if (!supabase) {
      setLoading(false);
      return { success: false, error: 'Authentication service not available' };
    }
    
    try {
      console.log('🔍 Attempting login with:', email);
      
      // Clear any existing session first
      await supabase.auth.signOut();
      
      // Wait a bit before login
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        console.error('❌ Login error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Login successful:', data.user.email);
        
        // Set user immediately
        setUser(data.user);
        
        // Force refresh session with retry
        let session = null;
        for (let i = 0; i < 3; i++) {
          await new Promise(resolve => setTimeout(resolve, 200));
          const { data: { session: newSession } } = await supabase.auth.getSession();
          if (newSession) {
            session = newSession;
            console.log(`🔍 Session found on attempt ${i + 1}:`, session?.user?.email);
            break;
          }
        }
        
        // Fetch user profile after login
        console.log('🔍 Fetching user profile after login...');
        const profile = await fetchUserProfile(data.user.id);
        console.log('🔍 Setting userProfile after login:', profile);
        setUserProfile(profile);
        
        // Force set loading to false after login
        console.log('✅ Login completed, setting loading to false');
        setLoading(false);
        
        return { success: true, user: data.user };
      }

      setLoading(false);
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      setLoading(false);
      console.error('❌ Login exception:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    setLoading(true);
    
    if (useMockAuth) {
      return mockLogout();
    }
    
    if (!supabase) {
      setLoading(false);
      return { success: false };
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setLoading(false);
        return { success: false };
      }

      setUser(null);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    
    if (useMockAuth) {
      return mockRegister(email, password, name);
    }
    
    if (!supabase) {
      setLoading(false);
      return { success: false, error: 'Authentication service not available' };
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: 'user'
          }
        }
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setLoading(false);
        return { success: true, user: data.user };
      }

      setLoading(false);
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const resetPassword = async (email: string) => {
    if (useMockAuth) {
      return mockResetPassword(email);
    }
    
    if (!supabase) {
      return { success: false, error: 'Authentication service not available' };
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Password reset failed' };
    }
  };

  const updatePassword = async (password: string) => {
    setLoading(true);
    
    if (useMockAuth) {
      setLoading(false);
      return { success: true, user: user };
    }
    
    if (!supabase) {
      setLoading(false);
      return { success: false, error: 'Authentication service not available' };
    }
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      setLoading(false);
      return { success: true, user: data.user };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message || 'Failed to update password' };
    }
  };

  // Mock authentication functions
  const mockLogin = async (email: string, password: string) => {
    // Mock users for testing
    const mockUsers: { [key: string]: { password: string; user: MockUser } } = {
      'vtphong91@gmail.com': {
        password: 'Phong@8042',
        user: {
          id: '3',
          email: 'vtphong91@gmail.com',
          name: 'Phong Admin',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      'admin@example.com': {
        password: 'admin123',
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      'user@example.com': {
        password: 'user123',
        user: {
          id: '2',
          email: 'user@example.com',
          name: 'Regular User',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    };

    const userData = mockUsers[email];
    
    if (userData && userData.password === password) {
      const mockUser = userData.user as any; // Cast to User type
      setUser(mockUser);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      
      // Set auth cookie for middleware
      document.cookie = `auth_token=${mockUser.id}; path=/; max-age=86400; samesite=strict`;
      
      setLoading(false);
      return { success: true, user: mockUser };
    }
    
    setLoading(false);
    return { success: false, error: 'Thông tin đăng nhập không chính xác' };
  };

  const mockLogout = async () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setLoading(false);
    return { success: true };
  };

  const mockRegister = async (email: string, password: string, name: string) => {
    // Simple mock registration
    const mockUser = {
      id: Date.now().toString(),
      email,
      name,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as any;

    setUser(mockUser);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    
    // Set auth cookie for middleware
    document.cookie = `auth_token=${mockUser.id}; path=/; max-age=86400; samesite=strict`;
    
    setLoading(false);
    return { success: true, user: mockUser };
  };

  const mockResetPassword = async (email: string) => {
    // Mock password reset - just return success
    return { success: true };
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    logout,
    register,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}