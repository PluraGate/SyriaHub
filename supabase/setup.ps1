# SyriaHub Database Setup Script
# Run this script to set up your local Supabase database

Write-Host "🚀 SyriaHub Database Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Supabase CLI is installed
Write-Host "Checking for Supabase CLI..." -ForegroundColor Yellow
$supabaseVersion = supabase --version 2>$null

if (-not $supabaseVersion) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "`nPlease install it first:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor White
    Write-Host "  OR" -ForegroundColor White
    Write-Host "  scoop install supabase" -ForegroundColor White
    exit 1
}

Write-Host "✅ Supabase CLI found: $supabaseVersion`n" -ForegroundColor Green

# Ask user which environment
Write-Host "Select environment:" -ForegroundColor Yellow
Write-Host "  1. Local development (supabase start)" -ForegroundColor White
Write-Host "  2. Remote project (requires project ref)" -ForegroundColor White
$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host "`n📦 Starting local Supabase..." -ForegroundColor Cyan
    supabase start
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Local Supabase started successfully!" -ForegroundColor Green
        Write-Host "`n📊 Applying migrations..." -ForegroundColor Cyan
        supabase db reset
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Database schema created successfully!" -ForegroundColor Green
            Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
            Write-Host "`nYou can access:" -ForegroundColor Yellow
            Write-Host "  - Studio: http://localhost:54323" -ForegroundColor White
            Write-Host "  - API: http://localhost:54321" -ForegroundColor White
            Write-Host "`nTo stop: supabase stop" -ForegroundColor Yellow
        }
    }
}
elseif ($choice -eq "2") {
    $projectRef = Read-Host "`nEnter your Supabase project reference"
    
    Write-Host "`n🔗 Linking to project: $projectRef..." -ForegroundColor Cyan
    supabase link --project-ref $projectRef
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Project linked!" -ForegroundColor Green
        Write-Host "`n📊 Pushing migrations..." -ForegroundColor Cyan
        supabase db push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Database schema deployed!" -ForegroundColor Green
            Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
        }
    }
}
else {
    Write-Host "`n❌ Invalid choice. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "`n📖 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Enable Email Auth in Supabase Dashboard" -ForegroundColor White
Write-Host "  2. Create test users through the dashboard or API" -ForegroundColor White
Write-Host "  3. Update seed data file with user IDs (optional)" -ForegroundColor White
Write-Host "  4. Run: supabase db push (if you added seed data)" -ForegroundColor White
Write-Host "`n📚 See supabase/README.md for more details`n" -ForegroundColor Yellow
