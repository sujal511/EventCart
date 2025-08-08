from app import app
import json

def test_cors_headers():
    """Test CORS headers for critical API endpoints"""
    
    print("Testing CORS headers on critical API endpoints...")
    client = app.test_client()
    
    # Test endpoints
    endpoints = [
        ('/api/events', 'GET'),
        ('/api/auth/register', 'OPTIONS'),  # Preflight for registration
        ('/api/auth/login', 'OPTIONS')      # Preflight for login
    ]
    
    # Test origins
    test_origins = [
        'http://localhost:5176',
        'http://127.0.0.1:5176'
    ]
    
    # Test each endpoint with each origin
    for endpoint, method in endpoints:
        for origin in test_origins:
            print(f"\nTesting {method} {endpoint} with Origin: {origin}")
            
            headers = {
                'Origin': origin,
                'Access-Control-Request-Method': 'POST' if method == 'OPTIONS' else method,
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            }
            
            # Make the request
            if method == 'OPTIONS':
                response = client.options(endpoint, headers=headers)
            else:
                response = client.get(endpoint, headers=headers)
            
            # Check response headers
            print(f"Status: {response.status_code}")
            print("CORS Headers:")
            for header in [
                'Access-Control-Allow-Origin', 
                'Access-Control-Allow-Methods',
                'Access-Control-Allow-Headers',
                'Access-Control-Allow-Credentials'
            ]:
                print(f"  {header}: {response.headers.get(header, 'Not present')}")
            
            # Check origin match
            if response.headers.get('Access-Control-Allow-Origin') == origin:
                print("✓ Origin match: Good")
            else:
                print(f"✗ Origin mismatch: Expected {origin}, got {response.headers.get('Access-Control-Allow-Origin', 'None')}")

if __name__ == "__main__":
    test_cors_headers()
