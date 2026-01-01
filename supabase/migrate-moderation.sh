#!/bin/bash
# Apply AI Moderation Database Migration
# This script applies the moderation fields migration to your Supabase database

echo "=================================="
echo "AI Moderation Migration Script"
echo "=================================="
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI not found!"
    echo "Install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

SUPABASE_VERSION=$(supabase --version)
echo "Supabase CLI found: $SUPABASE_VERSION"
echo ""

# Check if we're in the right directory
if [ ! -f "supabase/migrations/20250106000000_add_moderation_fields.sql" ]; then
    echo "Error: Migration file not found!"
    echo "Make sure you're running this from the project root directory."
    exit 1
fi

echo "Migration file found ✓"
echo ""

# Ask user which environment
echo "Which environment do you want to migrate?"
echo "1. Local (supabase start)"
echo "2. Remote (production/staging)"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "Applying migration to LOCAL database..."
    
    # Check if local Supabase is running
    if ! supabase status &> /dev/null; then
        echo "Error: Local Supabase is not running!"
        echo "Start it with: supabase start"
        exit 1
    fi
    
    echo "Local Supabase is running ✓"
    echo ""
    
    # Apply migration
    echo "Applying migration..."
    supabase db reset
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Migration applied successfully!"
    else
        echo ""
        echo "✗ Migration failed!"
        exit 1
    fi
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "Applying migration to REMOTE database..."
    
    # Check if linked to a project
    if [ ! -f ".supabase/config.toml" ]; then
        echo "Error: Not linked to a Supabase project!"
        echo "Link first with: supabase link --project-ref YOUR_PROJECT_REF"
        exit 1
    fi
    
    echo "Project link found ✓"
    echo ""
    
    echo "WARNING: This will modify your PRODUCTION database!"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "Migration cancelled."
        exit 0
    fi
    
    # Apply migration
    echo ""
    echo "Pushing migration to remote..."
    supabase db push
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Migration applied successfully!"
    else
        echo ""
        echo "✗ Migration failed!"
        exit 1
    fi
    
else
    echo "Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "=================================="
echo "Next Steps:"
echo "=================================="
echo "1. Add your API keys to .env.local:"
echo "   OPENAI_API_KEY=sk-your-key-here"
echo ""
echo "2. Restart your dev server:"
echo "   npm run dev"
echo ""
echo "3. Test the moderation:"
echo "   Try creating a post with offensive content"
echo ""
echo "4. Read the documentation:"
echo "   MODERATION_DOCUMENTATION.md"
echo "   MODERATION_QUICK_REFERENCE.md"
echo ""
echo "Done! 🎉"
