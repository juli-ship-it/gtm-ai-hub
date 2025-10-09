#!/bin/bash

echo "🚀 Deploying Supabase Edge Function for AI Analysis..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Deploy the Edge Function
echo "📦 Deploying analyze-workflow function..."
npx supabase functions deploy analyze-workflow

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully!"
    
    # Check if OpenAI API key is set
    echo "🔑 Checking OpenAI API key..."
    npx supabase secrets list | grep OPENAI_API_KEY
    
    if [ $? -ne 0 ]; then
        echo "⚠️  OpenAI API key not found. Please set it:"
        echo "npx supabase secrets set OPENAI_API_KEY=sk-your-openai-api-key-here"
    else
        echo "✅ OpenAI API key is configured"
    fi
    
    echo ""
    echo "🎉 Setup complete! You can now:"
    echo "1. View logs: npx supabase functions logs analyze-workflow --follow"
    echo "2. Test function: npx supabase functions invoke analyze-workflow --data '{\"prompt\": \"test\"}'"
    echo "3. Upload a workflow in your app to see real AI analysis!"
    
else
    echo "❌ Failed to deploy Edge Function"
    exit 1
fi
