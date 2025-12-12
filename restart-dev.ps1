# Script to clean restart Next.js dev server
Write-Host "=== Restarting Next.js Dev Server ===" -ForegroundColor Cyan

# Step 1: Kill all Node.js processes
Write-Host "`n[1/4] Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✓ Node.js processes stopped" -ForegroundColor Green

# Step 2: Delete .next cache
Write-Host "`n[2/4] Deleting .next cache..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ .next cache deleted" -ForegroundColor Green
} else {
    Write-Host "✓ .next folder doesn't exist (already clean)" -ForegroundColor Green
}

# Step 3: Clean npm cache (optional)
Write-Host "`n[3/4] Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>$null
Write-Host "✓ npm cache cleaned" -ForegroundColor Green

# Step 4: Start dev server
Write-Host "`n[4/4] Starting dev server..." -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
npm run dev
