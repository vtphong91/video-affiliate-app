/**
 * Test Authentication Debug
 * Run this to check auth configuration and user setup
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAuthSetup() {
  console.log('🔍 Checking authentication setup...\n');

  try {
    // Check user_profiles table
    console.log('📊 Checking user_profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`✅ Found ${profiles.length} user profiles:\n`);
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. User: ${profile.email || profile.full_name}`);
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Role: ${profile.role}`);
        console.log(`   - Active: ${profile.is_active}`);
        console.log(`   - Status: ${profile.status}`);
        console.log('');
      });
    }

    // Check if there's an admin user
    const { data: adminUsers, error: adminError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'admin')
      .eq('is_active', true);

    if (adminError) {
      console.error('❌ Error checking admin users:', adminError);
    } else {
      console.log(`\n🔐 Admin users: ${adminUsers.length}`);
      if (adminUsers.length === 0) {
        console.warn('⚠️  WARNING: No active admin users found!');
        console.warn('   You need to manually set a user to admin role in the database.\n');
        console.log('   SQL to make first user admin:');
        console.log('   UPDATE user_profiles SET role = \'admin\' WHERE email = \'your-email@example.com\';\n');
      } else {
        adminUsers.forEach(admin => {
          console.log(`   ✓ ${admin.email || admin.full_name} (${admin.id})`);
        });
      }
    }

    // Check permissions in checkPermission function
    console.log('\n📋 Permission mapping (from rbac-middleware.ts):');
    console.log('   manage_settings: [admin]');
    console.log('   manage_users: [admin]');
    console.log('   manage_roles: [admin]');
    console.log('   read_settings: [admin, editor]');
    console.log('   write_reviews: [admin, editor]');
    console.log('   read_reviews: [admin, editor, viewer]');

    console.log('\n✅ Authentication setup check complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAuthSetup();
