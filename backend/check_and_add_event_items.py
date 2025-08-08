from app import app
from models import db, Event, EventItem

def check_event_items():
    with app.app_context():
        events = Event.query.all()
        print(f'Total events: {len(events)}')
        
        for event in events:
            items = EventItem.query.filter_by(event_id=event.id).all()
            print(f'Event ID {event.id}: {event.title} - {len(items)} items')

def add_event_items():
    with app.app_context():
        events = Event.query.all()
        
        # Sample items for different event types
        concert_items = [
            {"name": "VIP Pass", "description": "Access to exclusive VIP area", "quantity": 50, "image_url": "https://example.com/vip-pass.jpg"},
            {"name": "Backstage Pass", "description": "Meet the artists backstage", "quantity": 20, "image_url": "https://example.com/backstage-pass.jpg"},
            {"name": "Merchandise Pack", "description": "T-shirt, poster, and other merchandise", "quantity": 100, "image_url": "https://example.com/merch-pack.jpg"}
        ]
        
        conference_items = [
            {"name": "Workshop Access", "description": "Access to all workshops", "quantity": 50, "image_url": "https://example.com/workshop.jpg"},
            {"name": "Networking Dinner", "description": "Join the networking dinner event", "quantity": 30, "image_url": "https://example.com/dinner.jpg"},
            {"name": "Conference Materials", "description": "Printed materials and digital resources", "quantity": 100, "image_url": "https://example.com/materials.jpg"}
        ]
        
        sports_items = [
            {"name": "Premium Seating", "description": "Best view seats", "quantity": 50, "image_url": "https://example.com/premium-seat.jpg"},
            {"name": "Team Merchandise", "description": "Official team merchandise", "quantity": 100, "image_url": "https://example.com/team-merch.jpg"},
            {"name": "Meet & Greet", "description": "Meet your favorite players", "quantity": 20, "image_url": "https://example.com/meet-greet.jpg"}
        ]
        
        exhibition_items = [
            {"name": "Guided Tour", "description": "Expert-led tour of the exhibition", "quantity": 40, "image_url": "https://example.com/guided-tour.jpg"},
            {"name": "Exhibition Catalog", "description": "Detailed catalog of all exhibits", "quantity": 100, "image_url": "https://example.com/catalog.jpg"},
            {"name": "VIP Preview", "description": "Exclusive preview before public opening", "quantity": 30, "image_url": "https://example.com/vip-preview.jpg"}
        ]
        
        workshop_items = [
            {"name": "Materials Kit", "description": "All materials needed for the workshop", "quantity": 50, "image_url": "https://example.com/materials-kit.jpg"},
            {"name": "Certificate", "description": "Certificate of completion", "quantity": 50, "image_url": "https://example.com/certificate.jpg"},
            {"name": "Extended Q&A", "description": "Additional time with the instructor", "quantity": 20, "image_url": "https://example.com/qa.jpg"}
        ]
        
        # Default items for any other category
        default_items = [
            {"name": "General Admission", "description": "Standard entry ticket", "quantity": 100, "image_url": "https://example.com/general.jpg"},
            {"name": "Premium Package", "description": "Enhanced experience package", "quantity": 50, "image_url": "https://example.com/premium.jpg"},
            {"name": "Souvenir", "description": "Event souvenir", "quantity": 100, "image_url": "https://example.com/souvenir.jpg"}
        ]
        
        for event in events:
            # Skip if event already has items
            existing_items = EventItem.query.filter_by(event_id=event.id).all()
            if existing_items:
                print(f"Event {event.id} already has {len(existing_items)} items. Skipping.")
                continue
            
            # Select items based on event category
            items_to_add = default_items
            if event.category.lower() == 'concert' or event.category.lower() == 'music':
                items_to_add = concert_items
            elif event.category.lower() == 'conference' or event.category.lower() == 'business':
                items_to_add = conference_items
            elif event.category.lower() == 'sports':
                items_to_add = sports_items
            elif event.category.lower() == 'exhibition' or event.category.lower() == 'art':
                items_to_add = exhibition_items
            elif event.category.lower() == 'workshop' or event.category.lower() == 'education':
                items_to_add = workshop_items
            
            # Add items to the event
            for item_data in items_to_add:
                new_item = EventItem(
                    event_id=event.id,
                    name=item_data["name"],
                    description=item_data["description"],
                    quantity=item_data["quantity"],
                    image_url=item_data["image_url"]
                )
                db.session.add(new_item)
            
            print(f"Added {len(items_to_add)} items to event {event.id}: {event.title}")
        
        # Commit all changes
        db.session.commit()
        print("All items added successfully!")

if __name__ == "__main__":
    print("Checking current event items...")
    check_event_items()
    
    print("\nAdding event items...")
    add_event_items()
    
    print("\nVerifying event items after addition...")
    check_event_items()
