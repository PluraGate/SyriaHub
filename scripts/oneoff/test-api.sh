#!/bin/bash

# API Testing Script for SyriaHub
# Tests all major endpoints to verify functionality

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_URL="$BASE_URL/api"

echo "🧪 SyriaHub API Testing Script"
echo "==============================="
echo "Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local data=$5
    
    echo -n "Testing: $description... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "$API_URL$endpoint" 2>/dev/null)
    fi
    
    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status)"
        echo "Response: $body"
        ((FAILED++))
    fi
}

echo "1. Testing Public Endpoints"
echo "----------------------------"
test_endpoint "GET" "/posts" 200 "GET /posts (public)"
test_endpoint "GET" "/tags" 200 "GET /tags (public)"
test_endpoint "GET" "/roles" 200 "GET /roles (public)"
echo ""

echo "2. Testing Authentication (should fail without credentials)"
echo "-----------------------------------------------------------"
test_endpoint "POST" "/posts" 401 "POST /posts (no auth)" '{"title":"Test","content":"Test content"}'
test_endpoint "GET" "/reports" 401 "GET /reports (no auth)"
test_endpoint "GET" "/users" 401 "GET /users (no auth)"
echo ""

echo "3. Testing Invalid Requests"
echo "---------------------------"
test_endpoint "POST" "/auth/signup" 422 "Signup without required fields" '{}'
test_endpoint "POST" "/auth/login" 400 "Login with invalid credentials" '{"email":"invalid@test.com","password":"wrong"}'
test_endpoint "GET" "/posts/invalid-uuid" 400 "GET post with invalid ID"
echo ""

echo "4. Testing Pagination"
echo "---------------------"
test_endpoint "GET" "/posts?limit=5&offset=0" 200 "GET posts with pagination"
test_endpoint "GET" "/posts?limit=100&offset=0" 200 "GET posts with large limit"
echo ""

echo "5. Testing Search and Filters"
echo "------------------------------"
test_endpoint "GET" "/posts?search=research" 200 "Search posts"
test_endpoint "GET" "/posts?tag=Education" 200 "Filter by tag"
test_endpoint "GET" "/tags?discipline=Medicine" 200 "Filter tags by discipline"
echo ""

echo ""
echo "========================================="
echo "Test Results:"
echo "========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
