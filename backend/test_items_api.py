import requests
import json

# Test the event items API
def test_items_api():
    # First login to get token
    login_url = "http://localhost:5000/api/users/login"
    login_data = {
        "email": "shifthubadmin@gmail.com",
        "password": "12345678"
    }
    
    try:
        # Login
        response = requests.post(login_url, json=login_data)
        print(f"Login status: {response.status_code}")
        
        if response.status_code == 200:
            token = response.json().get('token')
            print(f"Token obtained: {token[:50]}...")
            
            # Test get events
            headers = {"Authorization": f"Bearer {token}"}
            events_url = "http://localhost:5000/api/events"
            events_response = requests.get(events_url, headers=headers)
            print(f"Events API status: {events_response.status_code}")
            
            if events_response.status_code == 200:
                events = events_response.json()
                print(f"Found {len(events)} events")
                
                # Find Birthday Party Collection
                birthday_event = None
                for event in events:
                    if "Birthday" in event.get('title', ''):
                        birthday_event = event
                        break
                
                if birthday_event:
                    event_id = birthday_event['id']
                    print(f"Found Birthday event with ID: {event_id}")
                    
                    # Test event items API
                    items_url = f"http://localhost:5000/api/admin/events/{event_id}/items"
                    items_response = requests.get(items_url, headers=headers)
                    print(f"Items API status: {items_response.status_code}")
                    
                    if items_response.status_code == 200:
                        items = items_response.json()
                        print(f"Found {len(items)} items:")
                        for item in items[:3]:  # Show first 3 items
                            print(f"  - {item.get('name')}: Qty {item.get('quantity')}, ₹{item.get('price')}")
                    else:
                        print(f"Items API error: {items_response.text}")
                else:
                    print("Birthday Party Collection event not found")
            else:
                print(f"Events API error: {events_response.text}")
        else:
            print(f"Login failed: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_items_api() 