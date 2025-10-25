#!/usr/bin/env node

/**
 * File Watcher Auto-Sync
 * Tự động commit và push code khi phát hiện thay đổi file
 *
 * Usage: node watch-and-sync.js [options]
 *
 * Options:
 *   --interval <seconds>  Thời gian chờ giữa các lần sync (default: 300 = 5 phút)
 *   --debounce <seconds>  Thời gian debounce sau khi phát hiện thay đổi (default: 30)
 *   --help               Hiển thị help
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  interval: 300,  // 5 phút
  debounce: 30,   // 30 giây
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--interval' && args[i + 1]) {
    options.interval = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '--debounce' && args[i + 1]) {
    options.debounce = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '--help') {
    console.log(`
File Watcher Auto-Sync

Tự động commit và push code khi phát hiện thay đổi file

Usage: node watch-and-sync.js [options]

Options:
  --interval <seconds>  Thời gian chờ giữa các lần sync (default: 300 = 5 phút)
  --debounce <seconds>  Thời gian debounce sau khi phát hiện thay đổi (default: 30)
  --help               Hiển thị help

Examples:
  node watch-and-sync.js                    # Sử dụng cấu hình mặc định
  node watch-and-sync.js --interval 600     # Sync mỗi 10 phút
  node watch-and-sync.js --debounce 60      # Chờ 60 giây sau thay đổi cuối cùng
    `);
    process.exit(0);
  }
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(color, emoji, message) {
  const timestamp = new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh'
  });
  console.log(`${color}${emoji} [${timestamp}] ${message}${colors.reset}`);
}

// Kiểm tra xem có thay đổi không committed không
function hasChanges() {
  try {
    const status = execSync('git status -s', { encoding: 'utf-8' });
    return status.trim().length > 0;
  } catch (error) {
    log(colors.red, '❌', `Error checking git status: ${error.message}`);
    return false;
  }
}

// Thực hiện auto-sync
function autoSync() {
  try {
    if (!hasChanges()) {
      log(colors.yellow, 'ℹ️', 'No changes to commit');
      return false;
    }

    log(colors.blue, '🔄', 'Starting auto-sync...');

    // Lấy branch hiện tại
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8'
    }).trim();

    log(colors.blue, '📍', `Current branch: ${currentBranch}`);

    // Hiển thị file changes
    const changedFiles = execSync('git status -s', { encoding: 'utf-8' });
    log(colors.blue, '📝', 'Changed files:');
    console.log(changedFiles);

    // Tạo commit message
    const timestamp = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh'
    });
    const commitMsg = `Auto-sync: Update codebase (${timestamp})`;

    // Add all changes
    log(colors.blue, '➕', 'Adding all changes...');
    execSync('git add -A');

    // Commit
    log(colors.blue, '💾', 'Creating commit...');
    execSync(`git commit -m "${commitMsg}"`);

    // Push với retry logic
    log(colors.blue, '🚀', `Pushing to ${currentBranch}...`);

    let maxRetries = 4;
    let retryDelay = 2000; // milliseconds

    for (let i = 0; i < maxRetries; i++) {
      try {
        execSync(`git push -u origin ${currentBranch}`, { stdio: 'inherit' });
        log(colors.green, '✅', 'Successfully synced to GitHub!');
        log(colors.green, '💬', `Message: ${commitMsg}`);
        return true;
      } catch (error) {
        if (i < maxRetries - 1) {
          log(colors.yellow, '⚠️', `Push failed, retrying in ${retryDelay/1000}s... (Attempt ${i+1}/${maxRetries})`);
          // Sleep
          execSync(`sleep ${retryDelay/1000}`);
          retryDelay *= 2;
        } else {
          log(colors.red, '❌', `Failed to push after ${maxRetries} attempts`);
          return false;
        }
      }
    }
  } catch (error) {
    log(colors.red, '❌', `Error during auto-sync: ${error.message}`);
    return false;
  }
}

// Debounce timer
let debounceTimer = null;
let lastSyncTime = Date.now();

function scheduleSync() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    const now = Date.now();
    const timeSinceLastSync = (now - lastSyncTime) / 1000;

    if (timeSinceLastSync >= options.interval) {
      if (autoSync()) {
        lastSyncTime = now;
      }
    } else {
      const timeRemaining = Math.ceil(options.interval - timeSinceLastSync);
      log(colors.yellow, '⏱️', `Waiting ${timeRemaining}s before next sync (interval: ${options.interval}s)`);
    }

    debounceTimer = null;
  }, options.debounce * 1000);
}

// Main watcher function
function startWatcher() {
  log(colors.green, '👀', 'File watcher started');
  log(colors.blue, '⚙️', `Configuration: interval=${options.interval}s, debounce=${options.debounce}s`);
  log(colors.blue, 'ℹ️', 'Press Ctrl+C to stop');

  // Thư mục cần theo dõi
  const watchDirs = [
    path.join(__dirname, 'app'),
    path.join(__dirname, 'components'),
    path.join(__dirname, 'lib'),
    path.join(__dirname, 'types'),
    path.join(__dirname, 'sql'),
  ];

  // Lọc chỉ những thư mục tồn tại
  const validDirs = watchDirs.filter(dir => {
    try {
      return fs.existsSync(dir);
    } catch {
      return false;
    }
  });

  if (validDirs.length === 0) {
    log(colors.red, '❌', 'No valid directories to watch');
    process.exit(1);
  }

  log(colors.blue, '📁', `Watching directories: ${validDirs.map(d => path.basename(d)).join(', ')}`);

  // Watch từng thư mục
  validDirs.forEach(dir => {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename && !filename.includes('node_modules') && !filename.includes('.next')) {
        log(colors.yellow, '📄', `File changed: ${filename}`);
        scheduleSync();
      }
    });
  });

  // Sync định kỳ mỗi interval
  setInterval(() => {
    if (!debounceTimer && hasChanges()) {
      const now = Date.now();
      const timeSinceLastSync = (now - lastSyncTime) / 1000;

      if (timeSinceLastSync >= options.interval) {
        log(colors.blue, '⏰', `Periodic sync (${options.interval}s interval)`);
        if (autoSync()) {
          lastSyncTime = now;
        }
      }
    }
  }, options.interval * 1000);
}

// Graceful shutdown
process.on('SIGINT', () => {
  log(colors.yellow, '👋', 'Stopping file watcher...');

  // Sync changes cuối cùng nếu có
  if (hasChanges()) {
    log(colors.blue, '🔄', 'Syncing final changes...');
    autoSync();
  }

  process.exit(0);
});

// Start watcher
startWatcher();
