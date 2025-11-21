#!/bin/bash

# AWS SAM Deployment (RECOMMENDED - Much Easier!)
# This automates everything: Lambda + API Gateway + IAM roles

set -e

echo "🚀 Deploying with AWS SAM (Serverless Application Model)..."

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "❌ AWS SAM CLI not found. Installing..."
    echo "Run: brew install aws-sam-cli"
    exit 1
fi

# Configuration
STACK_NAME="sahil-resume-chatbot-stack"
REGION="us-east-1"

echo "📦 Building SAM application..."
sam build

echo "🚢 Deploying to AWS..."
sam deploy \
    --stack-name $STACK_NAME \
    --region $REGION \
    --capabilities CAPABILITY_IAM \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Getting API endpoint..."
API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ChatbotApi`].OutputValue' \
    --output text)

echo ""
echo "🌐 Your API endpoint:"
echo "   $API_URL"
echo ""
echo "📝 Next steps:"
echo "1. Copy the API URL above"
echo "2. Update chatbot.js with this URL"
echo "3. Test with: curl -X POST $API_URL -d '{\"question\":\"who are you?\"}'"
echo ""
echo "🔍 To view logs:"
echo "   sam logs -n ChatbotFunction --stack-name $STACK_NAME --tail"
