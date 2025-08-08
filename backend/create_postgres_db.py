import json
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import database_exists, create_database
from dotenv import load_dotenv
from models import db, User, Event, EventItem
from werkzeug.security import generate_password_hash
from app import app

# Load environment variables
load_dotenv()

def create_postgres_database():
    # Get database URL from environment or use a default
    database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/shifthub')
    
    print(f"Setting up PostgreSQL database with URL: {database_url}")
    
    # Create database if it doesn't exist
    engine = create_engine(database_url)
    if not database_exists(engine.url):
        create_database(engine.url)
        print("Created new database")
    else:
        print("Database already exists")
    
    # Configure Flask app to use PostgreSQL
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    
    # Create all tables in the database
    with app.app_context():
        db.create_all()
        print("Created all database tables")
        
        # Clear existing data
        EventItem.query.delete()
        Event.query.delete()
        User.query.delete()
        db.session.commit()
        print("Cleared existing data")
        
        # Sample data
        events_data = [
            {
                "title": "Wedding Showcase",
                "description": "Everything you need for a perfect wedding celebration. This package includes decorations, tableware, and wedding favors for up to 50 guests.",
                "image_url": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
                "location": "Mumbai",
                "date": "2023-12-15",
                "category": "wedding",
                "attendees": "30-50",
                "price": 499.99,
                "delivery_options": json.dumps([
                    {"id": "delivery", "name": "Local Delivery", "price": 29.99, "time": "2-3 days"},
                    {"id": "express", "name": "Express Delivery", "price": 49.99, "time": "24 hours"},
                    {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                ])
            },
            {
                "title": "Birthday Party Collection",
                "description": "Everything you need for a memorable birthday celebration. This package includes decorations, tableware, food and drink containers, and party favors for up to 25 people.",
                "image_url": "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
                "location": "Delhi",
                "date": "2023-11-20",
                "category": "birthday",
                "attendees": "15-25",
                "price": 249.99,
                "delivery_options": json.dumps([
                    {"id": "delivery", "name": "Local Delivery", "price": 19.99, "time": "2-3 days"},
                    {"id": "express", "name": "Express Delivery", "price": 34.99, "time": "24 hours"},
                    {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                ])
            },
            {
                "title": "Housewarming Package",
                "description": "Welcome friends and family to your new home with this complete housewarming package. Includes home decorations, kitchen essentials, and entertaining items.",
                "image_url": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
                "location": "Bangalore",
                "date": "2023-10-05",
                "category": "housewarming",
                "attendees": "10-20",
                "price": 199.99,
                "delivery_options": json.dumps([
                    {"id": "delivery", "name": "Local Delivery", "price": 24.99, "time": "2-3 days"},
                    {"id": "express", "name": "Express Delivery", "price": 39.99, "time": "24 hours"},
                    {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                ])
            }
        ]
        
        # Insert events
        event_ids = {}
        for event_data in events_data:
            event = Event(
                title=event_data["title"],
                description=event_data["description"],
                image_url=event_data["image_url"],
                location=event_data["location"],
                date=event_data["date"],
                category=event_data["category"],
                attendees=event_data["attendees"],
                price=event_data["price"],
                delivery_options=event_data["delivery_options"]
            )
            db.session.add(event)
            db.session.flush()  # Flush to get the ID
            event_ids[event_data["category"]] = event.id
            print(f"Created event: {event_data['title']} with ID {event.id}")
        
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
        
        # Insert items for each event
        for category, event_id in event_ids.items():
            items = category_items.get(category, [])
            for item_data in items:
                item = EventItem(
                    event_id=event_id,
                    name=item_data["name"],
                    description=item_data["description"],
                    quantity=item_data["quantity"],
                    price=item_data["price"],
                    image_url=item_data["image_url"],
                    category=item_data["category"]
                )
                db.session.add(item)
            
            # Update event with item count
            event = Event.query.get(event_id)
            event.items = len(items)
            print(f"Added {len(items)} items to event ID {event_id}")
        
        # Create admin user
        admin_user = User(
            email="admin@example.com",
            first_name="Admin",
            last_name="User",
            phone="1234567890",
            terms_agreed=True,
            is_admin=True
        )
        admin_user.set_password("password123")
        db.session.add(admin_user)
        
        # Create regular user
        regular_user = User(
            email="user@example.com",
            first_name="Regular",
            last_name="User",
            phone="9876543210",
            terms_agreed=True,
            is_admin=False
        )
        regular_user.set_password("password123")
        db.session.add(regular_user)
        
        # Commit all changes
        db.session.commit()
        print("Database populated with sample data!")

if __name__ == "__main__":
    create_postgres_database()
