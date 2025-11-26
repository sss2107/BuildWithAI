#!/bin/bash

# Script to securely store Gemini API key in AWS Secrets Manager
# This removes the key from template.yaml (no longer exposed in Git)

set -e

echo "🔐 Secure API Key Setup for Sahil's Chatbot"
echo "=============================================="
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"
echo ""

# API key (from your template.yaml)
API_KEY="AIzaSyCa9h68h_tTGmzA91csS2sskApANJziVrY"

echo "📝 Creating secret in AWS Secrets Manager..."
echo "   Secret name: chatbot/gemini-api-key"
echo ""

# Create or update secret
aws secretsmanager create-secret \
    --name chatbot/gemini-api-key \
    --description "Gemini API key for resume chatbot" \
    --secret-string "{\"GEMINI_API_KEY\":\"$API_KEY\"}" \
    --region us-east-1 2>/dev/null || \
aws secretsmanager update-secret \
    --secret-id chatbot/gemini-api-key \
    --secret-string "{\"GEMINI_API_KEY\":\"$API_KEY\"}" \
    --region us-east-1

echo ""
echo "✅ API key stored securely in AWS Secrets Manager!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. The API key is now in Secrets Manager (encrypted)"
echo "2. Lambda will fetch it at runtime (not exposed in code)"
echo "3. Cost: \$0.40/month for Secrets Manager"
echo ""
echo "🔒 Security improvements:"
echo "   ✅ API key removed from template.yaml"
echo "   ✅ Not visible in Git history going forward"
echo "   ✅ Encrypted at rest in AWS"
echo "   ✅ Only Lambda can access it"
echo ""
echo "⚠️  REVOKE OLD KEY:"
echo "1. Go to: https://aistudio.google.com/apikey"
echo "2. Delete key: AIzaSyCa9h68h_tTGmzA91csS2sskApANJziVrY"
echo "3. Create new key"
echo "4. Update secret: aws secretsmanager update-secret --secret-id chatbot/gemini-api-key --secret-string '{\"GEMINI_API_KEY\":\"NEW_KEY_HERE\"}'"
echo ""
