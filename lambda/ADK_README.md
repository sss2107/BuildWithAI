# 🤖 Google ADK Chatbot Implementation

Your chatbot now uses **Google ADK (Agent Development Kit)** with **Gemini Flash 2.5** and intelligent tool routing!

## 🎯 How It Works

```
User asks: "Tell me about your projects"
    ↓
AWS Lambda receives request
    ↓
Google ADK Agent (Gemini Flash 2.5)
    ↓
Analyzes question → Calls get_ai_projects() tool
    ↓
Reads content/AI_Projects.txt
    ↓
Gemini generates natural response
    ↓
Returns to user
```

## 🛠️ Available Tools

The agent has **6 tools** mapped to your content files:

| Tool | File | Use Case |
|------|------|----------|
| `get_introduction()` | Introduction.txt | "Who are you?" |
| `get_ai_projects()` | AI_Projects.txt | "What projects?" |
| `get_experience()` | Experience.txt | "Your experience?" |
| `get_education()` | Education.txt | "Where did you study?" |
| `get_skills()` | Skills.txt | "What skills?" |
| `get_extracurriculars()` | ExtraCurriculars.txt | "Achievements? Awards?" |

## 🚀 Deployment Steps

### 1. Get Gemini API Key

Get your free API key from: https://makersuite.google.com/app/apikey

### 2. Store in AWS Secrets Manager

```bash
aws secretsmanager create-secret \
    --name chatbot/gemini-api-key \
    --secret-string '{"GEMINI_API_KEY":"YOUR_KEY_HERE"}' \
    --region us-east-1
```

### 3. Deploy to Lambda

```bash
cd lambda
chmod +x deploy_adk.sh
./deploy_adk.sh
```

This will:
- ✅ Copy content files to Lambda package
- ✅ Install Google ADK dependencies
- ✅ Deploy via SAM
- ✅ Return your API endpoint

### 4. Update Frontend

Update `js/chatbot.js` line 8 with your new API endpoint:
```javascript
this.apiEndpoint = 'https://YOUR_NEW_ENDPOINT/Prod/chat';
```

### 5. Enable Chatbot

Remove `disabled` from the chatbot input in `js/chatbot.js`

## 🧪 Local Testing

Test the agent locally before deploying:

```bash
# Set your API key
export GEMINI_API_KEY='your-key-here'

# Run tests
cd lambda
python3 test_adk_local.py
```

This will test all 6 tools with different questions.

## 📊 Benefits of ADK Approach

### ✅ **Advantages:**
1. **Intelligent Routing** - Agent picks relevant tools automatically
2. **Cost Efficient** - Only sends relevant content to LLM (not entire resume)
3. **Fast Responses** - Gemini Flash 2.5 is super fast
4. **Cheap** - ~$0.075 per 1M input tokens
5. **Scalable** - Easy to add more tools/content
6. **No Vector DB** - No need for Pinecone/embeddings

### 💰 **Cost Comparison:**

| Method | Cost per 1K requests | Speed |
|--------|---------------------|-------|
| Google ADK + Flash 2.5 | ~$0.01 | ⚡ Fast |
| OpenAI GPT-4 | ~$30 | 🐢 Slow |
| OpenAI GPT-3.5 | ~$2 | ⚡ Fast |

## 🔍 How Agent Picks Tools

The agent uses **function calling** to decide which tool(s) to use:

**Example 1:** "Who are you?"
```
Agent thinks: "This is asking for introduction"
→ Calls get_introduction()
→ Generates response from Introduction.txt
```

**Example 2:** "Tell me about your experience and projects"
```
Agent thinks: "Multiple aspects requested"
→ Calls get_experience()
→ Calls get_ai_projects()
→ Synthesizes information from both
```

## 📝 Response Format

```json
{
  "answer": "I'm Sahil Sharma, a Senior Data Scientist...",
  "question": "Who are you?",
  "model": "gemini-2.0-flash-exp",
  "agent": "google-adk"
}
```

## 🛡️ Error Handling

The implementation includes:
- ✅ Fallback responses if content files missing
- ✅ CORS headers for GitHub Pages
- ✅ Detailed error logging
- ✅ Environment variable fallback for local testing

## 📦 File Structure

```
lambda/
├── chatbot_handler_adk.py    # Main ADK implementation
├── chatbot_handler.py         # Will be replaced during deployment
├── requirements.txt           # Google ADK dependencies
├── deploy_adk.sh             # Deployment script
├── test_adk_local.py         # Local testing
├── template.yaml             # SAM template (unchanged)
└── content/                  # Content files (copied during deploy)
    ├── Introduction.txt
    ├── AI_Projects.txt
    ├── Experience.txt
    ├── Education.txt
    ├── Skills.txt
    └── ExtraCurriculars.txt
```

## 🔄 Updating Content

To update content:
1. Edit files in `/content` directory
2. Redeploy: `./deploy_adk.sh`

The agent will automatically use the new content!

## 🐛 Debugging

View Lambda logs:
```bash
sam logs -n ChatbotFunction --stack-name sahil-resume-chatbot-stack --tail
```

Test a specific question:
```bash
curl -X POST YOUR_API_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"question":"What are your skills?"}'
```

## 🎓 Learning Resources

- [Google ADK Documentation](https://ai.google.dev/)
- [Gemini API Reference](https://ai.google.dev/api/python/google/generativeai)
- [Function Calling Guide](https://ai.google.dev/docs/function_calling)

---

**Ready to deploy?** Run `./deploy_adk.sh` and your intelligent agent will be live! 🚀
