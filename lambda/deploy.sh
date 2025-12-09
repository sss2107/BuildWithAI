#!/bin/bash

# AWS Lambda Deployment Script for RAG Chatbot
# This script packages and deploys your Lambda function

set -e  # Exit on error

echo "🚀 Deploying RAG Chatbot to AWS Lambda..."

# Configuration
FUNCTION_NAME="sahil-resume-chatbot"
REGION="us-east-1"
RUNTIME="python3.11"
HANDLER="chatbot_handler.lambda_handler"
ROLE_NAME="lambda-chatbot-role"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Installing dependencies for Linux x86_64...${NC}"
# Install only necessary dependencies (boto3/botocore already in Lambda runtime)
# Only install google-genai and its required dependencies
pip3 install google-genai pydantic -t package/ --platform manylinux2014_x86_64 --only-binary=:all: --upgrade

# Remove AWS SDK packages (already in Lambda runtime) to reduce size
rm -rf package/boto3* package/botocore* package/s3transfer* package/jmespath*

# Remove unnecessary HTTP/network packages (Lambda provides these)
rm -rf package/urllib3* package/requests* package/certifi* package/charset_normalizer* package/idna*

# Remove image processing packages (not needed for chatbot)
rm -rf package/PIL* package/pillow* package/websockets*

echo -e "${BLUE}Step 2: Copying Lambda handler and content files...${NC}"
cp chatbot_handler.py package/
cp calendar_integration.py package/
cp -r content package/

echo -e "${BLUE}Step 3: Creating deployment package...${NC}"
cd package
zip -r ../lambda_function.zip .
cd ..

echo -e "${BLUE}Step 4: Creating IAM role (if not exists)...${NC}"
# Check if role exists
if aws iam get-role --role-name $ROLE_NAME 2>/dev/null; then
    echo "Role $ROLE_NAME already exists"
else
    echo "Creating role $ROLE_NAME..."
    
    # Create trust policy
    cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
    
    # Create role
    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file://trust-policy.json
    
    # Attach basic Lambda execution policy
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    # Attach DynamoDB policy for calendar bookings
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
    
    # Attach SES policy for email notifications
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess
    
    echo "Waiting for role to be available..."
    sleep 10
fi

# Get role ARN
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
echo "Role ARN: $ROLE_ARN"

echo -e "${BLUE}Step 5: Creating/Updating Lambda function...${NC}"
# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>/dev/null; then
    echo "Updating existing function code..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://lambda_function.zip \
        --region $REGION
    
    echo "Updating environment variables..."
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --environment "Variables={LOG_LEVEL=INFO,GEMINI_API_KEY=AIzaSyAl_G4d74NhGbkRplXTYAqtSxIEN4Qfwkk}" \
        --region $REGION
else
    echo "Creating new function..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --role $ROLE_ARN \
        --handler $HANDLER \
        --zip-file fileb://lambda_function.zip \
        --timeout 30 \
        --memory-size 512 \
        --environment "Variables={LOG_LEVEL=INFO,GEMINI_API_KEY=AIzaSyAl_G4d74NhGbkRplXTYAqtSxIEN4Qfwkk}" \
        --region $REGION
fi

echo -e "${BLUE}Step 6: Updating IAM permissions for existing role...${NC}"
# Add DynamoDB and SES permissions if not already attached
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess \
    2>/dev/null || echo "DynamoDB policy already attached"

aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess \
    2>/dev/null || echo "SES policy already attached"

echo -e "${BLUE}Step 6: Creating API Gateway...${NC}"
# This will be done through AWS Console or SAM template
echo "⚠️  Manual step: Create API Gateway REST API and connect to Lambda"
echo "   OR use AWS SAM template (see deploy_with_sam.sh)"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Go to AWS Console → API Gateway"
echo "2. Create new REST API"
echo "3. Create POST method → Connect to Lambda: $FUNCTION_NAME"
echo "4. Enable CORS"
echo "5. Deploy API to 'prod' stage"
echo "6. Copy API endpoint URL"
echo "7. Update chatbot.js with your API endpoint"

# Cleanup
rm -rf package
rm trust-policy.json 2>/dev/null || true

echo ""
echo "📝 Function ARN:"
aws lambda get-function --function-name $FUNCTION_NAME --region $REGION --query 'Configuration.FunctionArn' --output text
