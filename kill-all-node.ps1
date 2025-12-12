# Kill all Node.js processes
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "All Node.js processes stopped!" -ForegroundColor Green
