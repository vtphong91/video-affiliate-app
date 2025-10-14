# Test debug endpoint
$uri = "https://videoaffiliateapp.vercel.app/api/cron/debug-schedules"
$headers = @{
    "x-cron-secret" = "dev-secret"
}

try {
    Write-Host "Testing debug endpoint..."
    $response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
    Write-Host "Success! Response:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Response: $($_.Exception.Response)"
}
