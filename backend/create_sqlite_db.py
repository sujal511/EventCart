import sqlite3
import json
import os

def create_database():
    # Remove existing database if it exists
    if os.path.exists('shifthub.db'):
        os.remove('shifthub.db')
        print("Removed existing database file")
    
    # Connect to SQLite database
    conn = sqlite3.connect('shifthub.db')
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        terms_agreed INTEGER DEFAULT 0,
        is_admin INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        location TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        attendees TEXT,
        items INTEGER,
        price REAL NOT NULL,
        delivery_options TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE event_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        price REAL NOT NULL DEFAULT 0.0,
        image_url TEXT,
        category TEXT,
        FOREIGN KEY (event_id) REFERENCES events (id)
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        order_number TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        total REAL NOT NULL,
        payment_method TEXT,
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        event_title TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (event_id) REFERENCES events (id)
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE carts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        price REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cart_id) REFERENCES carts (id),
        FOREIGN KEY (event_id) REFERENCES events (id)
    )
    ''')
    
    print("Created all database tables")
    
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
    for event in events_data:
        cursor.execute('''
        INSERT INTO events (title, description, image_url, location, date, category, attendees, price, delivery_options)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            event["title"], 
            event["description"], 
            event["image_url"], 
            event["location"], 
            event["date"], 
            event["category"], 
            event["attendees"], 
            event["price"],
            event["delivery_options"]
        ))
        event_id = cursor.lastrowid
        print(f"Created event: {event['title']} with ID {event_id}")
    
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
    
    # Map categories to item lists and event IDs
    category_items = {
        "wedding": (1, wedding_items),
        "birthday": (2, birthday_items),
        "housewarming": (3, housewarming_items)
    }
    
    # Insert items for each event
    for category, (event_id, items) in category_items.items():
        for item in items:
            cursor.execute('''
            INSERT INTO event_items (event_id, name, description, quantity, price, image_url, category)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                event_id,
                item["name"],
                item["description"],
                item["quantity"],
                item["price"],
                item["image_url"],
                item["category"]
            ))
        
        # Update event with item count
        cursor.execute('''
        UPDATE events SET items = ? WHERE id = ?
        ''', (len(items), event_id))
        
        print(f"Added {len(items)} items to event ID {event_id}")
    
    # Create admin user
    cursor.execute('''
    INSERT INTO users (email, password_hash, first_name, last_name, phone, terms_agreed, is_admin)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        "admin@example.com",
        "pbkdf2:sha256:150000$KKgd9zci$fc2a8d2b750a45f9b47ef912b12a56ee93e05fa8d6a3153b3facd11d7e256693",  # password123
        "Admin",
        "User",
        "1234567890",
        1,
        1
    ))
    
    # Create regular user
    cursor.execute('''
    INSERT INTO users (email, password_hash, first_name, last_name, phone, terms_agreed, is_admin)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        "user@example.com",
        "pbkdf2:sha256:150000$KKgd9zci$fc2a8d2b750a45f9b47ef912b12a56ee93e05fa8d6a3153b3facd11d7e256693",  # password123
        "Regular",
        "User",
        "9876543210",
        1,
        0
    ))
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print("Database populated with sample data!")

if __name__ == "__main__":
    create_database()
