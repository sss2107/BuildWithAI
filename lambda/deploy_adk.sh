#!/bin/bash

# Deploy ADK-powered chatbot to AWS Lambda
set -e

echo "🚀 Deploying Google ADK Chatbot to AWS Lambda..."

# Check if Gemini API key is in template.yaml
echo "📝 Checking for Gemini API key in template.yaml..."

if grep -q "GEMINI_API_KEY: \"YOUR_API_KEY_HERE\"" template.yaml; then
    echo ""
    echo "⚠️  Please update template.yaml with your Gemini API key!"
    echo ""
    echo "1. Get your key from: https://makersuite.google.com/app/apikey"
    echo "2. Edit template.yaml and replace YOUR_API_KEY_HERE with your actual key"
    echo "3. Re-run this script"
    echo ""
    read -p "Have you updated the API key in template.yaml? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Gemini API key found in template.yaml"
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
