#!/bin/bash

# Auto-Sync Script - Tự động commit và push code lên GitHub
# Usage: ./auto-sync.sh [commit-message]

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Starting Auto-Sync...${NC}"

# Kiểm tra xem có trong git repository không
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not a git repository${NC}"
    exit 1
fi

# Lấy branch hiện tại
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}📍 Current branch: ${CURRENT_BRANCH}${NC}"

# Kiểm tra xem có thay đổi không
if [[ -z $(git status -s) ]]; then
    echo -e "${YELLOW}ℹ️  No changes to commit${NC}"
    exit 0
fi

# Hiển thị những file đã thay đổi
echo -e "${BLUE}📝 Changed files:${NC}"
git status -s

# Tạo commit message
TIMESTAMP=$(date +'%Y-%m-%d %H:%M:%S')
if [ -n "$1" ]; then
    COMMIT_MSG="$1"
else
    COMMIT_MSG="Auto-sync: Update codebase ($TIMESTAMP)"
fi

echo -e "${BLUE}💬 Commit message: ${COMMIT_MSG}${NC}"

# Add tất cả changes
echo -e "${BLUE}➕ Adding all changes...${NC}"
git add -A

# Commit
echo -e "${BLUE}💾 Creating commit...${NC}"
git commit -m "$COMMIT_MSG"

# Push với retry logic
echo -e "${BLUE}🚀 Pushing to ${CURRENT_BRANCH}...${NC}"

max_retries=4
retry_count=0
retry_delay=2

while [ $retry_count -lt $max_retries ]; do
    if git push -u origin "$CURRENT_BRANCH"; then
        echo -e "${GREEN}✅ Successfully synced to GitHub!${NC}"
        echo -e "${GREEN}📍 Branch: ${CURRENT_BRANCH}${NC}"
        echo -e "${GREEN}💬 Message: ${COMMIT_MSG}${NC}"
        exit 0
    else
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $max_retries ]; then
            echo -e "${YELLOW}⚠️  Push failed, retrying in ${retry_delay}s... (Attempt $retry_count/$max_retries)${NC}"
            sleep $retry_delay
            retry_delay=$((retry_delay * 2))
        else
            echo -e "${RED}❌ Failed to push after $max_retries attempts${NC}"
            exit 1
        fi
    fi
done
