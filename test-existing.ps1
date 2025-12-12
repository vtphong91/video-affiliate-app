# Test existing endpoints
Write-Host "Testing existing endpoints..."

# Test manual-cron GET
$uri1 = "https://videoaffiliateapp.vercel.app/api/manual-cron"
$headers = @{
    "x-cron-secret" = "dev-secret"
}

try {
    Write-Host "Testing /api/manual-cron (GET)..."
    $response1 = Invoke-RestMethod -Uri $uri1 -Method GET -Headers $headers
    Write-Host "Success! Response:"
    $response1 | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
}

Write-Host "`n" + "="*50 + "`n"

# Test manual-cron POST
try {
    Write-Host "Testing /api/manual-cron (POST)..."
    $response2 = Invoke-RestMethod -Uri $uri1 -Method POST -Headers $headers
    Write-Host "Success! Response:"
    $response2 | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
}


