# API Testing Script for SyriaHub (PowerShell)
# Tests all major endpoints to verify functionality

param(
    [string]$BaseUrl = "http://localhost:3000"
)

$ApiUrl = "$BaseUrl/api"

Write-Host "🧪 SyriaHub API Testing Script" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl"
Write-Host ""

$Passed = 0
$Failed = 0

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [int]$ExpectedStatus,
        [string]$Description,
        [string]$Data = $null
    )
    
    Write-Host -NoNewline "Testing: $Description... "
    
    try {
        $params = @{
            Uri = "$ApiUrl$Endpoint"
            Method = $Method
            ContentType = "application/json"
            UseBasicParsing = $true
        }
        
        if ($Data) {
            $params.Body = $Data
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $status = $response.StatusCode
        
        if ($status -eq $ExpectedStatus) {
            Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
            Write-Host " (Status: $status)"
            $script:Passed++
        } else {
            Write-Host "✗ FAIL" -ForegroundColor Red -NoNewline
            Write-Host " (Expected: $ExpectedStatus, Got: $status)"
            Write-Host "Response: $($response.Content)"
            $script:Failed++
        }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        
        if ($status -eq $ExpectedStatus) {
            Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
            Write-Host " (Status: $status)"
            $script:Passed++
        } else {
            Write-Host "✗ FAIL" -ForegroundColor Red -NoNewline
            Write-Host " (Expected: $ExpectedStatus, Got: $status)"
            $script:Failed++
        }
    }
}

Write-Host "1. Testing Public Endpoints" -ForegroundColor Yellow
Write-Host "----------------------------"
Test-Endpoint -Method "GET" -Endpoint "/posts" -ExpectedStatus 200 -Description "GET /posts (public)"
Test-Endpoint -Method "GET" -Endpoint "/tags" -ExpectedStatus 200 -Description "GET /tags (public)"
Test-Endpoint -Method "GET" -Endpoint "/roles" -ExpectedStatus 200 -Description "GET /roles (public)"
Write-Host ""

Write-Host "2. Testing Authentication (should fail without credentials)" -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------"
Test-Endpoint -Method "POST" -Endpoint "/posts" -ExpectedStatus 401 -Description "POST /posts (no auth)" -Data '{"title":"Test","content":"Test content"}'
Test-Endpoint -Method "GET" -Endpoint "/reports" -ExpectedStatus 401 -Description "GET /reports (no auth)"
Test-Endpoint -Method "GET" -Endpoint "/users" -ExpectedStatus 401 -Description "GET /users (no auth)"
Write-Host ""

Write-Host "3. Testing Invalid Requests" -ForegroundColor Yellow
Write-Host "---------------------------"
Test-Endpoint -Method "POST" -Endpoint "/auth/signup" -ExpectedStatus 422 -Description "Signup without required fields" -Data '{}'
Test-Endpoint -Method "GET" -Endpoint "/posts/invalid-uuid" -ExpectedStatus 400 -Description "GET post with invalid ID"
Write-Host ""

Write-Host "4. Testing Pagination" -ForegroundColor Yellow
Write-Host "---------------------"
Test-Endpoint -Method "GET" -Endpoint "/posts?limit=5&offset=0" -ExpectedStatus 200 -Description "GET posts with pagination"
Test-Endpoint -Method "GET" -Endpoint "/posts?limit=100&offset=0" -ExpectedStatus 200 -Description "GET posts with large limit"
Write-Host ""

Write-Host "5. Testing Search and Filters" -ForegroundColor Yellow
Write-Host "------------------------------"
Test-Endpoint -Method "GET" -Endpoint "/posts?search=research" -ExpectedStatus 200 -Description "Search posts"
Test-Endpoint -Method "GET" -Endpoint "/posts?tag=Education" -ExpectedStatus 200 -Description "Filter by tag"
Test-Endpoint -Method "GET" -Endpoint "/tags?discipline=Medicine" -ExpectedStatus 200 -Description "Filter tags by discipline"
Write-Host ""

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Test Results:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Passed: $Passed" -ForegroundColor Green
Write-Host "Failed: $Failed" -ForegroundColor $(if ($Failed -eq 0) { "Green" } else { "Red" })
Write-Host "Total: $($Passed + $Failed)"
Write-Host ""

if ($Failed -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some tests failed" -ForegroundColor Red
    exit 1
}
