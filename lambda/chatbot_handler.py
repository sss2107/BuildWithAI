"""
AWS Lambda Handler for ADK-based RAG Chatbot
Uses Google GenAI SDK with Gemini and tool-based routing
"""

import json
import os
import math
import base64
import requests
from typing import Dict, Any, List
from google import genai
# from calendar_integration import (
#     get_available_meeting_slots,
#     book_meeting
# )

# Content file paths (will be included in Lambda package)
CONTENT_DIR = "/var/task/content"

# Security limits - STRICT to prevent abuse
MAX_QUESTION_LENGTH = 2000  # 2000 character limit per question
MAX_HISTORY_LENGTH = 6      # Max messages in history (3 Q&A pairs)
MAX_MESSAGE_LENGTH = 2000   # Max characters per history message

# Rate limiting - STRICT
MAX_REQUESTS_PER_SESSION = 30   # Max 40 questions per session
MAX_REQUESTS_PER_DAY = 200      # Max 200 total requests per day (all sessions)

# Simple in-memory rate limiting
rate_limit_cache = {}       # {session_id: [timestamps]}
daily_request_count = []    # [timestamps] for all requests today

# ==========================================
# SEMANTIC CACHING (Persistent via DynamoDB)
# ==========================================
import boto3
import hashlib
from decimal import Decimal

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
CACHE_TABLE_NAME = "SahilResumeChatbotCache"
cache_table = dynamodb.Table(CACHE_TABLE_NAME)

# Global In-Memory Cache (Populated from DynamoDB on Cold Start)
SEMANTIC_CACHE: List[Dict[str, Any]] = []

def load_global_cache():
    """Load all cached items from DynamoDB to local memory on cold start"""
    global SEMANTIC_CACHE
    try:
        print("Loading semantic cache from DynamoDB...")
        # Scan the table (efficient for small datasets < 1000 items)
        response = cache_table.scan()
        items = response.get('Items', [])
        
        # Handle pagination if needed
        while 'LastEvaluatedKey' in response:
            response = cache_table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response.get('Items', []))
            
        # Convert DynamoDB items to local format
        loaded_cache = []
        for item in items:
            # DynamoDB Decimals -> Floats
            embedding = [float(x) for x in item.get('Embedding', [])]
            if embedding:
                loaded_cache.append({
                    'embedding': embedding,
                    'response': item.get('Response'),
                    'question': item.get('Question')
                })
        
        SEMANTIC_CACHE = loaded_cache
        print(f"✅ Loaded {len(SEMANTIC_CACHE)} items into global semantic cache.")
    except Exception as e:
        print(f"⚠️ Error loading global cache (might be first run): {e}")
        SEMANTIC_CACHE = []

# Load cache immediately when Lambda container starts
load_global_cache()

def save_to_global_cache(question: str, embedding: List[float], response: str):
    """Save new item to DynamoDB and local cache"""
    try:
        # 1. Update local cache immediately
        SEMANTIC_CACHE.append({
            'embedding': embedding,
            'response': response,
            'question': question
        })
        
        # 2. Persist to DynamoDB
        # Convert floats to Decimal for DynamoDB
        embedding_decimal = [Decimal(str(x)) for x in embedding]
        q_hash = hashlib.sha256(question.encode()).hexdigest()
        
        cache_table.put_item(Item={
            'QuestionHash': q_hash,
            'Question': question,
            'Response': response,
            'Embedding': embedding_decimal
        })
        print(f"💾 Saved to global cache: '{question[:30]}...'")
    except Exception as e:
        print(f"⚠️ Error saving to global cache: {e}")

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    if not v1 or not v2: return 0.0
    dot_product = sum(a * b for a, b in zip(v1, v2))
    magnitude1 = math.sqrt(sum(a * a for a in v1))
    magnitude2 = math.sqrt(sum(b * b for b in v2))
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
    return dot_product / (magnitude1 * magnitude2)

def get_embedding(text: str, client: genai.Client) -> List[float]:
    """Generate embedding for text using Gemini REST API v1 directly (SDK uses v1beta which lacks this model)"""
    try:
        api_key = os.environ.get("GEMINI_API_KEY", "")
        resp = requests.post(
            "https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent",
            headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
            json={"model": "models/text-embedding-004", "content": {"parts": [{"text": text}]}},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json().get("embedding", {}).get("values", [])
    except Exception as e:
        print(f"⚠️ Embedding generation failed: {e}")
        return []

def find_cached_response(query_embedding: List[float], threshold: float = 0.90) -> str | None:
    """Find a semantically similar response in the cache"""
    if not query_embedding: return None
    
    best_score = -1.0
    best_response = None
    best_question = None
    
    for entry in SEMANTIC_CACHE:
        score = cosine_similarity(query_embedding, entry['embedding'])
        if score > best_score:
            best_score = score
            best_response = entry['response']
            best_question = entry['question']
            
    if best_score >= threshold:
        print(f"⚡ Semantic Cache HIT! Score: {best_score:.4f} (Matched: '{best_question}')")
        return best_response
    
    return None

def check_rate_limit(session_id: str) -> tuple[bool, str]:
    """
    Check if session has exceeded rate limits
    Returns (is_allowed, error_message)
    """
    import time
    current_time = time.time()
    
    # Check daily global limit (100 requests/day across ALL sessions)
    global daily_request_count
    daily_request_count = [
        ts for ts in daily_request_count 
        if current_time - ts < 86400  # Last 24 hours
    ]
    
    if len(daily_request_count) >= MAX_REQUESTS_PER_DAY:
        return False, "[ERR_INTERNAL_LIMIT_DAILY] Daily usage limit reached. Please try again tomorrow."
    
    # Check per-session limit (20 requests per session)
    if session_id in rate_limit_cache:
        rate_limit_cache[session_id] = [
            ts for ts in rate_limit_cache[session_id] 
            if current_time - ts < 86400  # Keep 24 hours for tracking
        ]
    else:
        rate_limit_cache[session_id] = []
    
    session_requests = rate_limit_cache[session_id]
    
    if len(session_requests) >= MAX_REQUESTS_PER_SESSION:
        return False, "[ERR_LIMIT_SESSION] Too many questions in this session. Please refresh the page to start a new conversation."
    
    # Add current request to both counters
    rate_limit_cache[session_id].append(current_time)
    daily_request_count.append(current_time)
    
    return True, ""

def validate_input(question: str, history: List[Dict]) -> tuple[bool, str]:
    """
    Validate user input to prevent abuse
    Returns (is_valid, error_message)
    """
    # Check question length
    if len(question) > MAX_QUESTION_LENGTH:
        return False, f"[ERR_INPUT_LENGTH] Question is too long. Please keep it under {MAX_QUESTION_LENGTH} characters."
    
    # Check history length
    if len(history) > MAX_HISTORY_LENGTH:
        return False, "[ERR_HISTORY_LENGTH] Conversation history is too long. Please refresh the page."
    
    # Check each history message length
    for msg in history:
        content = msg.get('content', '')
        if len(content) > MAX_MESSAGE_LENGTH:
            return False, "[ERR_MESSAGE_LENGTH] Previous message is too long. Please refresh the page."
    
    # Check for suspicious patterns
    if question.count('A') > 100 or question.count('a') > 100:
        return False, "[ERR_SUSPICIOUS_INPUT] Invalid input detected. Please rephrase your question."
    
    return True, ""

# ==========================================
# TOOL DEFINITIONS - One per content file
# ==========================================

def get_introduction() -> str:
    """
    Get Sahil's introduction, background, and current role.
    Use this when user asks: who are you, tell me about yourself, introduction.
    """
    try:
        with open(f"{CONTENT_DIR}/Introduction.txt", 'r') as f:
            return f.read()
    except FileNotFoundError:
        return "Introduction: Sahil Sharma - Senior Data Scientist, AI & Data at Singapore Airlines, specializing in GenAI and RAG systems. Google Developer Expert in AI/ML."

def get_ai_projects() -> str:
    """
    Get details about Sahil's AI/ML projects.
    Use this when user asks about: projects, what have you built, portfolio, work samples.
    """
    try:
        with open(f"{CONTENT_DIR}/AI_Projects.txt", 'r') as f:
            return f.read()
    except FileNotFoundError:
        return "AI Projects: 12+ production AI projects including AMS AI Agent, Advanced RAG Chatbot, Curie HR Chatbot, and more."

def get_experience() -> str:
    """
    Get Sahil's work experience and professional history.
    Use this when user asks about: experience, work history, companies, career path, previous roles.
    """
    try:
        with open(f"{CONTENT_DIR}/Experience.txt", 'r') as f:
            return f.read()
    except FileNotFoundError:
        return "Experience: 7+ years in AI/ML. Currently at Singapore Airlines. Previously: X0PA AI, Munich Re, EY, KPMG, PayU."

def get_education() -> str:
    """
    Get Sahil's educational background and degrees.
    Use this when user asks about: education, degrees, university, academic background, where did you study.
    """
    try:
        with open(f"{CONTENT_DIR}/Education.txt", 'r') as f:
            return f.read()
    except FileNotFoundError:
        return "Education: Master's in Data Science from National University of Singapore (NUS)."

def get_skills() -> str:
    """
    Get Sahil's technical skills and expertise.
    Use this when user asks about: skills, technologies, tools, programming languages, frameworks, what do you know.
    """
    try:
        with open(f"{CONTENT_DIR}/Skills.txt", 'r') as f:
            return f.read()
    except FileNotFoundError:
        return "Skills: Python, PyTorch, TensorFlow, LangGraph, RAG, OpenAI, AWS, Hugging Face, BERT, and 40+ technologies."

def get_extracurriculars() -> str:
    """
    Get Sahil's achievements, awards, talks, and extracurricular activities.
    Use this when user asks about: achievements, awards, talks, conferences, presentations, speaking, GDE, recognition.
    """
    try:
        with open(f"{CONTENT_DIR}/ExtraCurriculars.txt", 'r') as f:
            return f.read()
    except FileNotFoundError:
        return "Achievements: Google Developer Expert (GDE) in AI/ML, CEO Award at Singapore Airlines, conference speaker."

# Map function names to actual functions
TOOLS = {
    "get_introduction": get_introduction,
    "get_ai_projects": get_ai_projects,
    "get_experience": get_experience,
    "get_education": get_education,
    "get_skills": get_skills,
    "get_extracurriculars": get_extracurriculars,
    # "get_available_meeting_slots": get_available_meeting_slots,
    # "book_meeting": book_meeting,
}

# ==========================================
# GEMINI AGENT WITH NEW SDK
# ==========================================

def process_with_genai(question: str, history: List[Dict], api_key: str, is_voice: bool = False) -> str:
    """
    Process question using new Google GenAI SDK with automatic tool calling
    Includes conversation history for context (last 3 Q&A pairs)
    """
    try:
        from google.genai import types
        
        # Initialize client
        client = genai.Client(api_key=api_key)

        # ---------------------------------------------------------
        # 1. SEMANTIC CACHE CHECK
        # ---------------------------------------------------------
        # Only check cache if history is short (context-free questions)
        # or if we want to be aggressive with caching.
        # For now, we check for all queries to maximize free tier usage.
        query_embedding = get_embedding(question, client)
        cached_response = find_cached_response(query_embedding)
        
        if cached_response:
            text_response = cached_response
            # If voice mode, we still need to generate audio below
            # but we skipped the expensive LLM generation step!
        else:
            # System instruction
            system_instruction = """You are Sahil Sharma's AI assistant. Answer questions about Sahil professionally and conversationally.

When answering:
1. Use the provided tools to get accurate information
2. Provide concise, helpful responses based on the tool results
3. Be friendly and professional
4. Synthesize information naturally from multiple tools if needed
5. Speak ON BEHALF of Sahil using first person when appropriate
6. Use conversation history for context on follow-up questions
7. Help users book meetings with Sahil using the calendar tools

For meeting requests - IMPORTANT:
- First, ALWAYS ask for persons email and check if it looks like valid email
- Present the numbered list of slots to the user exactly as returned
- MUST collect: full name AND email address before booking
- Ask for BOTH name and email explicitly: "To book a meeting, I need your full name and email address"
- Verify email looks valid (has @ and domain)
- Never book without a valid email and real name
- If user provides fake-looking info ("test", "admin"), politely ask for real details"""

            if is_voice:
                system_instruction += """

VOICE MODE ACTIVATED:
The user is speaking to you. Your response will be converted to speech.
- Keep responses concise and conversational (under 2-3 sentences if possible).
- Do NOT use markdown formatting like bold (**text**) or lists as they don't sound good.
- Do NOT say "I cannot speak" or "I am a text model". You ARE speaking.
- Be friendly and engaging."""
            
            # Define tools as function declarations for Gemini
            # The SDK will automatically convert Python functions to the right format
            tools = [
                get_introduction,
                get_ai_projects,
                get_experience,
                get_education,
                get_skills,
                get_extracurriculars,
                # get_available_meeting_slots,
                # book_meeting
            ]
            
            # Debug: Print tool names
            print(f"🔧 Tools configured: {[f.__name__ for f in tools]}")
            
            # Configure tool config to enable automatic function calling
            tool_config = types.ToolConfig(
                function_calling_config=types.FunctionCallingConfig(
                    mode=types.FunctionCallingConfigMode.AUTO
                )
            )
            
            # Configure with automatic function calling
            config = types.GenerateContentConfig(
                tools=tools,
                tool_config=tool_config,
                system_instruction=system_instruction,
            )
            
            # Build conversation contents with history
            contents = []
            
            # Add conversation history (last 3 Q&A pairs = 6 messages)
            for msg in history:
                role = 'user' if msg.get('role') == 'user' else 'model'
                contents.append(types.Content(
                    role=role,
                    parts=[types.Part(text=msg.get('content', ''))]
                ))
            
            # Add current question
            contents.append(types.Content(
                role='user',
                parts=[types.Part(text=question)]
            ))
            
            # Select model based on mode to optimize quota usage
            # Use gemini-2.5-flash for both text and voice for best quality
            text_model = "gemini-2.5-flash"
            print(f"🤖 Using model: {text_model}")

            # Generate response with automatic function calling enabled
            response = client.models.generate_content(
                model=text_model,
                contents=contents,
                config=config,
            )
            
            text_response = response.text

            # ---------------------------------------------------------
            # 2. UPDATE SEMANTIC CACHE
            # ---------------------------------------------------------
            # Store the new response if it's valid and we have an embedding
            if query_embedding and text_response and not text_response.startswith("[ERR"):
                # Use the new persistent save function
                save_to_global_cache(question, query_embedding, text_response)
            
            # If voice mode is active, generate audio for the response
            if is_voice and text_response and not text_response.startswith("[ERR"):
                try:
                    # Generate audio using Kokoro-82M via HuggingFace SDK (Replicate provider)
                    # (Replaced Gemini 2.5 Flash TTS - see gemini_tts_backup.py)
                    from huggingface_hub import InferenceClient as HFInferenceClient
                    hf_token = os.environ.get("HF_TOKEN", "")
                    if not hf_token:
                        raise ValueError("HF_TOKEN environment variable not set")

                    hf_client = HFInferenceClient(
                        provider="replicate",
                        api_key=hf_token,
                    )
                    audio_bytes = hf_client.text_to_speech(
                        text_response,
                        model="hexgrad/Kokoro-82M",
                    )
                    # Detect audio format from magic bytes
                    if audio_bytes[:4] == b'fLaC':
                        audio_fmt = "flac"
                    elif audio_bytes[:4] == b'OggS':
                        audio_fmt = "ogg"
                    elif audio_bytes[:3] in (b'ID3', b'\xff\xfb', b'\xff\xfa', b'\xff\xf3'):
                        audio_fmt = "mpeg"
                    else:
                        audio_fmt = "wav"
                    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
                    return {"text": text_response, "audio": audio_b64, "audio_format": audio_fmt}
                except Exception as e:
                    print(f"Kokoro TTS Error: {str(e)}")
                    # Fallback to just text - frontend will use browser speech synthesis
                    pass
                    
            return text_response
            
    except Exception as e:
        error_msg = str(e)
        print(f"GenAI Error: {error_msg}")
        import traceback
        traceback.print_exc()
        
        # Professional error messages with unique identifiers
        if "403" in error_msg or "PERMISSION_DENIED" in error_msg or "API key" in error_msg:
            return "[ERR_AUTH_403] Sorry, I'm having trouble connecting right now. Please try again in a moment."
        elif "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            return "[ERR_QUOTA_429] Daily free tier quota has been reached. Please try again tomorrow."
        elif "timeout" in error_msg.lower():
            return "[ERR_TIMEOUT_504] The request timed out. Please try your question again."
        elif "network" in error_msg.lower() or "connection" in error_msg.lower():
            return "[ERR_NETWORK_502] Network connection issue. Please check your connection and retry."
        else:
            # Include the actual error message for debugging
            return f"[ERR_GENERAL_500] Something went wrong on my end: {error_msg}"

# ==========================================
# LAMBDA HANDLER
# ==========================================

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler with session management and CloudWatch logging
    """
    print(f"Received event: {json.dumps(event)}")
    
    try:
        # Parse request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        question = body.get('question', '')
        history = body.get('history', [])  # Last 3 Q&A pairs from frontend
        session_id = body.get('sessionId', 'unknown')
        source = body.get('source', 'text')
        is_voice = (source == 'voice')
        
        if not question:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'https://sss2107.github.io',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({'error': '[ERR_NO_QUESTION] Please enter a question.'})
            }
        
        # SECURITY: Rate limiting (20/session, 100/day)
        is_allowed, rate_limit_msg = check_rate_limit(session_id)
        if not is_allowed:
            print(json.dumps({
                'event_type': 'rate_limit_exceeded',
                'session_id': session_id,
                'reason': rate_limit_msg,
                'timestamp': time.time()
            }))
            return {
                'statusCode': 429,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'https://sss2107.github.io',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Retry-After': '86400'  # Retry after 24 hours
                },
                'body': json.dumps({
                    'error': rate_limit_msg,
                    'retry_after': 86400
                })
            }
        
        # SECURITY: Input validation
        is_valid, error_msg = validate_input(question, history)
        if not is_valid:
            print(json.dumps({
                'event_type': 'invalid_input',
                'session_id': session_id,
                'error': error_msg,
                'timestamp': time.time()
            }))
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'https://sss2107.github.io',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({'error': error_msg})
            }
        
        # Log question to CloudWatch for analytics
        import time
        print(json.dumps({
            'event_type': 'user_question',
            'session_id': session_id,
            'question': question,
            'history_length': len(history),
            'timestamp': time.time()
        }))
        
        # Get API key from encrypted environment variable
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'https://sss2107.github.io',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({'error': '[ERR_CONFIG_500] Configuration error. Please contact the administrator.'})
            }
        
        # Process with GenAI agent (with conversation history)
        result = process_with_genai(question, history, api_key, is_voice=is_voice)
        
        # Handle both simple text response and dictionary response (text + audio)
        if isinstance(result, dict):
            answer = result.get('text', '')
            audio_data = result.get('audio', None)
            audio_format = result.get('audio_format', 'wav')
        else:
            answer = result
            audio_data = None
            audio_format = None
        
        # Log response to CloudWatch (truncated for cost control)
        print(json.dumps({
            'event_type': 'bot_response',
            'session_id': session_id,
            'answer_length': len(answer),
            'has_audio': audio_data is not None,
            'question_preview': question[:100],  # Only first 100 chars
            'timestamp': time.time()
        }))
        
        response_body = {
            'answer': answer,
            'question': question,
            'model': 'gemini-2.5-flash',
            'agent': 'google-genai-sdk'
        }
        
        if audio_data:
            response_body['audio'] = audio_data
            response_body['audio_format'] = audio_format
        
        # Return response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'https://sss2107.github.io',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps(response_body)
        }
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'https://sss2107.github.io',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'error': 'The API key has been exhausted for today. Try again tomorrow! '
            })
        }

# ==========================================
# LOCAL TESTING
# ==========================================

if __name__ == "__main__":
    import sys
    
    # Set content directory for local testing
    CONTENT_DIR = "../content"
    
    # Get API key from environment
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        print("Error: Set GEMINI_API_KEY environment variable")
        sys.exit(1)
    
    # Test questions
    test_questions = [
        "Who are you?",
        "Tell me about your projects",
        "What's your experience?",
        "What skills do you have?",
    ]
    
    for question in test_questions:
        print(f"\n{'='*60}")
        print(f"Q: {question}")
        print(f"{'='*60}")
        
        test_event = {
            'body': json.dumps({'question': question})
        }
        
        class MockContext:
            request_id = 'test-123'
        
        result = lambda_handler(test_event, MockContext())
        response = json.loads(result['body'])
        
        print(f"\nA: {response.get('answer', response.get('error'))}")
        print(f"\nModel: {response.get('model', 'N/A')}")
