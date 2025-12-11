#!/bin/bash

# Deploy using AWS SAM (Serverless Application Model)
# First time: sam deploy --guided
# After that: just sam deploy

echo "🚀 Deploying with SAM..."

sam deploy --no-confirm-changeset --no-fail-on-empty-changeset
