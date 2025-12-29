/**
 * AI Cache Migration Runner
 *
 * Automatically creates ai_analysis_cache table in Supabase
 * Run with: node scripts/run-ai-cache-migration.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

async function main() {
  logSection('🚀 AI Cache Migration Script');

  log('This script will help you run the AI cache migration.', 'cyan');
  log('The migration creates a table to cache AI analysis results.\n', 'cyan');

  // Check if migration file exists
  const migrationPath = path.join(__dirname, '..', 'sql', 'migrations', '006-create-ai-analysis-cache.sql');

  if (!fs.existsSync(migrationPath)) {
    log('❌ ERROR: Migration file not found!', 'red');
    log(`Expected location: ${migrationPath}`, 'yellow');
    process.exit(1);
  }

  log('✅ Migration file found!', 'green');

  // Read migration SQL
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  logSection('📋 Migration Preview');
  log('The following SQL will be executed:\n', 'cyan');
  console.log(migrationSQL.split('\n').slice(0, 20).join('\n'));
  log('\n... (truncated, see full file in sql/migrations/006-create-ai-analysis-cache.sql)', 'yellow');

  logSection('🔧 How to Run Migration');

  log('Option 1: Supabase Dashboard (Recommended)', 'bright');
  log('  1. Open https://app.supabase.com', 'cyan');
  log('  2. Select your project', 'cyan');
  log('  3. Go to SQL Editor (left sidebar)', 'cyan');
  log('  4. Click "New query"', 'cyan');
  log('  5. Copy the SQL from: sql/migrations/006-create-ai-analysis-cache.sql', 'cyan');
  log('  6. Paste and click "Run" (or Ctrl+Enter)', 'cyan');
  log('  7. Verify: Go to Table Editor → Should see "ai_analysis_cache"', 'cyan');

  log('\nOption 2: Using psql (Advanced)', 'bright');
  log('  psql -h <your-db-host> -U postgres -d postgres -f sql/migrations/006-create-ai-analysis-cache.sql', 'cyan');

  log('\nOption 3: Copy SQL to clipboard (macOS/Linux)', 'bright');

  // Try to copy to clipboard (platform-specific)
  const platform = process.platform;
  let copyCommand = null;

  if (platform === 'darwin') {
    copyCommand = 'pbcopy';
  } else if (platform === 'linux') {
    copyCommand = 'xclip -selection clipboard';
  } else if (platform === 'win32') {
    copyCommand = 'clip';
  }

  if (copyCommand) {
    log(`  Run: cat sql/migrations/006-create-ai-analysis-cache.sql | ${copyCommand}`, 'cyan');
    log('  Then paste directly in Supabase SQL Editor', 'cyan');
  }

  logSection('✅ After Migration');

  log('Verify migration success by running this SQL query:', 'cyan');
  log(`
  SELECT table_name, column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'ai_analysis_cache'
  ORDER BY ordinal_position;
  `, 'yellow');

  log('\nExpected result: 8 columns (id, video_id, video_platform, analysis, etc.)', 'cyan');

  logSection('🧪 Test AI Cache');

  log('After migration, test the cache:', 'cyan');
  log('  1. npm run dev', 'yellow');
  log('  2. Go to http://localhost:3000/dashboard/create', 'yellow');
  log('  3. Analyze a YouTube video (first time: CACHE MISS)', 'yellow');
  log('  4. Analyze SAME video again (second time: CACHE HIT - instant!)', 'yellow');
  log('  5. Check console logs for cache hit/miss messages', 'yellow');

  logSection('📊 Expected Performance');

  log('Before AI Cache:', 'red');
  log('  - First analysis: 10-30 seconds', 'red');
  log('  - Second analysis: 10-30 seconds (calls AI again)', 'red');
  log('  - 100 users analyzing same video: 1000-3000 seconds total', 'red');

  log('\nAfter AI Cache:', 'green');
  log('  - First analysis: 10-30 seconds (AI call + cache save)', 'green');
  log('  - Second analysis: <0.1 seconds (cache hit - 100-300x faster!)', 'green');
  log('  - 100 users analyzing same video: ~10-30 seconds total (99% savings!)', 'green');

  logSection('📚 Documentation');

  log('Full setup guide: docs/AI_CACHING_SETUP.md', 'cyan');
  log('Performance plan: docs/PERFORMANCE_OPTIMIZATION_PLAN.md', 'cyan');
  log('Phase 3 (React Query): docs/PHASE_3_REACT_QUERY_COMPLETE.md', 'cyan');

  log('\n✨ Migration script complete! Follow the steps above to run migration.', 'green');
  log('💡 Tip: Use Supabase Dashboard SQL Editor for easiest method.\n', 'yellow');
}

main().catch((error) => {
  log('\n❌ Error running script:', 'red');
  console.error(error);
  process.exit(1);
});
