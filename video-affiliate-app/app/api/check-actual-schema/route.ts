import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// API để check schema thực tế của schedules table
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking actual schedules table schema...');
    
    // Get actual table structure
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default, character_maximum_length')
      .eq('table_name', 'schedules')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (columnsError) {
      console.log('❌ Error getting columns:', columnsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to get table columns',
        details: columnsError.message
      }, { status: 500 });
    }
    
    console.log('📊 Actual table columns:', columns);
    
    // Get sample data
    const { data: sampleData, error: sampleError } = await supabase
      .from('schedules')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.log('❌ Error getting sample data:', sampleError);
      return NextResponse.json({
        success: false,
        error: 'Failed to get sample data',
        details: sampleError.message,
        columns
      }, { status: 500 });
    }
    
    console.log('📋 Sample data:', sampleData);
    
    return NextResponse.json({
      success: true,
      message: 'Schema check completed',
      schema: {
        columns,
        sampleData: sampleData?.[0] || null
      }
    });
    
  } catch (error) {
    console.error('❌ Schema check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Schema check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
