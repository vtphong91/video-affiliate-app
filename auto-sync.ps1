# Auto-Sync Script cho PowerShell - Tự động commit và push code lên GitHub
# Usage: .\auto-sync.ps1 [commit-message]

param(
    [string]$CommitMessage = ""
)

# Màu sắc cho output
function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Blue "🔄 Starting Auto-Sync..."

# Kiểm tra xem có trong git repository không
try {
    git rev-parse --git-dir 2>&1 | Out-Null
} catch {
    Write-ColorOutput Red "❌ Error: Not a git repository"
    exit 1
}

# Lấy branch hiện tại
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-ColorOutput Blue "📍 Current branch: $currentBranch"

# Kiểm tra xem có thay đổi không
$status = git status -s
if ([string]::IsNullOrEmpty($status)) {
    Write-ColorOutput Yellow "ℹ️  No changes to commit"
    exit 0
}

# Hiển thị những file đã thay đổi
Write-ColorOutput Blue "📝 Changed files:"
git status -s

# Tạo commit message
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
if ([string]::IsNullOrEmpty($CommitMessage)) {
    $commitMsg = "Auto-sync: Update codebase ($timestamp)"
} else {
    $commitMsg = $CommitMessage
}

Write-ColorOutput Blue "💬 Commit message: $commitMsg"

# Add tất cả changes
Write-ColorOutput Blue "➕ Adding all changes..."
git add -A

# Commit
Write-ColorOutput Blue "💾 Creating commit..."
git commit -m $commitMsg

# Push với retry logic
Write-ColorOutput Blue "🚀 Pushing to $currentBranch..."

$maxRetries = 4
$retryCount = 0
$retryDelay = 2

while ($retryCount -lt $maxRetries) {
    try {
        git push -u origin $currentBranch 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput Green "✅ Successfully synced to GitHub!"
            Write-ColorOutput Green "📍 Branch: $currentBranch"
            Write-ColorOutput Green "💬 Message: $commitMsg"
            exit 0
        } else {
            throw "Push failed with exit code $LASTEXITCODE"
        }
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-ColorOutput Yellow "⚠️  Push failed, retrying in ${retryDelay}s... (Attempt $retryCount/$maxRetries)"
            Start-Sleep -Seconds $retryDelay
            $retryDelay *= 2
        } else {
            Write-ColorOutput Red "❌ Failed to push after $maxRetries attempts"
            Write-ColorOutput Red "Error: $_"
            exit 1
        }
    }
}
