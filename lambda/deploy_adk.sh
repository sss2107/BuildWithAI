#!/bin/bash

# Deploy ADK-powered chatbot to AWS Lambda
set -e

echo "🚀 Deploying Google ADK Chatbot to AWS Lambda..."

# Check if Gemini API key is in Secrets Manager
echo "📝 Checking for Gemini API key in Secrets Manager..."

if ! aws secretsmanager describe-secret --secret-id chatbot/gemini-api-key 2>/dev/null; then
    echo ""
    echo "⚠️  Gemini API key not found in Secrets Manager!"
    echo ""
    echo "Please create it first:"
    echo "1. Get your Gemini API key from: https://makersuite.google.com/app/apikey"
    echo "2. Run this command:"
    echo ""
    echo '   aws secretsmanager create-secret \'
    echo '       --name chatbot/gemini-api-key \'
    echo '       --secret-string '"'"'{"GEMINI_API_KEY":"YOUR_KEY_HERE"}'"'"' \'
    echo '       --region us-east-1'
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Gemini API key found in Secrets Manager"
fi

# Copy content files to lambda directory
echo "📁 Copying content files..."
mkdir -p content
cp -r ../content/*.txt content/ 2>/dev/null || echo "Warning: Some content files not found"

# Rename new handler to main handler
echo "🔄 Using ADK handler..."
cp chatbot_handler_adk.py chatbot_handler.py

# Build with SAM
echo "📦 Building SAM application..."
sam build

# Deploy
echo "🚢 Deploying to AWS..."
sam deploy

# Get API endpoint
echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Getting API endpoint..."
API_URL=$(aws cloudformation describe-stacks \
    --stack-name sahil-resume-chatbot-stack \
    --query "Stacks[0].Outputs[?OutputKey=='ChatbotApi'].OutputValue" \
    --output text 2>/dev/null || echo "")

if [ -n "$API_URL" ]; then
    echo ""
    echo "🎉 Your ADK chatbot is live!"
    echo "   API Endpoint: $API_URL"
    echo ""
    echo "📝 Test it:"
    echo "   curl -X POST $API_URL \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"question\":\"Who are you?\"}'"
    echo ""
    echo "🔍 View logs:"
    echo "   sam logs -n ChatbotFunction --stack-name sahil-resume-chatbot-stack --tail"
fi

echo ""
echo "✨ Next steps:"
echo "   1. Update js/chatbot.js with new API endpoint"
echo "   2. Remove 'disabled' from chatbot input"
echo "   3. Push to GitHub Pages"
