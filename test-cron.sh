#!/bin/bash

# Test Cron Endpoint Script
# Usage: ./test-cron.sh YOUR_APP_URL CRON_SECRET

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}❌ Error: Missing arguments${NC}"
    echo "Usage: ./test-cron.sh YOUR_APP_URL [CRON_SECRET]"
    echo "Example: ./test-cron.sh video-affiliate-app.vercel.app dev-secret"
    exit 1
fi

APP_URL=$1
CRON_SECRET=${2:-"dev-secret"}

echo -e "${BLUE}🔍 Testing Cron Endpoint${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "App URL: ${YELLOW}$APP_URL${NC}"
echo -e "Cron Secret: ${YELLOW}${CRON_SECRET:0:10}...${NC}"
echo ""

# Test 1: Check endpoint exists
echo -e "${BLUE}[1/3] Checking endpoint exists...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$APP_URL/api/cron/check-schedules")

if [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}✅ Endpoint exists (returns 401 without auth)${NC}"
elif [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Endpoint exists and accessible${NC}"
else
    echo -e "${RED}❌ Endpoint not found (HTTP $HTTP_CODE)${NC}"
    exit 1
fi
echo ""

# Test 2: Test with secret
echo -e "${BLUE}[2/3] Testing with CRON_SECRET...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
    -H "x-cron-secret: $CRON_SECRET" \
    -H "Content-Type: application/json" \
    "https://$APP_URL/api/cron/check-schedules")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo -e "HTTP Code: ${YELLOW}$HTTP_CODE${NC}"

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Authentication successful${NC}"
    echo -e "${BLUE}Response:${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Authentication failed${NC}"
    echo -e "${RED}Response:${NC}"
    echo "$BODY"
    exit 1
fi
echo ""

# Test 3: Debug schedules
echo -e "${BLUE}[3/3] Getting debug information...${NC}"
DEBUG_RESPONSE=$(curl -s -X GET \
    -H "x-cron-secret: $CRON_SECRET" \
    -H "Content-Type: application/json" \
    "https://$APP_URL/api/cron/debug-schedules")

echo -e "${BLUE}Debug Info:${NC}"
echo "$DEBUG_RESPONSE" | jq . 2>/dev/null || echo "$DEBUG_RESPONSE"
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Check GitHub Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
echo "2. Check Vercel Logs: https://vercel.com/dashboard"
echo "3. Check Supabase schedules table"
echo "4. Wait 5-10 minutes for GitHub Actions to run automatically"
echo ""
