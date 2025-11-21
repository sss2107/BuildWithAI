"""
AWS Lambda Handler for RAG Chatbot
Handles chat requests and returns AI-generated responses
"""

import json
import os
import boto3
from typing import Dict, Any

# Initialize AWS clients
secretsmanager = boto3.client('secretsmanager')

def get_secret(secret_name: str) -> str:
    """Retrieve secret from AWS Secrets Manager"""
    try:
        response = secretsmanager.get_secret_value(SecretId=secret_name)
        return json.loads(response['SecretString'])
    except Exception as e:
        print(f"Error retrieving secret: {e}")
        raise

def simple_rag_response(question: str) -> str:
    """
    Simple RAG implementation
    TODO: Replace with full vector DB + LLM pipeline
    """
    
    # Hardcoded responses for testing
    knowledge_base = {
        "who are you": "I'm Sahil Sharma, a Senior Data Scientist at Singapore Airlines specializing in AI and GenAI. I'm also a Google Developer Expert in AI/ML.",
        "experience": "I have 7+ years of experience in AI/ML, currently working at Singapore Airlines. Previously worked at X0PA AI, Munich Re, EY, KPMG, and PayU.",
        "projects": "I've built 12 production AI projects including: AMS AI Agent (9 apps onboarded), Advanced RAG Chatbot (10M+ pages), Curie HR Chatbot, Embedding Fine-tuning with BAAI/bge-large-en-v1.5 (+7% accuracy), and more.",
        "skills": "Expert in: Python, PyTorch, TensorFlow, LangGraph, RAG, OpenAI, AWS, Hugging Face Transformers, BERT, and 40+ other technologies.",
        "education": "Master's in Data Science from National University of Singapore (NUS).",
        "achievements": "Google Developer Expert (GDE) in AI/ML, CEO Award at Singapore Airlines, Best Research Paper Award at NUS, multiple hackathon wins."
    }
    
    # Simple keyword matching (replace with real RAG)
    question_lower = question.lower()
    for key, response in knowledge_base.items():
        if key in question_lower:
            return response
    
    return "I'm Sahil Sharma's AI assistant. Ask me about his work experience, projects, skills, or achievements!"

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler
    
    Expected event format:
    {
        "body": "{\"question\": \"Tell me about your experience\"}"
    }
    """
    
    print(f"Received event: {json.dumps(event)}")
    
    try:
        # Parse the request body
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
                    'Access-Control-Allow-Origin': '*',  # CORS
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Question is required'
                })
            }
        
        # Get response from RAG
        answer = simple_rag_response(question)
        
        # Return successful response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',  # CORS for your GitHub Pages
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'answer': answer,
                'question': question,
                'timestamp': context.request_id if hasattr(context, 'request_id') else None
            })
        }
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
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

# For local testing
if __name__ == "__main__":
    test_event = {
        'body': json.dumps({
            'question': 'Tell me about your experience'
        })
    }
    
    class MockContext:
        request_id = 'test-123'
    
    result = lambda_handler(test_event, MockContext())
    print(json.dumps(result, indent=2))
