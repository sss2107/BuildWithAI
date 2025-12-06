"""
AWS Lambda Handler for ADK-based RAG Chatbot
Uses Google GenAI SDK with Gemini and tool-based routing
Includes Google Calendar integration for meeting booking
"""

import json
import os
from typing import Dict, Any, List
from google import genai
from calendar_integration import get_available_meeting_slots, book_meeting

# Content file paths (will be included in Lambda package)
CONTENT_DIR = "/var/task/content"

# Security limits - STRICT to prevent abuse
MAX_QUESTION_LENGTH = 2000  # 2000 character limit per question
MAX_HISTORY_LENGTH = 6      # Max messages in history (3 Q&A pairs)
MAX_MESSAGE_LENGTH = 2000   # Max characters per history message

# Rate limiting - STRICT
MAX_REQUESTS_PER_SESSION = 20   # Max 20 questions per session
MAX_REQUESTS_PER_DAY = 100      # Max 100 total requests per day (all sessions)

# Simple in-memory rate limiting
rate_limit_cache = {}       # {session_id: [timestamps]}
daily_request_count = []    # [timestamps] for all requests today

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
        return False, f"Daily limit exceeded ({MAX_REQUESTS_PER_DAY} requests/day). Try again tomorrow."
    
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
        return False, f"Session limit exceeded ({MAX_REQUESTS_PER_SESSION} questions per session). Please start a new session."
    
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
        return False, f"Question too long (max {MAX_QUESTION_LENGTH} characters)"
    
    # Check history length
    if len(history) > MAX_HISTORY_LENGTH:
        return False, f"History too long (max {MAX_HISTORY_LENGTH} messages)"
    
    # Check each history message length
    for msg in history:
        content = msg.get('content', '')
        if len(content) > MAX_MESSAGE_LENGTH:
            return False, f"History message too long (max {MAX_MESSAGE_LENGTH} characters)"
    
    # Check for suspicious patterns
    if question.count('A') > 100 or question.count('a') > 100:
        return False, "Suspicious input pattern detected"
    
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
}

# ==========================================
# GEMINI AGENT WITH NEW SDK
# ==========================================

def process_with_genai(question: str, history: List[Dict], api_key: str) -> str:
    """
    Process question using new Google GenAI SDK with automatic tool calling
    Includes conversation history for context (last 3 Q&A pairs)
    """
    try:
        from google.genai import types
        
        # Initialize client
        client = genai.Client(api_key=api_key)
        
        # System instruction
        system_instruction = """You are Sahil Sharma's AI assistant. Answer questions about Sahil professionally and conversationally.

When answering:
1. Use the provided tools to get accurate information
2. Provide concise, helpful responses based on the tool results
3. Be friendly and professional
4. Synthesize information naturally from multiple tools if needed
5. Speak ON BEHALF of Sahil using first person when appropriate
6. Use conversation history for context on follow-up questions

For meeting bookings:
7. When user wants to schedule/book a meeting, FIRST show available slots using get_available_meeting_slots()
8. Ask for their email address if they haven't provided it
9. Then use book_meeting() with their email and chosen slot number
10. Always confirm the booking details clearly"""
        
        # Configure with automatic function calling (including calendar tools)
        config = types.GenerateContentConfig(
            tools=[
                get_introduction,
                get_ai_projects,
                get_experience,
                get_education,
                get_skills,
                get_extracurriculars,
                get_available_meeting_slots,  # Calendar tool
                book_meeting                   # Calendar tool
            ],
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
        
        # Generate response - SDK automatically handles function calling
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=config,
        )
        
        return response.text
        
    except Exception as e:
        error_msg = str(e)
        print(f"GenAI Error: {error_msg}")
        import traceback
        traceback.print_exc()
        
        # Professional error messages (hide technical details)
        if "403" in error_msg or "PERMISSION_DENIED" in error_msg or "API key" in error_msg:
            return "⚠️ AI service temporarily unavailable due to authentication refresh. Our infrastructure team has been notified. Please try again in a few moments."
        elif "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            return "⚙️ Please retry your question in 10-15 seconds."
        elif "timeout" in error_msg.lower():
            return "🔄 Backend timeout - Lambda cold start detected. Warming up infrastructure, please resubmit your query."
        else:
            return "🔧 Temporary infrastructure issue. Please try again later."

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
        
        if not question:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'https://sss2107.github.io',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({'error': 'Question is required'})
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
                'body': json.dumps({'error': 'API key not configured'})
            }
        
        # Process with GenAI agent (with conversation history)
        answer = process_with_genai(question, history, api_key)
        
        # Log response to CloudWatch (truncated for cost control)
        print(json.dumps({
            'event_type': 'bot_response',
            'session_id': session_id,
            'answer_length': len(answer),
            'question_preview': question[:100],  # Only first 100 chars
            'timestamp': time.time()
        }))
        
        # Return response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'https://sss2107.github.io',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'answer': answer,
                'question': question,
                'model': 'gemini-2.5-flash',
                'agent': 'google-genai-sdk'
            })
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
                'error': 'Internal server error',
                'message': str(e)
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
