# Kill all Node.js processes
Write-Host "Killing all Node.js processes..." -ForegroundColor Yellow

Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "next-server" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "All Node.js processes killed!" -ForegroundColor Green
Write-Host "You can now run 'npm run dev' again." -ForegroundColor Cyan
