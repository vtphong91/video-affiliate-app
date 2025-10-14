# Test Cron Endpoint Script (PowerShell)
# Usage: .\test-cron.ps1 YOUR_APP_URL CRON_SECRET

param(
    [Parameter(Mandatory=$true)]
    [string]$AppUrl,

    [Parameter(Mandatory=$false)]
    [string]$CronSecret = "dev-secret"
)

Write-Host "🔍 Testing Cron Endpoint" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "App URL: $AppUrl" -ForegroundColor Yellow
Write-Host "Cron Secret: $($CronSecret.Substring(0, [Math]::Min(10, $CronSecret.Length)))..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Check endpoint exists
Write-Host "[1/3] Checking endpoint exists..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "https://$AppUrl/api/cron/check-schedules" -Method Get -ErrorAction SilentlyContinue
    $statusCode = $response.StatusCode
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
}

if ($statusCode -eq 401) {
    Write-Host "✅ Endpoint exists (returns 401 without auth)" -ForegroundColor Green
}
elseif ($statusCode -eq 200) {
    Write-Host "✅ Endpoint exists and accessible" -ForegroundColor Green
}
else {
    Write-Host "❌ Endpoint not found (HTTP $statusCode)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Test with secret
Write-Host "[2/3] Testing with CRON_SECRET..." -ForegroundColor Blue
try {
    $headers = @{
        "x-cron-secret" = $CronSecret
        "Content-Type" = "application/json"
    }

    $response = Invoke-WebRequest -Uri "https://$AppUrl/api/cron/check-schedules" -Method Get -Headers $headers
    $statusCode = $response.StatusCode
    $body = $response.Content | ConvertFrom-Json

    Write-Host "HTTP Code: $statusCode" -ForegroundColor Yellow

    if ($statusCode -eq 200) {
        Write-Host "✅ Authentication successful" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Blue
        $body | ConvertTo-Json -Depth 10 | Write-Host
    }
    else {
        Write-Host "❌ Authentication failed" -ForegroundColor Red
        Write-Host "Response:" -ForegroundColor Red
        $body | ConvertTo-Json -Depth 10 | Write-Host
        exit 1
    }
}
catch {
    Write-Host "❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Debug schedules
Write-Host "[3/3] Getting debug information..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "https://$AppUrl/api/cron/debug-schedules" -Method Get -Headers $headers
    $debugInfo = $response.Content | ConvertFrom-Json

    Write-Host "Debug Info:" -ForegroundColor Blue
    $debugInfo | ConvertTo-Json -Depth 10 | Write-Host
}
catch {
    Write-Host "⚠️ Debug endpoint failed: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "✅ All tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Check GitHub Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
Write-Host "2. Check Vercel Logs: https://vercel.com/dashboard"
Write-Host "3. Check Supabase schedules table"
Write-Host "4. Wait 5-10 minutes for GitHub Actions to run automatically"
Write-Host ""
