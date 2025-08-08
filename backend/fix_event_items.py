from app import app
from models import db, Event, EventItem
import json
import sqlite3

def fix_event_items():
    # First, let's manually add the missing columns to the database tables
    conn = sqlite3.connect('shifthub.db')
    cursor = conn.cursor()
    
    # Check if columns exist and add them if they don't
    try:
        cursor.execute("ALTER TABLE event_items ADD COLUMN price REAL DEFAULT 0.0")
        print("Added price column to event_items table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Price column already exists in event_items table")
        else:
            print(f"Error adding price column: {e}")
    
    try:
        cursor.execute("ALTER TABLE event_items ADD COLUMN category TEXT")
        print("Added category column to event_items table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Category column already exists in event_items table")
        else:
            print(f"Error adding category column: {e}")
    
    try:
        cursor.execute("ALTER TABLE events ADD COLUMN delivery_options TEXT")
        print("Added delivery_options column to events table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Delivery_options column already exists in events table")
        else:
            print(f"Error adding delivery_options column: {e}")
    
    conn.commit()
    conn.close()
    
    # Now use SQLAlchemy to update the event items
    with app.app_context():
        # Clear existing event items
        EventItem.query.delete()
        db.session.commit()
        
        # Define event items based on frontend data
        event_data = {
            "wedding": {
                "deliveryOptions": [
                    {"id": "delivery", "name": "Local Delivery", "price": 29.99, "time": "2-3 days"},
                    {"id": "express", "name": "Express Delivery", "price": 49.99, "time": "24 hours"},
                    {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                ],
                "categories": [
                    {
                        "id": "decorations",
                        "name": "Decorations",
                        "items": [
                            {"id": 101, "name": "Wedding Balloons (Set of 50)", "quantity": 2, "price": 34.99},
                            {"id": 102, "name": "Wedding Banner", "quantity": 1, "price": 19.99},
                            {"id": 103, "name": "Table Confetti", "quantity": 3, "price": 5.99},
                            {"id": 104, "name": "Wedding Centerpiece", "quantity": 5, "price": 14.99},
                            {"id": 105, "name": "LED String Lights", "quantity": 3, "price": 19.99}
                        ]
                    },
                    {
                        "id": "tableware",
                        "name": "Tableware",
                        "items": [
                            {"id": 106, "name": "Elegant Disposable Plates (25 pcs)", "quantity": 4, "price": 12.99},
                            {"id": 107, "name": "Crystal-look Cups (25 pcs)", "quantity": 4, "price": 9.99},
                            {"id": 108, "name": "Decorative Napkins (50 pcs)", "quantity": 2, "price": 7.99},
                            {"id": 109, "name": "Silver Cutlery Set (25 sets)", "quantity": 4, "price": 14.99},
                            {"id": 110, "name": "White Table Cloths", "quantity": 6, "price": 16.99}
                        ]
                    },
                    {
                        "id": "favors",
                        "name": "Wedding Favors",
                        "items": [
                            {"id": 111, "name": "Wedding Gift Boxes (Set of 10)", "quantity": 5, "price": 15.99},
                            {"id": 112, "name": "Personalized Thank You Cards (25 pcs)", "quantity": 2, "price": 12.99},
                            {"id": 113, "name": "Mini Champagne Bottles (10 pcs)", "quantity": 3, "price": 29.99}
                        ]
                    },
                    {
                        "id": "flowers",
                        "name": "Floral Arrangements",
                        "items": [
                            {"id": 114, "name": "Bridal Bouquet", "quantity": 1, "price": 89.99},
                            {"id": 115, "name": "Bridesmaid Bouquets", "quantity": 3, "price": 49.99},
                            {"id": 116, "name": "Flower Centerpieces", "quantity": 6, "price": 34.99},
                            {"id": 117, "name": "Boutonnières (Set of 5)", "quantity": 1, "price": 39.99}
                        ]
                    }
                ]
            },
            "birthday": {
                "deliveryOptions": [
                    {"id": "delivery", "name": "Local Delivery", "price": 19.99, "time": "2-3 days"},
                    {"id": "express", "name": "Express Delivery", "price": 34.99, "time": "24 hours"},
                    {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                ],
                "categories": [
                    {
                        "id": "decorations",
                        "name": "Decorations",
                        "items": [
                            {"id": 1, "name": "Balloons (Set of 50)", "quantity": 1, "price": 24.99},
                            {"id": 2, "name": "Birthday Banner", "quantity": 1, "price": 12.99},
                            {"id": 3, "name": "Table Confetti", "quantity": 2, "price": 4.99},
                            {"id": 4, "name": "Birthday Centerpiece", "quantity": 3, "price": 8.99},
                            {"id": 5, "name": "LED String Lights", "quantity": 2, "price": 15.99}
                        ]
                    },
                    {
                        "id": "tableware",
                        "name": "Tableware",
                        "items": [
                            {"id": 6, "name": "Disposable Plates (25 pcs)", "quantity": 2, "price": 9.99},
                            {"id": 7, "name": "Disposable Cups (25 pcs)", "quantity": 2, "price": 7.99},
                            {"id": 8, "name": "Napkins (50 pcs)", "quantity": 1, "price": 5.99},
                            {"id": 9, "name": "Plastic Cutlery Set (25 sets)", "quantity": 2, "price": 8.99},
                            {"id": 10, "name": "Table Cloths", "quantity": 3, "price": 12.99}
                        ]
                    },
                    {
                        "id": "food",
                        "name": "Food & Drink Containers",
                        "items": [
                            {"id": 11, "name": "Serving Platters", "quantity": 4, "price": 6.99},
                            {"id": 12, "name": "Drink Dispenser (2 Gal)", "quantity": 1, "price": 19.99},
                            {"id": 13, "name": "Ice Bucket", "quantity": 1, "price": 14.99},
                            {"id": 14, "name": "Food Storage Containers", "quantity": 5, "price": 4.99}
                        ]
                    },
                    {
                        "id": "favors",
                        "name": "Party Favors",
                        "items": [
                            {"id": 15, "name": "Gift Bags (Set of 10)", "quantity": 3, "price": 12.99},
                            {"id": 16, "name": "Party Whistles (10 pcs)", "quantity": 2, "price": 6.99},
                            {"id": 17, "name": "Party Hats (10 pcs)", "quantity": 2, "price": 8.99}
                        ]
                    }
                ]
            },
            "housewarming": {
                "deliveryOptions": [
                    {"id": "delivery", "name": "Local Delivery", "price": 24.99, "time": "2-3 days"},
                    {"id": "express", "name": "Express Delivery", "price": 39.99, "time": "24 hours"},
                    {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                ],
                "categories": [
                    {
                        "id": "decorations",
                        "name": "Home Decorations",
                        "items": [
                            {"id": 201, "name": "Welcome Sign", "quantity": 1, "price": 19.99},
                            {"id": 202, "name": "Decorative Candles (Set of 3)", "quantity": 2, "price": 24.99},
                            {"id": 203, "name": "Indoor Plants (Set of 2)", "quantity": 1, "price": 34.99},
                            {"id": 204, "name": "Photo Frames (Set of 4)", "quantity": 1, "price": 29.99},
                            {"id": 205, "name": "Throw Pillows (Set of 2)", "quantity": 2, "price": 24.99}
                        ]
                    },
                    {
                        "id": "kitchenware",
                        "name": "Kitchen Essentials",
                        "items": [
                            {"id": 206, "name": "Wine Glasses (Set of 6)", "quantity": 1, "price": 19.99},
                            {"id": 207, "name": "Serving Tray", "quantity": 2, "price": 14.99},
                            {"id": 208, "name": "Coaster Set", "quantity": 2, "price": 9.99},
                            {"id": 209, "name": "Kitchen Towels (Set of 4)", "quantity": 1, "price": 12.99},
                            {"id": 210, "name": "Spice Rack with Spices", "quantity": 1, "price": 29.99}
                        ]
                    },
                    {
                        "id": "entertaining",
                        "name": "Entertaining Essentials",
                        "items": [
                            {"id": 211, "name": "Cheese Board Set", "quantity": 1, "price": 34.99},
                            {"id": 212, "name": "Cocktail Shaker Set", "quantity": 1, "price": 24.99},
                            {"id": 213, "name": "Recipe Book", "quantity": 1, "price": 19.99},
                            {"id": 214, "name": "Board Games (Set of 2)", "quantity": 1, "price": 29.99}
                        ]
                    },
                    {
                        "id": "practical",
                        "name": "Practical Items",
                        "items": [
                            {"id": 215, "name": "Tool Kit", "quantity": 1, "price": 39.99},
                            {"id": 216, "name": "First Aid Kit", "quantity": 1, "price": 19.99},
                            {"id": 217, "name": "Emergency Flashlight", "quantity": 2, "price": 12.99},
                            {"id": 218, "name": "Fire Extinguisher", "quantity": 1, "price": 29.99}
                        ]
                    }
                ]
            }
        }
        
        # Get all events
        events = Event.query.all()
        print(f"Found {len(events)} events in the database")
        
        # Update each event with appropriate items
        for event in events:
            category = event.category.lower()
            
            # Skip if category not in our predefined data
            if category not in event_data:
                print(f"Warning: No predefined items for category '{category}'. Skipping event {event.id}.")
                continue
            
            # Store delivery options as JSON in the event delivery_options field
            event.delivery_options = json.dumps(event_data[category]["deliveryOptions"])
            
            # Add items for this event
            item_count = 0
            for cat in event_data[category]["categories"]:
                for item in cat["items"]:
                    new_item = EventItem(
                        event_id=event.id,
                        name=item["name"],
                        description=f"Category: {cat['name']}",
                        quantity=item["quantity"],
                        price=item["price"],
                        # Use placeholder image with item name
                        image_url=f"https://via.placeholder.com/600x400/007bff/ffffff?text={item['name'].replace(' ', '+')}",
                        category=cat["id"]
                    )
                    db.session.add(new_item)
                    item_count += 1
            
            # Update event with item count
            event.items = item_count
            print(f"Added {item_count} items to event {event.id}: {event.title}")
        
        # Commit all changes
        db.session.commit()
        print("All items updated successfully!")

if __name__ == "__main__":
    fix_event_items()
