# 🚀 Quick Setup Guide - Google ADK Chatbot

## Step 1: Get Gemini API Key (Free!)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy your key

## Step 2: Test Locally (Optional but Recommended)

```bash
# Set API key
export GEMINI_API_KEY='your-api-key-here'

# Go to lambda directory
cd /Users/sahil_sharma/Downloads/BuildWithAI/lambda

# Run local tests
python3 test_adk_local.py
```

You should see responses for questions like "Who are you?", "Tell me about your projects", etc.

## Step 3: Store API Key in AWS

```bash
aws secretsmanager create-secret \
    --name chatbot/gemini-api-key \
    --secret-string '{"GEMINI_API_KEY":"YOUR_KEY_HERE"}' \
    --region us-east-1
```

Replace `YOUR_KEY_HERE` with your actual Gemini API key.

## Step 4: Deploy to Lambda

```bash
cd /Users/sahil_sharma/Downloads/BuildWithAI/lambda
./deploy_adk.sh
```

This will:
- ✅ Check for Gemini API key in Secrets Manager
- ✅ Copy content files to Lambda package
- ✅ Build and deploy with SAM
- ✅ Return your new API endpoint

## Step 5: Update Frontend

1. Copy the API endpoint URL from deployment output
2. Open `js/chatbot.js`
3. Update line 8:
   ```javascript
   this.apiEndpoint = 'https://YOUR_NEW_ENDPOINT/Prod/chat';
   ```
4. Remove `disabled` from input (lines 65, 67)

## Step 6: Test & Deploy

```bash
# Commit changes
git add -A
git commit -m "Implement Google ADK agent with Gemini Flash 2.5"
git push origin main
```

Your chatbot will be live on GitHub Pages in 1-2 minutes! 🎉

---

## 🧪 Testing the API

After deployment, test with:

```bash
curl -X POST https://YOUR_ENDPOINT/Prod/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Who are you?"}'
```

Expected response:
```json
{
  "answer": "I'm Sahil Sharma, a Senior Data Scientist at Singapore Airlines...",
  "question": "Who are you?",
  "model": "gemini-2.0-flash-exp",
  "agent": "google-adk"
}
```

---

## 💰 Cost Estimate

**Gemini Flash 2.5 Pricing:**
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

**Example:**
- 1,000 chatbot conversations
- Average: 500 tokens per conversation
- **Total cost: ~$0.01** ✨

**Free tier:** First 1,500 requests/day are FREE!

---

## 🆘 Troubleshooting

### "API key not configured"
- Check secret exists: `aws secretsmanager list-secrets`
- Verify secret name is exactly: `chatbot/gemini-api-key`

### "Content files not found"
- Ensure `/content` directory exists in repo
- Files should be: Introduction.txt, AI_Projects.txt, etc.

### Local test fails
- Make sure `GEMINI_API_KEY` is set: `echo $GEMINI_API_KEY`
- Run from lambda directory
- Check Python version: `python3 --version` (need 3.9+)

---

**Need help?** Check `ADK_README.md` for detailed documentation!
