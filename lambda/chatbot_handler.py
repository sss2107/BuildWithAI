"""
AWS Lambda Handler for ADK-based RAG Chatbot
Uses Google ADK with Gemini Flash 2.5 and tool-based routing
"""

import json
import os
import boto3
from typing import Dict, Any, List
import google.generativeai as genai

# Initialize AWS clients
secretsmanager = boto3.client('secretsmanager')

# Content file paths (will be included in Lambda package)
CONTENT_DIR = "/var/task/content"

def get_secret(secret_name: str) -> Dict[str, str]:
    """Retrieve secret from AWS Secrets Manager"""
    try:
        response = secretsmanager.get_secret_value(SecretId=secret_name)
        return json.loads(response['SecretString'])
    except Exception as e:
        print(f"Error retrieving secret: {e}")
        # For local testing, use environment variable
        api_key = os.environ.get('GEMINI_API_KEY')
        if api_key:
            return {'GEMINI_API_KEY': api_key}
        raise

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
# GEMINI ADK AGENT
# ==========================================

def create_adk_agent(api_key: str):
    """Create Gemini agent with tool calling"""
    genai.configure(api_key=api_key)
    
    # Create model with function calling using Python functions directly
    model = genai.GenerativeModel(
        model_name='gemini-2.0-flash-exp',
        tools=[
            get_introduction,
            get_ai_projects,
            get_experience,
            get_education,
            get_skills,
            get_extracurriculars
        ]
    )
    
    return model

def process_with_adk(question: str, api_key: str) -> str:
    """
    Process question using Google ADK agent with tool calling
    """
    try:
        model = create_adk_agent(api_key)
        
        # System instruction
        system_prompt = """You are Sahil Sharma's AI assistant. Answer questions about Sahil professionally and conversationally.

When answering:
1. Use the tools to get relevant information
2. Provide concise, helpful responses
3. Be friendly and professional
4. If multiple tools are relevant, use them all
5. Synthesize information naturally

Remember: You're speaking ON BEHALF of Sahil, so use first person when appropriate."""
        
        # Start chat
        chat = model.start_chat()
        
        # Send message with automatic function calling
        response = chat.send_message(f"{system_prompt}\n\nUser question: {question}")
        
        # Handle function calls
        while response.candidates[0].content.parts[0].function_call:
            function_call = response.candidates[0].content.parts[0].function_call
            function_name = function_call.name
            
            # Execute the function
            if function_name in TOOLS:
                function_result = TOOLS[function_name]()
                
                # Send function result back to model
                response = chat.send_message(
                    genai.protos.Content(
                        parts=[genai.protos.Part(
                            function_response=genai.protos.FunctionResponse(
                                name=function_name,
                                response={"result": function_result}
                            )
                        )]
                    )
                )
            else:
                break
        
        # Extract final text response
        return response.text
        
    except Exception as e:
        print(f"ADK Error: {str(e)}")
        # Fallback to simple response
        return f"I'm Sahil Sharma's AI assistant. I encountered an error: {str(e)}. Please try asking about my experience, projects, or skills."

# ==========================================
# LAMBDA HANDLER
# ==========================================

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler with Google ADK
    """
    print(f"Received event: {json.dumps(event)}")
    
    try:
        # Parse request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        question = body.get('question', '')
        
        if not question:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({'error': 'Question is required'})
            }
        
        # Get Gemini API key from environment variable or Secrets Manager
        api_key = os.environ.get('GEMINI_API_KEY')
        
        if not api_key:
            # Fallback to Secrets Manager if env var not set
            try:
                secrets = get_secret('chatbot/gemini-api-key')
                api_key = secrets.get('GEMINI_API_KEY')
            except Exception as e:
                print(f"Secret retrieval failed: {e}")
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS'
                    },
                    'body': json.dumps({'error': 'API key not configured'})
                }
        
        # Process with ADK agent
        answer = process_with_adk(question, api_key)
        
        # Return response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'answer': answer,
                'question': question,
                'model': 'gemini-2.0-flash-exp',
                'agent': 'google-adk'
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
                'Access-Control-Allow-Origin': '*',
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
