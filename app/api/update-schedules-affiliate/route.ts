import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/update-schedules-affiliate - Update existing schedules to text format
export async function POST() {
  try {
    console.log('🔍 Updating existing schedules affiliate_links to text format...');
    
    // Import supabase directly
    const { supabaseAdmin } = await import('@/lib/db/supabase');
    
    // Get all schedules with affiliate_links
    const { data: schedules, error: fetchError } = await supabaseAdmin
      .from('schedules')
      .select('id, affiliate_links')
      .not('affiliate_links', 'is', null);
    
    if (fetchError) {
      console.log('❌ Database fetch error:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Database fetch error',
        details: fetchError
      });
    }
    
    console.log('✅ Found schedules with affiliate_links:', schedules?.length || 0);
    
    let updatedCount = 0;
    const errors = [];
    
    // Process each schedule
    for (const schedule of schedules || []) {
      try {
        // Check if affiliate_links is already text format
        if (typeof schedule.affiliate_links === 'string') {
          console.log(`⏭️ Schedule ${schedule.id} already in text format`);
          continue;
        }
        
        // Convert array to text format
        const affiliateLinksArray = schedule.affiliate_links;
        if (!Array.isArray(affiliateLinksArray)) {
          console.log(`⏭️ Schedule ${schedule.id} affiliate_links is not array`);
          continue;
        }
        
        let text = 'ĐẶT MUA SẢN PHẨM VỚI GIÁ TỐT TẠI:\n';
        
        affiliateLinksArray.forEach((link, index) => {
          text += `- ${link.platform || `Affiliate Link ${index + 1}`}`;
          if (link.url) {
            text += ` ${link.url}`;
          }
          if (link.price) {
            text += ` - ${link.price}`;
          }
          text += '\n';
        });
        
        const affiliateLinksText = text.trim();
        
        // Update schedule
        const { error: updateError } = await supabaseAdmin
          .from('schedules')
          .update({ affiliate_links: affiliateLinksText })
          .eq('id', schedule.id);
        
        if (updateError) {
          console.error(`❌ Error updating schedule ${schedule.id}:`, updateError);
          errors.push({ id: schedule.id, error: updateError.message });
        } else {
          console.log(`✅ Updated schedule ${schedule.id}`);
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
      message: `Updated ${updatedCount} schedules to text format`
    });
    
  } catch (error) {
    console.error('❌ Exception in update schedules affiliate:', error);
    return NextResponse.json({
      success: false,
      error: 'Update failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
