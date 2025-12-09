#!/bin/bash

# Fast Lambda Deployment Script
# Skips dependency installation to save time
# ONLY use this if you haven't added new Python libraries

echo "🚀 Fast deploying Lambda function..."

# 1. Copy latest code
echo "📂 Copying code..."
cp chatbot_handler.py package/
cp calendar_integration.py package/
cp -r content package/

# 2. Zip package
echo "📦 Zipping package..."
cd package
zip -r -q ../lambda_function.zip .
cd ..

# 3. Upload to Lambda
echo "Vk Uploading to AWS Lambda..."
aws lambda update-function-code \
  --function-name sahil-resume-chatbot \
  --zip-file fileb://lambda_function.zip \
  --region us-east-1 \
  --no-cli-pager

echo "✅ Deployment complete!"
