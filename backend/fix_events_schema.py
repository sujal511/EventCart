import psycopg2
import json

def fix_events_schema():
    try:
        # Connect to PostgreSQL database
        conn = psycopg2.connect(
            dbname='shifthub',
            user='postgres',
            password='123',
            host='localhost',
            port='5432'
        )
        print("Successfully connected to PostgreSQL database!")
        
        # Create a cursor
        cursor = conn.cursor()
        
        # Check if delivery_options column exists in events table
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'events' AND column_name = 'delivery_options'
        """)
        delivery_options_exists = cursor.fetchone() is not None
        
        # Add delivery_options column if it doesn't exist
        if not delivery_options_exists:
            print("Adding delivery_options column to events table...")
            cursor.execute("""
                ALTER TABLE events
                ADD COLUMN delivery_options TEXT
            """)
            print("Delivery_options column added successfully!")
            
            # Add default delivery options to existing events
            print("Adding default delivery options to existing events...")
            cursor.execute("SELECT id, category FROM events")
            events = cursor.fetchall()
            
            for event_id, category in events:
                delivery_options = None
                
                if category and category.lower() == 'wedding':
                    delivery_options = json.dumps([
                        {"id": "delivery", "name": "Local Delivery", "price": 29.99, "time": "2-3 days"},
                        {"id": "express", "name": "Express Delivery", "price": 49.99, "time": "24 hours"},
                        {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                    ])
                elif category and category.lower() == 'birthday':
                    delivery_options = json.dumps([
                        {"id": "delivery", "name": "Local Delivery", "price": 19.99, "time": "2-3 days"},
                        {"id": "express", "name": "Express Delivery", "price": 34.99, "time": "24 hours"},
                        {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                    ])
                elif category and category.lower() == 'housewarming':
                    delivery_options = json.dumps([
                        {"id": "delivery", "name": "Local Delivery", "price": 24.99, "time": "2-3 days"},
                        {"id": "express", "name": "Express Delivery", "price": 39.99, "time": "24 hours"},
                        {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                    ])
                else:
                    delivery_options = json.dumps([
                        {"id": "delivery", "name": "Standard Delivery", "price": 19.99, "time": "2-3 days"},
                        {"id": "express", "name": "Express Delivery", "price": 39.99, "time": "24 hours"},
                        {"id": "pickup", "name": "Self Pickup", "price": 0, "time": "Same day"}
                    ])
                
                cursor.execute(
                    "UPDATE events SET delivery_options = %s WHERE id = %s",
                    (delivery_options, event_id)
                )
            
            print(f"Updated {len(events)} events with default delivery options")
        else:
            print("Delivery_options column already exists in events table.")
        
        # Commit changes
        conn.commit()
        
        # Close connection
        cursor.close()
        conn.close()
        
        print("Events schema update completed successfully!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_events_schema()
