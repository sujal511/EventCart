import requests
import json
from datetime import datetime

# Configuration
BASE_URL = 'http://127.0.0.1:5000/api'

def test_dashboard():
    print("Testing Dashboard API...")
    
    # First, let's try to login with a test user
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    print("\n1. Testing login...")
    login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Login Status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        login_result = login_response.json()
        token = login_result.get('access_token')
        print("✅ Login successful!")
        print(f"Token: {token[:20]}..." if token else "No token received")
        
        # Test dashboard with token
        headers = {'Authorization': f'Bearer {token}'}
        
        print("\n2. Testing dashboard stats...")
        dashboard_response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
        print(f"Dashboard Status: {dashboard_response.status_code}")
        
        if dashboard_response.status_code == 200:
            dashboard_data = dashboard_response.json()
            print("✅ Dashboard API working!")
            print("Dashboard data:")
            print(json.dumps(dashboard_data, indent=2))
        else:
            print("❌ Dashboard API failed")
            print(f"Error: {dashboard_response.text}")
            
    elif login_response.status_code == 404:
        print("❌ Test user doesn't exist. Let's create one...")
        
        # Create test user
        register_data = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "password": "password123",
            "phone": "1234567890"
        }
        
        register_response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        print(f"Register Status: {register_response.status_code}")
        
        if register_response.status_code == 201:
            print("✅ Test user created!")
            # Try login again
            test_dashboard()
        else:
            print("❌ Failed to create test user")
            print(f"Error: {register_response.text}")
    else:
        print("❌ Login failed")
        print(f"Error: {login_response.text}")

if __name__ == "__main__":
    test_dashboard() 