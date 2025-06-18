#!/bin/bash

echo "🚀 Starting Edge Functions deployment..."

# Check if logged in to Supabase
echo "📋 Checking Supabase status..."
supabase status

if [ $? -ne 0 ]; then
    echo "❌ Please login to Supabase first: supabase login"
    exit 1
fi

# List current functions
echo "📝 Current functions:"
supabase functions list

# Deploy all functions
echo "🚀 Deploying all functions..."
supabase functions deploy

if [ $? -eq 0 ]; then
    echo "✅ All functions deployed successfully!"
    
    # Show deployed functions
    echo "📋 Deployed functions:"
    supabase functions list
    
    echo "🔍 Checking logs for any immediate errors..."
    sleep 2
    
    # Check logs for each function (last 10 lines)
    functions=("create-voice-session" "get-user-voice-sessions" "get-voice-session-status" "end-voice-session" "summarize-conversation")
    
    for func in "${functions[@]}"; do
        echo "📊 Logs for $func:"
        supabase functions logs "$func" --limit 5
        echo "---"
    done
    
    echo "🎉 Deployment completed! Monitor logs with:"
    echo "   supabase functions logs --follow"
    
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi 