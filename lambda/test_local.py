#!/usr/bin/env python3
"""
Local testing script for Chatbot
Tests the agent locally before deploying to Lambda
"""

import os
import sys
import json
import ssl
import dotenv

# Disable SSL verification for local testing
ssl._create_default_https_context = ssl._create_unverified_context

# Load environment variables from .env
dotenv.load_dotenv()

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Import the handler
from chatbot_handler import lambda_handler

# Monkeypatch CONTENT_DIR for local testing
# Use the content directory inside lambda/
import chatbot_handler
chatbot_handler.CONTENT_DIR = os.path.join(os.path.dirname(__file__), 'content')

print(f"Using content directory: {chatbot_handler.CONTENT_DIR}")

class MockContext:
    request_id = 'local-test-123'
    function_name = 'local-test'
    memory_limit_in_mb = 512

def test_chatbot():
    """Interactive testing loop"""
    print("\n🤖 Chatbot Local Test Console")
    print("Type 'quit' or 'exit' to stop")
    print("-" * 50)

    while True:
        try:
            question = input("\nYou: ").strip()
            if question.lower() in ['quit', 'exit']:
                break
            if not question:
                continue

            event = {
                'body': json.dumps({'question': question})
            }
            
            print("Thinking...")
            response = lambda_handler(event, MockContext())
            body = json.loads(response['body'])
            
            if response['statusCode'] == 200:
                print(f"\nBot: {body['answer']}")
                if 'model' in body:
                    print(f"\n[Model: {body['model']}]")
            else:
                print(f"\n❌ Error: {body.get('error', 'Unknown error')}")
                if 'message' in body:
                    print(f"Message: {body['message']}")
        
        except KeyboardInterrupt:
            break
        except EOFError:
            break
        except Exception as e:
            print(f"\n❌ Exception: {str(e)}")

if __name__ == "__main__":
    test_chatbot()
