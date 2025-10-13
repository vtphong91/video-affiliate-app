import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// GET /api/test-reviews-debug - Debug reviews API
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test Reviews Debug API called');
    
    // Get authenticated user ID
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      console.log('❌ No user ID found in request');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    console.log('👤 Authenticated user ID:', userId);
    
    // Get user profile
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, role, status, is_active')
      .eq('id', userId)
      .single();
    
    if (profileError || !userProfile) {
      console.log('❌ User profile not found:', profileError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'User profile not found' 
        },
        { status: 404 }
      );
    }
    
    console.log('✅ User profile verified:', { email: userProfile.email, role: userProfile.role });
    
    // Get reviews for this user
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .select('id, title, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (reviewsError) {
      console.log('❌ Error fetching reviews:', reviewsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch reviews',
          details: reviewsError
        },
        { status: 500 }
      );
    }
    
    console.log('✅ Reviews fetched:', reviews?.length || 0, 'reviews');
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userProfile.id,
          email: userProfile.email,
          role: userProfile.role,
          status: userProfile.status
        },
        reviews: reviews || [],
        total: reviews?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Unhandled error in test reviews debug:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
