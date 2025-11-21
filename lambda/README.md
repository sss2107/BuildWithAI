# 🚀 AWS Lambda RAG Chatbot Backend

This directory contains the serverless backend for Sahil's resume RAG chatbot using AWS Lambda.

## 📁 Project Structure

```
lambda/
├── chatbot_handler.py       # Main Lambda function handler
├── prepare_resume_data.py   # Script to prepare resume data for RAG
├── requirements.txt          # Python dependencies
├── template.yaml            # AWS SAM template (Infrastructure as Code)
├── deploy_with_sam.sh       # Easy deployment script (RECOMMENDED)
├── deploy.sh                # Manual deployment script
└── README.md                # This file
```

## 🎯 Architecture

```
GitHub Pages → API Gateway → Lambda → [Vector DB / OpenAI]
                                    → Secrets Manager (API keys)
```

## 🔧 Prerequisites

### 1. Install AWS CLI
```bash
# macOS
brew install awscli

# Verify
aws --version
```

### 2. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Region: us-east-1
# Output format: json
```

### 3. Install AWS SAM CLI (RECOMMENDED)
```bash
# macOS
brew install aws-sam-cli

# Verify
sam --version
```

## 🚀 Quick Start (Using SAM - Easiest!)

### Step 1: Deploy the Backend
```bash
cd lambda
chmod +x deploy_with_sam.sh
./deploy_with_sam.sh
```

This will:
- ✅ Create Lambda function
- ✅ Create API Gateway
- ✅ Set up IAM roles
- ✅ Enable CORS
- ✅ Return your API endpoint URL

### Step 2: Get Your API Endpoint
After deployment, you'll see:
```
🌐 Your API endpoint:
   https://xxxxx.execute-api.us-east-1.amazonaws.com/Prod/chat
```

### Step 3: Update Your Chatbot
Update `js/chatbot.js` with your API endpoint:

```javascript
// In chatbot.js, update sendMessage() method:
async sendMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (message) {
        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        
        try {
            // Call your Lambda API
            const response = await fetch('YOUR_API_ENDPOINT_HERE', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question: message })
            });
            
            const data = await response.json();
            this.addMessage(data.answer, 'bot');
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }
}
```

### Step 4: Enable the Chatbot Input
In `js/chatbot.js`, remove the `disabled` attribute:

```javascript
// Change from:
<input ... disabled>
<button ... disabled>

// To:
<input ... placeholder="Ask about Sahil's experience...">
<button ...>
```

### Step 5: Test!
```bash
# Test your API directly
curl -X POST YOUR_API_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"question":"Tell me about your experience"}'
```

## 🧪 Local Testing

Test the Lambda function locally:
```bash
cd lambda
python3 chatbot_handler.py
```

## 📊 Current Implementation

### Phase 1: Simple Keyword Matching (Current)
The Lambda function currently uses simple keyword matching for responses. This works for testing but needs upgrade to full RAG.

**Test questions that work:**
- "who are you"
- "tell me about your experience"
- "what projects have you built"
- "what are your skills"
- "what education do you have"
- "what achievements do you have"

### Phase 2: Full RAG (Next Steps)

To implement full RAG:

1. **Choose Vector Database:**
   - Pinecone (easiest, has free tier)
   - Weaviate Cloud (free tier)
   - AWS OpenSearch (more complex)

2. **Add Dependencies:**
   ```bash
   # Uncomment in requirements.txt:
   openai==1.3.0
   langchain==0.1.0
   pinecone-client==3.0.0
   sentence-transformers==2.2.2
   ```

3. **Store OpenAI API Key in Secrets Manager:**
   ```bash
   aws secretsmanager create-secret \
       --name chatbot/openai-api-key \
       --secret-string '{"OPENAI_API_KEY":"sk-proj-xxxxx"}' \
       --region us-east-1
   ```

4. **Update Lambda Handler:**
   - Add embedding generation
   - Vector similarity search
   - LLM response generation

## 💰 Cost Estimate

**Free Tier (First 12 months):**
- Lambda: 1M requests/month FREE
- API Gateway: 1M requests/month FREE
- Secrets Manager: $0.40/month for 1 secret

**After Free Tier:**
- Lambda: $0.20 per 1M requests
- API Gateway: $1.00 per 1M requests
- **Expected cost for your use case: <$1/month**

## 📝 Useful Commands

```bash
# View Lambda logs
sam logs -n ChatbotFunction --stack-name sahil-resume-chatbot-stack --tail

# Update function code
sam build && sam deploy

# Delete everything
aws cloudformation delete-stack --stack-name sahil-resume-chatbot-stack

# Test Lambda locally
sam local invoke ChatbotFunction -e test_event.json

# View CloudFormation stack
aws cloudformation describe-stacks --stack-name sahil-resume-chatbot-stack
```

## 🐛 Troubleshooting

### CORS Error
If you get CORS error in browser:
- Check API Gateway CORS settings
- Ensure `Access-Control-Allow-Origin: *` in Lambda response

### Lambda Timeout
If Lambda times out:
- Increase timeout in `template.yaml`
- Optimize your RAG queries

### Import Error
If boto3 import fails locally:
- Don't worry! boto3 is pre-installed in AWS Lambda
- For local testing: `pip install boto3`

## 📚 Next Steps

1. ✅ Deploy basic Lambda (you're here!)
2. ⬜ Prepare resume data chunks
3. ⬜ Set up Pinecone vector DB
4. ⬜ Add OpenAI API integration
5. ⬜ Implement full RAG pipeline
6. ⬜ Add conversation history
7. ⬜ Add voice feature (text-to-speech)

## 🔗 Resources

- [AWS Lambda Python](https://docs.aws.amazon.com/lambda/latest/dg/lambda-python.html)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
- [Pinecone Quickstart](https://docs.pinecone.io/docs/quickstart)
- [LangChain Documentation](https://python.langchain.com/docs/get_started/introduction)

---

Ready to deploy? Run: `./deploy_with_sam.sh` 🚀
