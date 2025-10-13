import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/update-schedules-copyright - Update existing schedules with new copyright format
export async function POST() {
  try {
    console.log('🔍 Updating existing schedules with new copyright format...');
    
    // Import supabase directly
    const { supabaseAdmin } = await import('@/lib/db/supabase');
    
    // Get all schedules with post_message
    const { data: schedules, error: fetchError } = await supabaseAdmin
      .from('schedules')
      .select('id, post_message, channel_name')
      .not('post_message', 'is', null);
    
    if (fetchError) {
      console.log('❌ Database fetch error:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Database fetch error',
        details: fetchError
      });
    }
    
    console.log('✅ Found schedules with post_message:', schedules?.length || 0);
    
    let updatedCount = 0;
    const errors = [];
    
    // Process each schedule
    for (const schedule of schedules || []) {
      try {
        const oldMessage = schedule.post_message;
        
        // Check if already has new copyright format
        if (oldMessage.includes('Nội dung Video thuộc về kênh')) {
          console.log(`⏭️ Schedule ${schedule.id} already has new copyright format`);
          continue;
        }
        
        // Update copyright format
        const channelName = schedule.channel_name || 'kênh gốc';
        const newCopyright = `⚖️Nội dung Video thuộc về kênh ${channelName} - Mọi thông tin về sản phẩm được tham khảo từ video. Bản quyền thuộc về kênh gốc.`;
        
        // Replace old copyright with new one
        let newMessage = oldMessage
          .replace(/⚖️ Bản quyền video thuộc về kênh gốc\nMọi quyền thuộc về kênh gốc\. Đây chỉ là nội dung tham khảo\./g, newCopyright)
          .replace(/⚖️ Bản quyền video thuộc về .+\nMọi quyền thuộc về kênh gốc\. Đây chỉ là nội dung tham khảo\./g, newCopyright)
          .replace(/Nội dung Video thuộc về kênh .+ - Mọi thông tin về sản phẩm được tham khảo từ video\. Mọi bảng quyền thuộc về kênh gốc\./g, newCopyright);
        
        // If no old format found, add new copyright at the end before hashtags
        if (newMessage === oldMessage) {
          const hashtagIndex = newMessage.lastIndexOf('#');
          if (hashtagIndex > 0) {
            newMessage = newMessage.substring(0, hashtagIndex).trim() + '\n\n' + newCopyright + '\n\n' + newMessage.substring(hashtagIndex);
          } else {
            newMessage = newMessage.trim() + '\n\n' + newCopyright;
          }
        }
        
        // Update schedule
        const { error: updateError } = await supabaseAdmin
          .from('schedules')
          .update({ post_message: newMessage })
          .eq('id', schedule.id);
        
        if (updateError) {
          console.error(`❌ Error updating schedule ${schedule.id}:`, updateError);
          errors.push({ id: schedule.id, error: updateError.message });
        } else {
          console.log(`✅ Updated schedule ${schedule.id} with new copyright format`);
          updatedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Exception updating schedule ${schedule.id}:`, error);
        errors.push({ id: schedule.id, error: error instanceof Error ? error.message : String(error) });
      }
    }
    
    return NextResponse.json({
      success: true,
      totalSchedules: schedules?.length || 0,
      updatedCount,
      errors,
      message: `Updated ${updatedCount} schedules with new copyright format`
    });
    
  } catch (error) {
    console.error('❌ Exception in update schedules copyright:', error);
    return NextResponse.json({
      success: false,
      error: 'Update failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
