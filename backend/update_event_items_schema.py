import psycopg2

def update_event_items_schema():
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
        
        # Check if price column exists in event_items table
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'event_items' AND column_name = 'price'
        """)
        price_exists = cursor.fetchone() is not None
        
        # Check if category column exists in event_items table
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'event_items' AND column_name = 'category'
        """)
        category_exists = cursor.fetchone() is not None
        
        # Add price column if it doesn't exist
        if not price_exists:
            print("Adding price column to event_items table...")
            cursor.execute("""
                ALTER TABLE event_items
                ADD COLUMN price DOUBLE PRECISION NOT NULL DEFAULT 0.0
            """)
            print("Price column added successfully!")
        else:
            print("Price column already exists in event_items table.")
        
        # Add category column if it doesn't exist
        if not category_exists:
            print("Adding category column to event_items table...")
            cursor.execute("""
                ALTER TABLE event_items
                ADD COLUMN category VARCHAR(50)
            """)
            print("Category column added successfully!")
        else:
            print("Category column already exists in event_items table.")
        
        # Commit changes
        conn.commit()
        
        # Close connection
        cursor.close()
        conn.close()
        
        print("Database schema update completed successfully!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_event_items_schema()
