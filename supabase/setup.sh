#!/bin/bash

# SyriaHub Database Setup Script
# Run this script to set up your local Supabase database

echo "🚀 SyriaHub Database Setup"
echo "================================"
echo ""

# Check if Supabase CLI is installed
echo "Checking for Supabase CLI..."

if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Please install it first:"
    echo "  npm install -g supabase"
    echo "  OR"
    echo "  brew install supabase/tap/supabase"
    exit 1
fi

SUPABASE_VERSION=$(supabase --version)
echo "✅ Supabase CLI found: $SUPABASE_VERSION"
echo ""

# Ask user which environment
echo "Select environment:"
echo "  1. Local development (supabase start)"
echo "  2. Remote project (requires project ref)"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "📦 Starting local Supabase..."
    supabase start
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Local Supabase started successfully!"
        echo ""
        echo "📊 Applying migrations..."
        supabase db reset
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Database schema created successfully!"
            echo ""
            echo "🎉 Setup complete!"
            echo ""
            echo "You can access:"
            echo "  - Studio: http://localhost:54323"
            echo "  - API: http://localhost:54321"
            echo ""
            echo "To stop: supabase stop"
        fi
    fi
elif [ "$choice" = "2" ]; then
    read -p "Enter your Supabase project reference: " projectRef
    
    echo ""
    echo "🔗 Linking to project: $projectRef..."
    supabase link --project-ref "$projectRef"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Project linked!"
        echo ""
        echo "📊 Pushing migrations..."
        supabase db push
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Database schema deployed!"
            echo ""
            echo "🎉 Setup complete!"
        fi
    fi
else
    echo ""
    echo "❌ Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "📖 Next steps:"
echo "  1. Enable Email Auth in Supabase Dashboard"
echo "  2. Create test users through the dashboard or API"
echo "  3. Update seed data file with user IDs (optional)"
echo "  4. Run: supabase db push (if you added seed data)"
echo ""
echo "📚 See supabase/README.md for more details"
echo ""
