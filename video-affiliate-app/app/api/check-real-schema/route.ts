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
    
    // Check if we can insert test data
    const testData = {
      user_id: 'test-user',
      review_id: '45e448df-d4ef-4d5d-9303-33109f9d6c30',
      scheduled_for: '2025-01-08T11:20:00.000Z',
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: 'page', // Try target_type first
      target_id: 'test-target',
      target_name: 'Test Target',
      post_message: 'Test message',
      landing_page_url: 'https://test.com',
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
    };
    
    console.log('🧪 Testing insert with target_type...');
    const { data: insertResult1, error: insertError1 } = await supabase
      .from('schedules')
      .insert(testData)
      .select()
      .single();
    
    if (insertError1) {
      console.log('❌ Insert with target_type failed:', insertError1);
      
      // Try with target_typ
      const testData2 = { ...testData, target_typ: testData.target_type };
      delete testData2.target_type;
      
      console.log('🧪 Testing insert with target_typ...');
      const { data: insertResult2, error: insertError2 } = await supabase
        .from('schedules')
        .insert(testData2)
        .select()
        .single();
      
      if (insertError2) {
        console.log('❌ Insert with target_typ also failed:', insertError2);
        
        return NextResponse.json({
          success: false,
          error: 'Both target_type and target_typ failed',
          details: {
            target_type_error: insertError1.message,
            target_typ_error: insertError2.message
          },
          columns,
          sampleData: sampleData?.[0] || null
        }, { status: 500 });
      } else {
        console.log('✅ Insert with target_typ successful:', insertResult2);
        
        // Clean up
        await supabase
          .from('schedules')
          .delete()
          .eq('id', insertResult2.id);
        
        return NextResponse.json({
          success: true,
          message: 'Schema check completed - target_typ works',
          schema: {
            columns,
            sampleData: sampleData?.[0] || null,
            correctColumnName: 'target_typ'
          }
        });
      }
    } else {
      console.log('✅ Insert with target_type successful:', insertResult1);
      
      // Clean up
      await supabase
        .from('schedules')
        .delete()
        .eq('id', insertResult1.id);
      
      return NextResponse.json({
        success: true,
        message: 'Schema check completed - target_type works',
        schema: {
          columns,
          sampleData: sampleData?.[0] || null,
          correctColumnName: 'target_type'
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Schema check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Schema check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
