from app import app, db
from models import Event, EventItem
from datetime import datetime, timedelta

def create_sample_events():
    # Clear existing data
    EventItem.query.delete()
    Event.query.delete()
    db.session.commit()
    
    # Sample events data
    events = [
        {
            "title": "Wedding Showcase",
            "description": "Find everything you need for your dream wedding from top vendors and wedding planners.",
            "image_url": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800",
            "location": "Taj Palace, Mumbai",
            "date": (datetime.now() + timedelta(days=30)).strftime("%B %d, %Y"),
            "category": "wedding",
            "attendees": "300+",
            "items": 50,
            "price": 3999.00
        },
        {
            "title": "Birthday Party Collection",
            "description": "Everything you need for an unforgettable birthday celebration for all ages.",
            "image_url": "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=800",
            "location": "Your Location",
            "date": "Customizable",
            "category": "birthday",
            "attendees": "25-100",
            "items": 35,
            "price": 1299.00
        },
        {
            "title": "Housewarming Package",
            "description": "Complete package for your housewarming ceremony including pooja items and guest essentials.",
            "image_url": "https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?auto=format&fit=crop&w=800",
            "location": "Your New Home",
            "date": "Customizable",
            "category": "housewarming",
            "attendees": "20-50",
            "items": 30,
            "price": 2499.00
        }
    ]
    
    # Add events to database
    for event_data in events:
        event = Event(**event_data)
        db.session.add(event)
    
    db.session.commit()
    print(f"Added {len(events)} sample events to the database.")

if __name__ == "__main__":
    with app.app_context():
        create_sample_events()
