import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Database Affiliate Links Structure - Starting...');
    
    // 1. Check schedules table structure
    const { data: schedulesStructure, error: schedulesError } = await supabaseAdmin
      .from('schedules')
      .select('affiliate_links')
      .limit(5);
    
    if (schedulesError) {
      console.error('❌ Error fetching schedules structure:', schedulesError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch schedules structure',
        details: schedulesError.message
      }, { status: 500 });
    }
    
    // 2. Check reviews table structure
    const { data: reviewsStructure, error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .select('affiliate_links')
      .limit(5);
    
    if (reviewsError) {
      console.error('❌ Error fetching reviews structure:', reviewsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch reviews structure',
        details: reviewsError.message
      }, { status: 500 });
    }
    
    // 3. Analyze data types
    const schedulesAnalysis = schedulesStructure.map((schedule, index) => ({
      index,
      affiliateLinks: schedule.affiliate_links,
      type: typeof schedule.affiliate_links,
      isArray: Array.isArray(schedule.affiliate_links),
      isString: typeof schedule.affiliate_links === 'string',
      isNull: schedule.affiliate_links === null,
      isUndefined: schedule.affiliate_links === undefined,
      length: schedule.affiliate_links?.length || 0,
      stringified: JSON.stringify(schedule.affiliate_links),
      preview: schedule.affiliate_links ? String(schedule.affiliate_links).substring(0, 100) : 'N/A'
    }));
    
    const reviewsAnalysis = reviewsStructure.map((review, index) => ({
      index,
      affiliateLinks: review.affiliate_links,
      type: typeof review.affiliate_links,
      isArray: Array.isArray(review.affiliate_links),
      isString: typeof review.affiliate_links === 'string',
      isNull: review.affiliate_links === null,
      isUndefined: review.affiliate_links === undefined,
      length: review.affiliate_links?.length || 0,
      stringified: JSON.stringify(review.affiliate_links),
      preview: review.affiliate_links ? String(review.affiliate_links).substring(0, 100) : 'N/A'
    }));
    
    // 4. Check table schema (if possible)
    let tableSchema = null;
    try {
      const { data: schemaData, error: schemaError } = await supabaseAdmin
        .rpc('get_table_schema', { table_name: 'schedules' });
      
      if (!schemaError) {
        tableSchema = schemaData;
      }
    } catch (error) {
      console.log('⚠️ Could not fetch table schema:', error.message);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        schedulesTable: {
          count: schedulesStructure.length,
          analysis: schedulesAnalysis,
          summary: {
            withAffiliateLinks: schedulesAnalysis.filter(a => a.affiliateLinks && a.affiliateLinks !== null).length,
            withoutAffiliateLinks: schedulesAnalysis.filter(a => !a.affiliateLinks || a.affiliateLinks === null).length,
            arrayType: schedulesAnalysis.filter(a => a.isArray).length,
            stringType: schedulesAnalysis.filter(a => a.isString).length,
            nullType: schedulesAnalysis.filter(a => a.isNull).length,
            undefinedType: schedulesAnalysis.filter(a => a.isUndefined).length
          }
        },
        reviewsTable: {
          count: reviewsStructure.length,
          analysis: reviewsAnalysis,
          summary: {
            withAffiliateLinks: reviewsAnalysis.filter(a => a.affiliateLinks && a.affiliateLinks !== null).length,
            withoutAffiliateLinks: reviewsAnalysis.filter(a => !a.affiliateLinks || a.affiliateLinks === null).length,
            arrayType: reviewsAnalysis.filter(a => a.isArray).length,
            stringType: reviewsAnalysis.filter(a => a.isString).length,
            nullType: reviewsAnalysis.filter(a => a.isNull).length,
            undefinedType: reviewsAnalysis.filter(a => a.isUndefined).length
          }
        },
        tableSchema,
        recommendations: {
          issue: 'affiliate_links data type inconsistency detected',
          solution: 'Standardize affiliate_links storage format',
          options: [
            'Option 1: Store as JSONB array, format to text in webhook',
            'Option 2: Store as TEXT, parse to array when needed',
            'Option 3: Store both formats for flexibility'
          ]
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug database structure:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

