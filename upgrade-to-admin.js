/**
 * Upgrade user to admin role
 * Usage: node upgrade-to-admin.js <email>
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const email = process.argv[2] || 'vtphong91@gmail.com';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function upgradeToAdmin() {
  console.log(`🔧 Upgrading ${email} to admin role...\n`);

  try {
    // Update role to admin
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role: 'admin' })
      .eq('email', email)
      .select();

    if (error) {
      console.error('❌ Error updating role:', error);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log('✅ User upgraded successfully!\n');
    console.log('User details:');
    console.log(`  - Email: ${data[0].email}`);
    console.log(`  - Name: ${data[0].full_name}`);
    console.log(`  - Role: ${data[0].role}`);
    console.log(`  - Active: ${data[0].is_active}`);
    console.log(`  - Status: ${data[0].status}\n`);

    console.log('🔐 This user now has full admin access, including:');
    console.log('  ✓ Manage settings (affiliate, AI providers)');
    console.log('  ✓ Manage users and roles');
    console.log('  ✓ Full access to all modules\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

upgradeToAdmin();
