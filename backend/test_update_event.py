import requests
import json

def test_update_event():
    # Login first
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
            
            headers = {"Authorization": f"Bearer {token}"}
            
            # Get events first
            events_response = requests.get("http://localhost:5000/api/events", headers=headers)
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
                    print(f"Current event data: {birthday_event}")
                    
                    # Test update event
                    update_data = {
                        "title": birthday_event['title'],
                        "description": birthday_event['description'], 
                        "location": birthday_event['location'],
                        "date": birthday_event['date'],
                        "category": birthday_event['category'],
                        "price": birthday_event['price'],
                        "attendees": birthday_event.get('attendees', ''),
                        "image_url": birthday_event.get('image_url', ''),
                        "delivery_options": birthday_event.get('delivery_options', '')
                    }
                    
                    print(f"Update data: {json.dumps(update_data, indent=2)}")
                    
                    update_url = f"http://localhost:5000/api/admin/events/{event_id}"
                    update_response = requests.put(update_url, json=update_data, headers=headers)
                    print(f"Update status: {update_response.status_code}")
                    print(f"Update response: {update_response.text}")
                    
                else:
                    print("Birthday Party Collection event not found")
            else:
                print(f"Events API error: {events_response.text}")
        else:
            print(f"Login failed: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_update_event() 