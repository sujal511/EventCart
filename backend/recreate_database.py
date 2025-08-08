import os
from app import app
from models import db, User, Event, EventItem, Order, OrderItem, Cart, CartItem, PaymentMethod, Address
import json

def recreate_database():
    with app.app_context():
        # Remove existing database file
        if os.path.exists('shifthub.db'):
            os.remove('shifthub.db')
            print("Removed existing database file")
        
        # Create all tables
        db.create_all()
        print("Created all database tables")
        
        # Create sample events
        events_data = [
            {
                "title": "Wedding Showcase",
                "description": "Everything you need for a perfect wedding celebration. This package includes decorations, tableware, and wedding favors for up to 50 guests.",
                "image_url": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
                "location": "Mumbai",
                "date": "2023-12-15",
                "category": "wedding",
                "attendees": "30-50",
                "price": 499.99
            },
            {
                "title": "Birthday Party Collection",
                "description": "Everything you need for a memorable birthday celebration. This package includes decorations, tableware, food and drink containers, and party favors for up to 25 people.",
                "image_url": "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
                "location": "Delhi",
                "date": "2023-11-20",
                "category": "birthday",
                "attendees": "15-25",
                "price": 249.99
            },
            {
                "title": "Housewarming Package",
                "description": "Welcome friends and family to your new home with this complete housewarming package. Includes home decorations, kitchen essentials, and entertaining items.",
                "image_url": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
                "location": "Bangalore",
                "date": "2023-10-05",
                "category": "housewarming",
                "attendees": "10-20",
                "price": 199.99
            }
        ]
        
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
        
        # Create events and their items
        for event_info in events_data:
            category = event_info["category"].lower()
            
            # Create event
            event = Event(
                title=event_info["title"],
                description=event_info["description"],
                image_url=event_info["image_url"],
                location=event_info["location"],
                date=event_info["date"],
                category=event_info["category"],
                attendees=event_info["attendees"],
                price=event_info["price"],
                delivery_options=json.dumps(event_data[category]["deliveryOptions"])
            )
            db.session.add(event)
            db.session.flush()  # Flush to get the event ID
            
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
                        image_url=f"https://example.com/items/{item['id']}.jpg",
                        category=cat["id"]
                    )
                    db.session.add(new_item)
                    item_count += 1
            
            # Update event with item count
            event.items = item_count
            print(f"Created event: {event.title} with {item_count} items")
        
        # Create a test admin user
        admin = User(
            email="admin@example.com",
            first_name="Admin",
            last_name="User",
            phone="1234567890",
            terms_agreed=True,
            is_admin=True
        )
        admin.set_password("password123")
        db.session.add(admin)
        
        # Create a regular user
        user = User(
            email="user@example.com",
            first_name="Regular",
            last_name="User",
            phone="9876543210",
            terms_agreed=True
        )
        user.set_password("password123")
        db.session.add(user)
        
        # Commit all changes
        db.session.commit()
        print("Database populated with sample data!")

if __name__ == "__main__":
    recreate_database()
