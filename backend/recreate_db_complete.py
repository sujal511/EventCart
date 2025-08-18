#!/usr/bin/env python3
"""
Complete database recreation script.
This will drop all tables and recreate them with the correct schema.
"""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from app import app
from models import db, Event, EventItem, User
import json

# Load environment variables
load_dotenv()

def recreate_database_complete():
    database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:1234@localhost:5432/shifthub')
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            trans = conn.begin()
            
            try:
                print("🔄 Dropping all tables...")
                
                # Drop all tables (in correct order to avoid foreign key constraints)
                tables_to_drop = [
                    'wishlist', 'addresses', 'payment_methods', 'password_resets',
                    'cart_items', 'carts', 'order_items', 'orders', 'event_items',
                    'events', 'pending_users', 'users', 'products', 'event_subcategories',
                    'event_categories', 'password_reset_tokens', 'email_verification_tokens',
                    'user_sessions', 'alembic_version'
                ]
                
                for table in tables_to_drop:
                    try:
                        conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE;"))
                        print(f"   Dropped table: {table}")
                    except Exception as e:
                        print(f"   Warning: Could not drop {table}: {e}")
                
                trans.commit()
                print("✅ All tables dropped successfully!")
                
            except Exception as e:
                trans.rollback()
                print(f"❌ Error dropping tables: {e}")
                raise
    
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        raise

def create_tables_and_data():
    """Create tables using SQLAlchemy and populate with sample data"""
    with app.app_context():
        try:
            print("🔄 Creating tables with SQLAlchemy...")
            db.create_all()
            print("✅ Tables created successfully!")
            
            # Check if events already exist
            event_count = Event.query.count()
            if event_count > 0:
                print(f"📝 {event_count} events already exist, skipping data creation")
                return
            
            print("🔄 Creating sample data...")
            
            # Sample events data
            events_data = [
                {
                    "title": "Wedding Showcase",
                    "description": "Everything you need for a perfect wedding celebration. This package includes decorations, tableware, and wedding favors for up to 50 guests.",
                    "image_url": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
                    "location": "Mumbai",
                    "date": "2024-12-15",
                    "category": "wedding",
                    "attendees": "30-50",
                    "price": 499.99,
                    "delivery_options": [
                        {"id": "delivery", "name": "Local Delivery", "price": 29.99, "time": "2-3 days"},
                        {"id": "express", "name": "Express Delivery", "price": 49.99, "time": "24 hours"},
                        {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                    ]
                },
                {
                    "title": "Birthday Party Collection",
                    "description": "Everything you need for a memorable birthday celebration. This package includes decorations, tableware, food and drink containers, and party favors for up to 25 people.",
                    "image_url": "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
                    "location": "Delhi",
                    "date": "2024-11-20",
                    "category": "birthday",
                    "attendees": "15-25",
                    "price": 249.99,
                    "delivery_options": [
                        {"id": "delivery", "name": "Local Delivery", "price": 19.99, "time": "2-3 days"},
                        {"id": "express", "name": "Express Delivery", "price": 34.99, "time": "24 hours"},
                        {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                    ]
                },
                {
                    "title": "Anniversary Celebration",
                    "description": "Celebrate your special anniversary with this romantic package. Includes elegant decorations, fine dining essentials, and memorable keepsakes.",
                    "image_url": "https://images.unsplash.com/photo-1464347744102-11db6282f854?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
                    "location": "Chennai",
                    "date": "2024-09-25",
                    "category": "anniversary",
                    "attendees": "5-10",
                    "price": 349.99,
                    "delivery_options": [
                        {"id": "delivery", "name": "Local Delivery", "price": 24.99, "time": "2-3 days"},
                        {"id": "express", "name": "Express Delivery", "price": 39.99, "time": "24 hours"},
                        {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                    ]
                },
                {
                    "title": "Baby Shower Essentials",
                    "description": "Welcome the new arrival with this complete baby shower package. Includes decorations, games, favors, and everything needed for a memorable celebration.",
                    "image_url": "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
                    "location": "Hyderabad",
                    "date": "2024-08-30",
                    "category": "baby_shower",
                    "attendees": "20-30",
                    "price": 299.99,
                    "delivery_options": [
                        {"id": "delivery", "name": "Local Delivery", "price": 19.99, "time": "2-3 days"},
                        {"id": "express", "name": "Express Delivery", "price": 34.99, "time": "24 hours"},
                        {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                    ]
                },
                {
                    "title": "Housewarming Package",
                    "description": "Welcome friends and family to your new home with this complete housewarming package. Includes home decorations, kitchen essentials, and entertaining items.",
                    "image_url": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
                    "location": "Bangalore",
                    "date": "2024-10-05",
                    "category": "housewarming",
                    "attendees": "10-20",
                    "price": 199.99,
                    "delivery_options": [
                        {"id": "delivery", "name": "Local Delivery", "price": 24.99, "time": "2-3 days"},
                        {"id": "express", "name": "Express Delivery", "price": 39.99, "time": "24 hours"},
                        {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                    ]
                }
            ]
            
            # Create events
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
                    delivery_options=json.dumps(event_data["delivery_options"]),
                    items=0
                )
                
                db.session.add(event)
                db.session.flush()  # Get the event ID
                
                print(f"   Created event: {event_data['title']} (ID: {event.id})")
                
                # Add some sample items for each event
                sample_items = [
                    {"name": f"{event_data['category'].title()} Item 1", "description": "Sample item 1", "quantity": 2, "price": 29.99, "category": "decorations"},
                    {"name": f"{event_data['category'].title()} Item 2", "description": "Sample item 2", "quantity": 1, "price": 49.99, "category": "essentials"},
                    {"name": f"{event_data['category'].title()} Item 3", "description": "Sample item 3", "quantity": 3, "price": 19.99, "category": "accessories"}
                ]
                
                for item_data in sample_items:
                    item = EventItem(
                        event_id=event.id,
                        name=item_data["name"],
                        description=item_data["description"],
                        quantity=item_data["quantity"],
                        price=item_data["price"],
                        category=item_data["category"],
                        image_url=f"https://example.com/items/{event.id}_{item_data['category']}.jpg"
                    )
                    db.session.add(item)
                
                # Update items count
                event.items = len(sample_items)
            
            # Create sample admin user
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
            
            # Create sample regular user
            regular_user = User(
                email="user@example.com",
                first_name="Test",
                last_name="User",
                phone="9876543210",
                terms_agreed=True,
                is_admin=False
            )
            regular_user.set_password("password123")
            db.session.add(regular_user)
            
            # Commit all changes
            db.session.commit()
            print(f"✅ Created {len(events_data)} events with items and 2 sample users!")
            
        except Exception as e:
            print(f"❌ Error creating tables and data: {e}")
            import traceback
            traceback.print_exc()
            raise

if __name__ == "__main__":
    print("🚀 Starting complete database recreation...")
    
    # Step 1: Drop all existing tables
    recreate_database_complete()
    
    # Step 2: Create new tables and populate data
    create_tables_and_data()
    
    print("🎉 Database recreation completed successfully!")
