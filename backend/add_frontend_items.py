from app import app
from models import db, Event, EventItem
import json

def add_frontend_items():
    with app.app_context():
        # First, clear existing event items
        EventItem.query.delete()
        db.session.commit()
        
        # Get all events
        events = Event.query.all()
        print(f"Found {len(events)} events in the database")
        
        # Define items for each event based on frontend data
        birthday_items = [
            {"name": "Balloons (Set of 50)", "description": "Category: Decorations", "quantity": 1, "price": 24.99},
            {"name": "Birthday Banner", "description": "Category: Decorations", "quantity": 1, "price": 12.99},
            {"name": "Table Confetti", "description": "Category: Decorations", "quantity": 2, "price": 4.99},
            {"name": "Birthday Centerpiece", "description": "Category: Decorations", "quantity": 3, "price": 8.99},
            {"name": "LED String Lights", "description": "Category: Decorations", "quantity": 2, "price": 15.99},
            {"name": "Disposable Plates (25 pcs)", "description": "Category: Tableware", "quantity": 2, "price": 9.99},
            {"name": "Disposable Cups (25 pcs)", "description": "Category: Tableware", "quantity": 2, "price": 7.99},
            {"name": "Napkins (50 pcs)", "description": "Category: Tableware", "quantity": 1, "price": 5.99},
            {"name": "Plastic Cutlery Set (25 sets)", "description": "Category: Tableware", "quantity": 2, "price": 8.99},
            {"name": "Table Cloths", "description": "Category: Tableware", "quantity": 3, "price": 12.99},
            {"name": "Serving Platters", "description": "Category: Food & Drink Containers", "quantity": 4, "price": 6.99},
            {"name": "Drink Dispenser (2 Gal)", "description": "Category: Food & Drink Containers", "quantity": 1, "price": 19.99},
            {"name": "Ice Bucket", "description": "Category: Food & Drink Containers", "quantity": 1, "price": 14.99},
            {"name": "Food Storage Containers", "description": "Category: Food & Drink Containers", "quantity": 5, "price": 4.99},
            {"name": "Gift Bags (Set of 10)", "description": "Category: Party Favors", "quantity": 3, "price": 12.99},
            {"name": "Party Whistles (10 pcs)", "description": "Category: Party Favors", "quantity": 2, "price": 6.99},
            {"name": "Party Hats (10 pcs)", "description": "Category: Party Favors", "quantity": 2, "price": 8.99}
        ]
        
        wedding_items = [
            {"name": "Wedding Balloons (Set of 50)", "description": "Category: Decorations", "quantity": 2, "price": 34.99},
            {"name": "Wedding Banner", "description": "Category: Decorations", "quantity": 1, "price": 19.99},
            {"name": "Table Confetti", "description": "Category: Decorations", "quantity": 3, "price": 5.99},
            {"name": "Wedding Centerpiece", "description": "Category: Decorations", "quantity": 5, "price": 14.99},
            {"name": "LED String Lights", "description": "Category: Decorations", "quantity": 3, "price": 19.99},
            {"name": "Elegant Disposable Plates (25 pcs)", "description": "Category: Tableware", "quantity": 4, "price": 12.99},
            {"name": "Crystal-look Cups (25 pcs)", "description": "Category: Tableware", "quantity": 4, "price": 9.99},
            {"name": "Decorative Napkins (50 pcs)", "description": "Category: Tableware", "quantity": 2, "price": 7.99},
            {"name": "Silver Cutlery Set (25 sets)", "description": "Category: Tableware", "quantity": 4, "price": 14.99},
            {"name": "White Table Cloths", "description": "Category: Tableware", "quantity": 6, "price": 16.99},
            {"name": "Wedding Gift Boxes (Set of 10)", "description": "Category: Wedding Favors", "quantity": 5, "price": 15.99},
            {"name": "Personalized Thank You Cards (25 pcs)", "description": "Category: Wedding Favors", "quantity": 2, "price": 12.99},
            {"name": "Mini Champagne Bottles (10 pcs)", "description": "Category: Wedding Favors", "quantity": 3, "price": 29.99},
            {"name": "Bridal Bouquet", "description": "Category: Floral Arrangements", "quantity": 1, "price": 89.99},
            {"name": "Bridesmaid Bouquets", "description": "Category: Floral Arrangements", "quantity": 3, "price": 49.99},
            {"name": "Flower Centerpieces", "description": "Category: Floral Arrangements", "quantity": 6, "price": 34.99},
            {"name": "Boutonnières (Set of 5)", "description": "Category: Floral Arrangements", "quantity": 1, "price": 39.99}
        ]
        
        housewarming_items = [
            {"name": "Welcome Sign", "description": "Category: Home Decorations", "quantity": 1, "price": 19.99},
            {"name": "Decorative Candles (Set of 3)", "description": "Category: Home Decorations", "quantity": 2, "price": 24.99},
            {"name": "Indoor Plants (Set of 2)", "description": "Category: Home Decorations", "quantity": 1, "price": 34.99},
            {"name": "Photo Frames (Set of 4)", "description": "Category: Home Decorations", "quantity": 1, "price": 29.99},
            {"name": "Throw Pillows (Set of 2)", "description": "Category: Home Decorations", "quantity": 2, "price": 24.99},
            {"name": "Wine Glasses (Set of 6)", "description": "Category: Kitchen Essentials", "quantity": 1, "price": 19.99},
            {"name": "Serving Tray", "description": "Category: Kitchen Essentials", "quantity": 2, "price": 14.99},
            {"name": "Coaster Set", "description": "Category: Kitchen Essentials", "quantity": 2, "price": 9.99},
            {"name": "Kitchen Towels (Set of 4)", "description": "Category: Kitchen Essentials", "quantity": 1, "price": 12.99},
            {"name": "Spice Rack with Spices", "description": "Category: Kitchen Essentials", "quantity": 1, "price": 29.99},
            {"name": "Cheese Board Set", "description": "Category: Entertaining Essentials", "quantity": 1, "price": 34.99},
            {"name": "Cocktail Shaker Set", "description": "Category: Entertaining Essentials", "quantity": 1, "price": 24.99},
            {"name": "Recipe Book", "description": "Category: Entertaining Essentials", "quantity": 1, "price": 19.99},
            {"name": "Board Games (Set of 2)", "description": "Category: Entertaining Essentials", "quantity": 1, "price": 29.99},
            {"name": "Tool Kit", "description": "Category: Practical Items", "quantity": 1, "price": 39.99},
            {"name": "First Aid Kit", "description": "Category: Practical Items", "quantity": 1, "price": 19.99},
            {"name": "Emergency Flashlight", "description": "Category: Practical Items", "quantity": 2, "price": 12.99},
            {"name": "Fire Extinguisher", "description": "Category: Practical Items", "quantity": 1, "price": 29.99}
        ]
        
        # Map categories to item lists
        category_items = {
            "birthday": birthday_items,
            "wedding": wedding_items,
            "housewarming": housewarming_items
        }
        
        # Add items to each event
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
                    quantity=item_data["quantity"]
                )
                db.session.add(new_item)
            
            # Update event with item count
            event.items = len(items)
            print(f"Added {len(items)} items to event {event.id}: {event.title}")
        
        # Commit all changes
        db.session.commit()
        print("All items added successfully!")

if __name__ == "__main__":
    add_frontend_items()
