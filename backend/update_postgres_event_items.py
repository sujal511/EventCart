import json
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from models import db, Event, EventItem
from app import app

# Load environment variables
load_dotenv()

def update_event_items():
    # Use the existing database URL from .env
    database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:123@localhost:5432/shifthub')
    
    print(f"Connecting to existing PostgreSQL database: {database_url}")
    
    # Configure Flask app to use PostgreSQL
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    
    # Update the database with event items
    with app.app_context():
        # Check if there are existing event items
        existing_items = EventItem.query.count()
        print(f"Found {existing_items} existing event items")
        
        # Clear existing event items if any
        if existing_items > 0:
            print("Clearing existing event items...")
            EventItem.query.delete()
            db.session.commit()
        
        # Get all events
        events = Event.query.all()
        print(f"Found {len(events)} events in the database")
        
        if not events:
            print("No events found in the database. Please make sure events exist before adding items.")
            return
        
        # Define items for each event based on frontend data
        birthday_items = [
            {"name": "Balloons (Set of 50)", "description": "Category: Decorations", "quantity": 1, "price": 24.99, "category": "decorations", "image_url": "https://example.com/items/1.jpg"},
            {"name": "Birthday Banner", "description": "Category: Decorations", "quantity": 1, "price": 12.99, "category": "decorations", "image_url": "https://example.com/items/2.jpg"},
            {"name": "Table Confetti", "description": "Category: Decorations", "quantity": 2, "price": 4.99, "category": "decorations", "image_url": "https://example.com/items/3.jpg"},
            {"name": "Birthday Centerpiece", "description": "Category: Decorations", "quantity": 3, "price": 8.99, "category": "decorations", "image_url": "https://example.com/items/4.jpg"},
            {"name": "LED String Lights", "description": "Category: Decorations", "quantity": 2, "price": 15.99, "category": "decorations", "image_url": "https://example.com/items/5.jpg"},
            {"name": "Disposable Plates (25 pcs)", "description": "Category: Tableware", "quantity": 2, "price": 9.99, "category": "tableware", "image_url": "https://example.com/items/6.jpg"},
            {"name": "Disposable Cups (25 pcs)", "description": "Category: Tableware", "quantity": 2, "price": 7.99, "category": "tableware", "image_url": "https://example.com/items/7.jpg"},
            {"name": "Napkins (50 pcs)", "description": "Category: Tableware", "quantity": 1, "price": 5.99, "category": "tableware", "image_url": "https://example.com/items/8.jpg"},
            {"name": "Plastic Cutlery Set (25 sets)", "description": "Category: Tableware", "quantity": 2, "price": 8.99, "category": "tableware", "image_url": "https://example.com/items/9.jpg"},
            {"name": "Table Cloths", "description": "Category: Tableware", "quantity": 3, "price": 12.99, "category": "tableware", "image_url": "https://example.com/items/10.jpg"},
            {"name": "Serving Platters", "description": "Category: Food & Drink Containers", "quantity": 4, "price": 6.99, "category": "food", "image_url": "https://example.com/items/11.jpg"},
            {"name": "Drink Dispenser (2 Gal)", "description": "Category: Food & Drink Containers", "quantity": 1, "price": 19.99, "category": "food", "image_url": "https://example.com/items/12.jpg"},
            {"name": "Ice Bucket", "description": "Category: Food & Drink Containers", "quantity": 1, "price": 14.99, "category": "food", "image_url": "https://example.com/items/13.jpg"},
            {"name": "Food Storage Containers", "description": "Category: Food & Drink Containers", "quantity": 5, "price": 4.99, "category": "food", "image_url": "https://example.com/items/14.jpg"},
            {"name": "Gift Bags (Set of 10)", "description": "Category: Party Favors", "quantity": 3, "price": 12.99, "category": "favors", "image_url": "https://example.com/items/15.jpg"},
            {"name": "Party Whistles (10 pcs)", "description": "Category: Party Favors", "quantity": 2, "price": 6.99, "category": "favors", "image_url": "https://example.com/items/16.jpg"},
            {"name": "Party Hats (10 pcs)", "description": "Category: Party Favors", "quantity": 2, "price": 8.99, "category": "favors", "image_url": "https://example.com/items/17.jpg"}
        ]
        
        wedding_items = [
            {"name": "Wedding Balloons (Set of 50)", "description": "Category: Decorations", "quantity": 2, "price": 34.99, "category": "decorations", "image_url": "https://example.com/items/101.jpg"},
            {"name": "Wedding Banner", "description": "Category: Decorations", "quantity": 1, "price": 19.99, "category": "decorations", "image_url": "https://example.com/items/102.jpg"},
            {"name": "Table Confetti", "description": "Category: Decorations", "quantity": 3, "price": 5.99, "category": "decorations", "image_url": "https://example.com/items/103.jpg"},
            {"name": "Wedding Centerpiece", "description": "Category: Decorations", "quantity": 5, "price": 14.99, "category": "decorations", "image_url": "https://example.com/items/104.jpg"},
            {"name": "LED String Lights", "description": "Category: Decorations", "quantity": 3, "price": 19.99, "category": "decorations", "image_url": "https://example.com/items/105.jpg"},
            {"name": "Elegant Disposable Plates (25 pcs)", "description": "Category: Tableware", "quantity": 4, "price": 12.99, "category": "tableware", "image_url": "https://example.com/items/106.jpg"},
            {"name": "Crystal-look Cups (25 pcs)", "description": "Category: Tableware", "quantity": 4, "price": 9.99, "category": "tableware", "image_url": "https://example.com/items/107.jpg"},
            {"name": "Decorative Napkins (50 pcs)", "description": "Category: Tableware", "quantity": 2, "price": 7.99, "category": "tableware", "image_url": "https://example.com/items/108.jpg"},
            {"name": "Silver Cutlery Set (25 sets)", "description": "Category: Tableware", "quantity": 4, "price": 14.99, "category": "tableware", "image_url": "https://example.com/items/109.jpg"},
            {"name": "White Table Cloths", "description": "Category: Tableware", "quantity": 6, "price": 16.99, "category": "tableware", "image_url": "https://example.com/items/110.jpg"},
            {"name": "Wedding Gift Boxes (Set of 10)", "description": "Category: Wedding Favors", "quantity": 5, "price": 15.99, "category": "favors", "image_url": "https://example.com/items/111.jpg"},
            {"name": "Personalized Thank You Cards (25 pcs)", "description": "Category: Wedding Favors", "quantity": 2, "price": 12.99, "category": "favors", "image_url": "https://example.com/items/112.jpg"},
            {"name": "Mini Champagne Bottles (10 pcs)", "description": "Category: Wedding Favors", "quantity": 3, "price": 29.99, "category": "favors", "image_url": "https://example.com/items/113.jpg"},
            {"name": "Bridal Bouquet", "description": "Category: Floral Arrangements", "quantity": 1, "price": 89.99, "category": "flowers", "image_url": "https://example.com/items/114.jpg"},
            {"name": "Bridesmaid Bouquets", "description": "Category: Floral Arrangements", "quantity": 3, "price": 49.99, "category": "flowers", "image_url": "https://example.com/items/115.jpg"},
            {"name": "Flower Centerpieces", "description": "Category: Floral Arrangements", "quantity": 6, "price": 34.99, "category": "flowers", "image_url": "https://example.com/items/116.jpg"},
            {"name": "Boutonnières (Set of 5)", "description": "Category: Floral Arrangements", "quantity": 1, "price": 39.99, "category": "flowers", "image_url": "https://example.com/items/117.jpg"}
        ]
        
        housewarming_items = [
            {"name": "Welcome Sign", "description": "Category: Home Decorations", "quantity": 1, "price": 19.99, "category": "decorations", "image_url": "https://example.com/items/201.jpg"},
            {"name": "Decorative Candles (Set of 3)", "description": "Category: Home Decorations", "quantity": 2, "price": 24.99, "category": "decorations", "image_url": "https://example.com/items/202.jpg"},
            {"name": "Indoor Plants (Set of 2)", "description": "Category: Home Decorations", "quantity": 1, "price": 34.99, "category": "decorations", "image_url": "https://example.com/items/203.jpg"},
            {"name": "Photo Frames (Set of 4)", "description": "Category: Home Decorations", "quantity": 1, "price": 29.99, "category": "decorations", "image_url": "https://example.com/items/204.jpg"},
            {"name": "Throw Pillows (Set of 2)", "description": "Category: Home Decorations", "quantity": 2, "price": 24.99, "category": "decorations", "image_url": "https://example.com/items/205.jpg"},
            {"name": "Wine Glasses (Set of 6)", "description": "Category: Kitchen Essentials", "quantity": 1, "price": 19.99, "category": "kitchenware", "image_url": "https://example.com/items/206.jpg"},
            {"name": "Serving Tray", "description": "Category: Kitchen Essentials", "quantity": 2, "price": 14.99, "category": "kitchenware", "image_url": "https://example.com/items/207.jpg"},
            {"name": "Coaster Set", "description": "Category: Kitchen Essentials", "quantity": 2, "price": 9.99, "category": "kitchenware", "image_url": "https://example.com/items/208.jpg"},
            {"name": "Kitchen Towels (Set of 4)", "description": "Category: Kitchen Essentials", "quantity": 1, "price": 12.99, "category": "kitchenware", "image_url": "https://example.com/items/209.jpg"},
            {"name": "Spice Rack with Spices", "description": "Category: Kitchen Essentials", "quantity": 1, "price": 29.99, "category": "kitchenware", "image_url": "https://example.com/items/210.jpg"},
            {"name": "Cheese Board Set", "description": "Category: Entertaining Essentials", "quantity": 1, "price": 34.99, "category": "entertaining", "image_url": "https://example.com/items/211.jpg"},
            {"name": "Cocktail Shaker Set", "description": "Category: Entertaining Essentials", "quantity": 1, "price": 24.99, "category": "entertaining", "image_url": "https://example.com/items/212.jpg"},
            {"name": "Recipe Book", "description": "Category: Entertaining Essentials", "quantity": 1, "price": 19.99, "category": "entertaining", "image_url": "https://example.com/items/213.jpg"},
            {"name": "Board Games (Set of 2)", "description": "Category: Entertaining Essentials", "quantity": 1, "price": 29.99, "category": "entertaining", "image_url": "https://example.com/items/214.jpg"},
            {"name": "Tool Kit", "description": "Category: Practical Items", "quantity": 1, "price": 39.99, "category": "practical", "image_url": "https://example.com/items/215.jpg"},
            {"name": "First Aid Kit", "description": "Category: Practical Items", "quantity": 1, "price": 19.99, "category": "practical", "image_url": "https://example.com/items/216.jpg"},
            {"name": "Emergency Flashlight", "description": "Category: Practical Items", "quantity": 2, "price": 12.99, "category": "practical", "image_url": "https://example.com/items/217.jpg"},
            {"name": "Fire Extinguisher", "description": "Category: Practical Items", "quantity": 1, "price": 29.99, "category": "practical", "image_url": "https://example.com/items/218.jpg"}
        ]
        
        # Map categories to item lists
        category_items = {
            "wedding": wedding_items,
            "birthday": birthday_items,
            "housewarming": housewarming_items
        }
        
        # Add items to each event based on category
        for event in events:
            category = event.category.lower()
            
            # Skip if category not in our predefined data
            if category not in category_items:
                print(f"Warning: No predefined items for category '{category}'. Skipping event {event.id}.")
                continue
            
            # Get items for this category
            items = category_items[category]
            
            # Add items to the event
            for item_data in items:
                new_item = EventItem(
                    event_id=event.id,
                    name=item_data["name"],
                    description=item_data["description"],
                    quantity=item_data["quantity"],
                    price=item_data["price"],
                    image_url=item_data["image_url"],
                    category=item_data["category"]
                )
                db.session.add(new_item)
            
            # Update event with item count and delivery options if not already set
            event.items = len(items)
            
            # Add delivery options if not already set
            if not event.delivery_options:
                if category == "wedding":
                    event.delivery_options = json.dumps([
                        {"id": "delivery", "name": "Local Delivery", "price": 29.99, "time": "2-3 days"},
                        {"id": "express", "name": "Express Delivery", "price": 49.99, "time": "24 hours"},
                        {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                    ])
                elif category == "birthday":
                    event.delivery_options = json.dumps([
                        {"id": "delivery", "name": "Local Delivery", "price": 19.99, "time": "2-3 days"},
                        {"id": "express", "name": "Express Delivery", "price": 34.99, "time": "24 hours"},
                        {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                    ])
                elif category == "housewarming":
                    event.delivery_options = json.dumps([
                        {"id": "delivery", "name": "Local Delivery", "price": 24.99, "time": "2-3 days"},
                        {"id": "express", "name": "Express Delivery", "price": 39.99, "time": "24 hours"},
                        {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                    ])
            
            print(f"Added {len(items)} items to event {event.id}: {event.title}")
        
        # Commit all changes
        db.session.commit()
        print("All items added successfully!")

if __name__ == "__main__":
    update_event_items()
