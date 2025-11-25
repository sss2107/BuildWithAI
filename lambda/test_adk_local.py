#!/usr/bin/env python3
"""
Local testing script for Google ADK chatbot
Tests the agent locally before deploying to Lambda
"""

import os
import sys
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Import the handler
from chatbot_handler_adk import lambda_handler, CONTENT_DIR

class MockContext:
    request_id = 'local-test-123'
    function_name = 'local-test'
    memory_limit_in_mb = 512

def test_chatbot(question: str):
    """Test a single question"""
    print(f"\n{'='*70}")
    print(f"❓ QUESTION: {question}")
    print(f"{'='*70}")
    
    event = {
        'body': json.dumps({'question': question})
    }
    
    try:
        response = lambda_handler(event, MockContext())
        body = json.loads(response['body'])
        
        if response['statusCode'] == 200:
            print(f"\n✅ SUCCESS (Status: {response['statusCode']})")
            print(f"\n💬 ANSWER:")
            print(f"{body['answer']}")
            print(f"\n📊 METADATA:")
            print(f"   Model: {body.get('model', 'N/A')}")
            print(f"   Agent: {body.get('agent', 'N/A')}")
        else:
            print(f"\n❌ ERROR (Status: {response['statusCode']})")
            print(f"   {body.get('error', 'Unknown error')}")
            if 'message' in body:
                print(f"   Message: {body['message']}")
    
    except Exception as e:
        print(f"\n❌ EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()

def main():
    """Run test suite"""
    
    # Check for API key
    if not os.environ.get('GEMINI_API_KEY'):
        print("\n❌ ERROR: GEMINI_API_KEY environment variable not set")
        print("\nTo fix:")
        print("   export GEMINI_API_KEY='your-api-key-here'")
        print("\nGet your key from: https://makersuite.google.com/app/apikey")
        sys.exit(1)
    
    print("\n" + "="*70)
    print("🧪 TESTING GOOGLE ADK CHATBOT LOCALLY")
    print("="*70)
    print(f"\n📁 Content directory: {os.path.abspath('../content')}")
    print(f"🔑 API Key: {'✅ Set' if os.environ.get('GEMINI_API_KEY') else '❌ Not set'}")
    
    # Test questions covering different tools
    test_questions = [
        "Who are you?",
        "Tell me about your AI projects",
        "What's your work experience?",
        "Where did you study?",
        "What are your technical skills?",
        "What awards have you won?",
        "Can you tell me about your experience and projects?",  # Multi-tool
    ]
    
    for question in test_questions:
        test_chatbot(question)
    
    print("\n" + "="*70)
    print("✅ TEST SUITE COMPLETE")
    print("="*70)

if __name__ == "__main__":
    main()
