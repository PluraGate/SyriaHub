#!/usr/bin/env pwsh
# Apply AI Moderation Database Migration
# This script applies the moderation fields migration to your Supabase database

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "AI Moderation Migration Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if supabase CLI is installed
$supabaseVersion = supabase --version 2>$null
if (-not $supabaseVersion) {
    Write-Host "Error: Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Install it first: scoop install supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "Supabase CLI found: $supabaseVersion" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "supabase/migrations/20250106000000_add_moderation_fields.sql")) {
    Write-Host "Error: Migration file not found!" -ForegroundColor Red
    Write-Host "Make sure you're running this from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "Migration file found ✓" -ForegroundColor Green
Write-Host ""

# Ask user which environment
Write-Host "Which environment do you want to migrate?" -ForegroundColor Yellow
Write-Host "1. Local (supabase start)" -ForegroundColor White
Write-Host "2. Remote (production/staging)" -ForegroundColor White
$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "Applying migration to LOCAL database..." -ForegroundColor Cyan
    
    # Check if local Supabase is running
    $status = supabase status 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Local Supabase is not running!" -ForegroundColor Red
        Write-Host "Start it with: supabase start" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Local Supabase is running ✓" -ForegroundColor Green
    Write-Host ""
    
    # Apply migration
    Write-Host "Applying migration..." -ForegroundColor Cyan
    supabase db reset
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Migration applied successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Migration failed!" -ForegroundColor Red
        exit 1
    }
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "Applying migration to REMOTE database..." -ForegroundColor Cyan
    
    # Check if linked to a project
    $linked = Test-Path ".supabase/config.toml"
    if (-not $linked) {
        Write-Host "Error: Not linked to a Supabase project!" -ForegroundColor Red
        Write-Host "Link first with: supabase link --project-ref YOUR_PROJECT_REF" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Project link found ✓" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "WARNING: This will modify your PRODUCTION database!" -ForegroundColor Red
    $confirm = Read-Host "Are you sure? (yes/no)"
    
    if ($confirm -ne "yes") {
        Write-Host "Migration cancelled." -ForegroundColor Yellow
        exit 0
    }
    
    # Apply migration
    Write-Host ""
    Write-Host "Pushing migration to remote..." -ForegroundColor Cyan
    supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Migration applied successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Migration failed!" -ForegroundColor Red
        exit 1
    }
    
} else {
    Write-Host "Invalid choice. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "1. Add your API keys to .env.local:" -ForegroundColor White
Write-Host "   OPENAI_API_KEY=sk-your-key-here" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Restart your dev server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test the moderation:" -ForegroundColor White
Write-Host "   Try creating a post with offensive content" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Read the documentation:" -ForegroundColor White
Write-Host "   MODERATION_DOCUMENTATION.md" -ForegroundColor Gray
Write-Host "   MODERATION_QUICK_REFERENCE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Done! 🎉" -ForegroundColor Green
