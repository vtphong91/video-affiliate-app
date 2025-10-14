/**
 * User Service
 * Provides user-related utilities and API calls
 */

import { supabase } from '@/lib/db/supabase';
import type { UserProfile, UserRole } from '@/lib/auth/config/auth-types';

export class UserService {
  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  /**
   * Update user role
   */
  static async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      return false;
    }
  }

  /**
   * Update user permissions
   */
  static async updateUserPermissions(userId: string, permissions: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ permissions })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user permissions:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserPermissions:', error);
      return false;
    }
  }

  /**
   * Get all users
   */
  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return false;
    }
  }
}
