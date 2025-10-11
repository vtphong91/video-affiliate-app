# Auto Cron Job Runner
# Chạy cron job tự động để xử lý schedules quá hạn

Write-Host "🚀 Starting Auto Cron Job..." -ForegroundColor Green
Write-Host "⏰ Interval: 30 seconds" -ForegroundColor Yellow
Write-Host "🔗 API: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is running
$nodeProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcess) {
    Write-Host "⚠️  Node.js process already running. Stopping..." -ForegroundColor Yellow
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Start auto cron
Write-Host "🔄 Starting auto cron job..." -ForegroundColor Green
Start-Process -FilePath "node" -ArgumentList "auto-cron.js" -WindowStyle Hidden

Write-Host "✅ Auto Cron Job Started!" -ForegroundColor Green
Write-Host "📋 Monitoring schedules every 30 seconds..." -ForegroundColor Cyan
Write-Host "🛑 Press Ctrl+C to stop" -ForegroundColor Red
Write-Host ""

# Monitor for 5 minutes
$endTime = (Get-Date).AddMinutes(5)
while ((Get-Date) -lt $endTime) {
    Start-Sleep -Seconds 30
    
    # Check if schedules are being processed
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/cron/check-schedules" -Headers @{"x-cron-secret"="4c32057816828f973d578326de17767caac3e8befa4167f4bbbf01b1a46bad46"} -UseBasicParsing -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            Write-Host "📊 [$(Get-Date -Format 'HH:mm:ss')] Pending: $($data.pendingCount), Failed: $($data.failedCount)" -ForegroundColor White
        }
    } catch {
        Write-Host "❌ [$(Get-Date -Format 'HH:mm:ss')] Error checking schedules" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🛑 Auto Cron Job Monitoring Stopped" -ForegroundColor Yellow
Write-Host "💡 To stop auto cron: Stop-Process -Name 'node' -Force" -ForegroundColor Cyan
