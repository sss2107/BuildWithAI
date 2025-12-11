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

# Fix for httpx/google-genai on macOS where root certs might be missing
import certifi
os.environ['SSL_CERT_FILE'] = certifi.where()

# Monkeypatch google.genai.Client to ensure SSL certs are used
try:
    from google import genai
    import httpx
    import certifi

    original_client_init = genai.Client.__init__

    def new_client_init(self, *args, **kwargs):
        http_options = kwargs.get('http_options')
        if http_options is None:
            http_options = {}
        
        # Create a custom httpx client with the correct certificate bundle
        # This bypasses SSL verification issues on macOS
        custom_httpx_client = httpx.Client(verify=certifi.where())
        
        if isinstance(http_options, dict):
            http_options['httpx_client'] = custom_httpx_client
        elif hasattr(http_options, 'httpx_client'):
             http_options.httpx_client = custom_httpx_client

        kwargs['http_options'] = http_options
        original_client_init(self, *args, **kwargs)

    genai.Client.__init__ = new_client_init
    print(f"Monkeypatched genai.Client to use certifi: {certifi.where()}")
except ImportError:
    print("Could not monkeypatch genai.Client (module not found?)")

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
