# Test database endpoint
Write-Host "Waiting for deployment..."
Start-Sleep -Seconds 30

$uri = "https://videoaffiliateapp.vercel.app/api/test-db"

try {
    Write-Host "Testing database endpoint..."
    $response = Invoke-RestMethod -Uri $uri -Method GET
    Write-Host "Success! Response:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
}
