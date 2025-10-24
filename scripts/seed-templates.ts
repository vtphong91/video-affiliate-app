#!/usr/bin/env node

/**
 * Seed System Templates
 *
 * This script inserts 6 predefined system templates into the database.
 * Run: npm run seed-templates
 */

import { createClient } from '@supabase/supabase-js';
import { systemTemplates } from '../lib/templates/system-templates';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedTemplates() {
  console.log('🌱 Starting template seeding...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const template of systemTemplates) {
    try {
      console.log(`📝 Seeding: ${template.name}`);

      // Check if template already exists
      const { data: existing } = await supabase
        .from('prompt_templates')
        .select('id, name')
        .eq('name', template.name)
        .eq('is_system', true)
        .single();

      if (existing) {
        console.log(`   ⏭️  Already exists, updating...`);

        const { error: updateError } = await supabase
          .from('prompt_templates')
          .update({
            description: template.description,
            category: template.category,
            platform: template.platform,
            content_type: template.content_type,
            config: template.config,
            prompt_template: template.prompt_template,
            variables: template.variables,
            is_active: template.is_active,
            is_public: template.is_public,
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error(`   ❌ Update failed:`, updateError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Updated successfully`);
          successCount++;
        }
      } else {
        console.log(`   ➕ Creating new template...`);

        const { error: insertError } = await supabase
          .from('prompt_templates')
          .insert({
            user_id: null, // System template has no owner
            name: template.name,
            description: template.description,
            category: template.category,
            platform: template.platform,
            content_type: template.content_type,
            config: template.config,
            prompt_template: template.prompt_template,
            variables: template.variables,
            is_system: template.is_system,
            is_public: template.is_public,
            is_active: template.is_active,
            usage_count: 0,
          });

        if (insertError) {
          console.error(`   ❌ Insert failed:`, insertError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Created successfully`);
          successCount++;
        }
      }

      console.log(''); // Empty line for readability
    } catch (error) {
      console.error(`   ❌ Unexpected error:`, error);
      errorCount++;
      console.log('');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SEEDING SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors:  ${errorCount}`);
  console.log(`📦 Total:   ${systemTemplates.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (errorCount === 0) {
    console.log('🎉 All templates seeded successfully!');
  } else {
    console.log('⚠️  Some templates failed to seed. Check errors above.');
    process.exit(1);
  }
}

// Verify templates
async function verifyTemplates() {
  console.log('🔍 Verifying seeded templates...\n');

  const { data, error } = await supabase
    .from('prompt_templates')
    .select('id, name, category, platform, is_system, usage_count')
    .eq('is_system', true)
    .order('category')
    .order('platform');

  if (error) {
    console.error('❌ Error fetching templates:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No system templates found in database.');
    return;
  }

  console.log(`Found ${data.length} system templates:\n`);

  const grouped: Record<string, any[]> = {};
  data.forEach((t) => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });

  Object.entries(grouped).forEach(([category, templates]) => {
    console.log(`📁 ${category.toUpperCase()}`);
    templates.forEach((t) => {
      console.log(`   - ${t.name} (${t.platform}) - Used ${t.usage_count} times`);
    });
    console.log('');
  });
}

// Main execution
(async () => {
  try {
    await seedTemplates();
    await verifyTemplates();
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
})();
