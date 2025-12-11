#!/bin/bash

# Quick Lambda Deployment Script
# This updates ONLY the code, nothing else

echo "🚀 Quick deploying Lambda function..."

# Just update the code
aws lambda update-function-code \
  --function-name sahil-resume-chatbot \
  --zip-file fileb://lambda_function.zip \
  --region us-east-1 \
  --no-cli-pager

echo "✅ Deployment complete!"
