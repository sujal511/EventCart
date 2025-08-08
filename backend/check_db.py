from app import app
from models import db, Event, EventItem
import json

def check_and_populate_db():
    with app.app_context():
        print("Checking database state...")
        events = Event.query.all()
        items = EventItem.query.all()
        
        print(f"Found {len(events)} events")
        print(f"Found {len(items)} event items")
        
        for event in events:
            print(f"Event {event.id}: {event.title} - {event.items if event.items else 0} items")
        
        # If no events, create them
        if len(events) == 0:
            print("\nCreating sample events...")
            create_sample_events()
        
        # If no items, create them  
        if len(items) == 0:
            print("\nAdding items to events...")
            add_event_items()

def create_sample_events():
    events_data = [
        {
            "title": "Wedding Showcase",
            "description": "Find everything you need for your dream wedding from top vendors and wedding planners.",
            "image_url": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800",
            "location": "Taj Palace, Mumbai",
            "date": "June 30, 2025",
            "category": "wedding",
            "attendees": "300+",
            "items": 17,
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
            "items": 17,
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
            "items": 18,
            "price": 2499.00
        }
    ]
    
    for event_data in events_data:
        event = Event(**event_data)
        db.session.add(event)
    
    db.session.commit()
    print(f"Created {len(events_data)} events")

def add_event_items():
    events = Event.query.all()
    
    # Items for each category
    birthday_items = [
        {"name": "Balloons (Set of 50)", "category": "decorations", "price": 24.99, "quantity": 1},
        {"name": "Birthday Banner", "category": "decorations", "price": 12.99, "quantity": 1},
        {"name": "Table Confetti", "category": "decorations", "price": 4.99, "quantity": 2},
        {"name": "Birthday Centerpiece", "category": "decorations", "price": 8.99, "quantity": 3},
        {"name": "LED String Lights", "category": "decorations", "price": 15.99, "quantity": 2},
        {"name": "Disposable Plates (25 pcs)", "category": "tableware", "price": 9.99, "quantity": 2},
        {"name": "Disposable Cups (25 pcs)", "category": "tableware", "price": 7.99, "quantity": 2},
        {"name": "Napkins (50 pcs)", "category": "tableware", "price": 5.99, "quantity": 1},
        {"name": "Plastic Cutlery Set (25 sets)", "category": "tableware", "price": 8.99, "quantity": 2},
        {"name": "Table Cloths", "category": "tableware", "price": 12.99, "quantity": 3},
        {"name": "Serving Platters", "category": "food_drink", "price": 6.99, "quantity": 4},
        {"name": "Drink Dispenser (2 Gal)", "category": "food_drink", "price": 19.99, "quantity": 1},
        {"name": "Ice Bucket", "category": "food_drink", "price": 14.99, "quantity": 1},
        {"name": "Party Favor Bags (25 pcs)", "category": "favors", "price": 9.99, "quantity": 1},
        {"name": "Mini Photo Frame Favors", "category": "favors", "price": 19.99, "quantity": 1},
        {"name": "Candy Buffet Setup", "category": "favors", "price": 24.99, "quantity": 1},
        {"name": "Thank You Stickers", "category": "favors", "price": 4.99, "quantity": 1}
    ]
    
    wedding_items = [
        {"name": "Wedding Balloons (Set of 50)", "category": "decorations", "price": 34.99, "quantity": 2},
        {"name": "Wedding Banner", "category": "decorations", "price": 19.99, "quantity": 1},
        {"name": "Table Confetti", "category": "decorations", "price": 5.99, "quantity": 3},
        {"name": "Wedding Centerpiece", "category": "decorations", "price": 14.99, "quantity": 5},
        {"name": "LED String Lights", "category": "decorations", "price": 19.99, "quantity": 3},
        {"name": "Fine China Plates (50 pcs)", "category": "tableware", "price": 49.99, "quantity": 2},
        {"name": "Wine Glasses (50 pcs)", "category": "tableware", "price": 39.99, "quantity": 2},
        {"name": "Linen Napkins (50 pcs)", "category": "tableware", "price": 29.99, "quantity": 1},
        {"name": "Silver Cutlery Set (50 sets)", "category": "tableware", "price": 79.99, "quantity": 2},
        {"name": "Elegant Table Cloths", "category": "tableware", "price": 24.99, "quantity": 8},
        {"name": "Wedding Gift Boxes (Set of 10)", "category": "favors", "price": 15.99, "quantity": 5},
        {"name": "Personalized Thank You Cards (25 pcs)", "category": "favors", "price": 12.99, "quantity": 2},
        {"name": "Mini Champagne Bottles (10 pcs)", "category": "favors", "price": 29.99, "quantity": 3},
        {"name": "Bridal Bouquet", "category": "flowers", "price": 89.99, "quantity": 1},
        {"name": "Bridesmaid Bouquets", "category": "flowers", "price": 49.99, "quantity": 3},
        {"name": "Flower Centerpieces", "category": "flowers", "price": 34.99, "quantity": 6},
        {"name": "Boutonnières (Set of 5)", "category": "flowers", "price": 39.99, "quantity": 1}
    ]
    
    housewarming_items = [
        {"name": "Welcome Balloons (Set of 20)", "category": "decorations", "price": 19.99, "quantity": 1},
        {"name": "Housewarming Banner", "category": "decorations", "price": 14.99, "quantity": 1},
        {"name": "Welcome Doormat", "category": "decorations", "price": 24.99, "quantity": 1},
        {"name": "Decorative Lanterns", "category": "decorations", "price": 29.99, "quantity": 3},
        {"name": "Potted Plants (Set of 3)", "category": "decorations", "price": 39.99, "quantity": 2},
        {"name": "Dinner Plates (Set of 8)", "category": "kitchen", "price": 34.99, "quantity": 1},
        {"name": "Coffee Mugs (Set of 6)", "category": "kitchen", "price": 19.99, "quantity": 1},
        {"name": "Kitchen Towels (Set of 4)", "category": "kitchen", "price": 12.99, "quantity": 2},
        {"name": "Cooking Utensil Set", "category": "kitchen", "price": 24.99, "quantity": 1},
        {"name": "Spice Rack", "category": "kitchen", "price": 29.99, "quantity": 1},
        {"name": "Cheese Board Set", "category": "entertaining", "price": 34.99, "quantity": 1},
        {"name": "Cocktail Shaker Set", "category": "entertaining", "price": 24.99, "quantity": 1},
        {"name": "Recipe Book", "category": "entertaining", "price": 19.99, "quantity": 1},
        {"name": "Board Games (Set of 2)", "category": "entertaining", "price": 29.99, "quantity": 1},
        {"name": "Tool Kit", "category": "practical", "price": 39.99, "quantity": 1},
        {"name": "First Aid Kit", "category": "practical", "price": 19.99, "quantity": 1},
        {"name": "Emergency Flashlight", "category": "practical", "price": 12.99, "quantity": 2},
        {"name": "Fire Extinguisher", "category": "practical", "price": 29.99, "quantity": 1}
    ]
    
    category_items = {
        "birthday": birthday_items,
        "wedding": wedding_items,
        "housewarming": housewarming_items
    }
    
    for event in events:
        category = event.category.lower()
        
        if category in category_items:
            items = category_items[category]
            
            for item_data in items:
                item = EventItem(
                    event_id=event.id,
                    name=item_data["name"],
                    description=f"Category: {item_data['category'].title()}",
                    quantity=item_data["quantity"],
                    price=item_data["price"],
                    category=item_data["category"],
                    image_url=f"https://via.placeholder.com/300x200/007bff/ffffff?text={item_data['name'].replace(' ', '+')}"
                )
                db.session.add(item)
            
            event.items = len(items)
            print(f"Added {len(items)} items to {event.title}")
    
    db.session.commit()
    print("All items added successfully!")

if __name__ == "__main__":
    check_and_populate_db()
