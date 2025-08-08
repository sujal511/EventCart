import requests
import json

# Configuration
BASE_URL = 'http://127.0.0.1:5000/api'

def test_wishlist_full():
    print("Testing Full Wishlist Functionality...")
    
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
        
        headers = {'Authorization': f'Bearer {token}'}
        
        # Get events first
        print("\n2. Getting events...")
        events_response = requests.get(f"{BASE_URL}/events", headers=headers)
        if events_response.status_code == 200:
            events_data = events_response.json()
            if events_data and len(events_data) > 0:
                event_id = events_data[0]['id']
                print(f"✅ Found event ID: {event_id}")
                
                # Add to wishlist
                print(f"\n3. Adding event {event_id} to wishlist...")
                add_response = requests.post(f"{BASE_URL}/users/me/wishlist", 
                                           json={"event_id": event_id}, 
                                           headers=headers)
                print(f"Add to wishlist status: {add_response.status_code}")
                if add_response.status_code in [200, 201]:
                    print("✅ Added to wishlist!")
                    print("Response:", add_response.json())
                else:
                    print("❌ Failed to add to wishlist")
                    print("Error:", add_response.text)
                
                # Get wishlist
                print(f"\n4. Getting wishlist...")
                wishlist_response = requests.get(f"{BASE_URL}/users/me/wishlist", headers=headers)
                if wishlist_response.status_code == 200:
                    wishlist_data = wishlist_response.json()
                    print("✅ Wishlist retrieved!")
                    print("Wishlist data structure:")
                    print(json.dumps(wishlist_data, indent=2))
                    
                    if wishlist_data.get('data'):
                        print(f"\n📋 Wishlist has {len(wishlist_data['data'])} items")
                        for item in wishlist_data['data']:
                            print(f"  - Item ID: {item.get('id')}")
                            print(f"  - Event ID: {item.get('event_id')}")
                            print(f"  - Event Title: {item.get('event', {}).get('title', 'N/A')}")
                else:
                    print("❌ Failed to get wishlist")
                    print("Error:", wishlist_response.text)
            else:
                print("❌ No events found")
        else:
            print("❌ Failed to get events")
            print("Error:", events_response.text)
    else:
        print("❌ Login failed")
        print(f"Error: {login_response.text}")

if __name__ == "__main__":
    test_wishlist_full() 