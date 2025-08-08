import requests
import json

# Configuration
BASE_URL = 'http://127.0.0.1:5000/api'

def test_wishlist():
    print("Testing Wishlist API...")
    
    # First, login to get token
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    print("1. Logging in...")
    login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    
    if login_response.status_code == 200:
        login_result = login_response.json()
        token = login_result.get('access_token')
        print("✅ Login successful!")
        
        # Test wishlist GET
        headers = {'Authorization': f'Bearer {token}'}
        
        print("\n2. Testing wishlist GET...")
        wishlist_response = requests.get(f"{BASE_URL}/users/me/wishlist", headers=headers)
        print(f"Wishlist GET Status: {wishlist_response.status_code}")
        
        if wishlist_response.status_code == 200:
            wishlist_data = wishlist_response.json()
            print("✅ Wishlist API working!")
            print("Response structure:")
            print(json.dumps(wishlist_data, indent=2))
            
            # Check if it's an array or object
            if isinstance(wishlist_data, dict):
                print(f"\n📋 Response is a dict with keys: {list(wishlist_data.keys())}")
                if 'data' in wishlist_data:
                    print(f"📋 'data' field type: {type(wishlist_data['data'])}")
                    if isinstance(wishlist_data['data'], list):
                        print(f"📋 'data' array length: {len(wishlist_data['data'])}")
            elif isinstance(wishlist_data, list):
                print(f"📋 Response is a list with {len(wishlist_data)} items")
            else:
                print(f"📋 Response type: {type(wishlist_data)}")
                
        else:
            print("❌ Wishlist API failed")
            print(f"Error: {wishlist_response.text}")
    else:
        print("❌ Login failed")
        print(f"Error: {login_response.text}")

if __name__ == "__main__":
    test_wishlist() 