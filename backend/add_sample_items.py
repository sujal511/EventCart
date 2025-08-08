from app import app
from models import db, Event, EventItem

def add_sample_items():
    with app.app_context():
        # Find the Birthday Party Collection event
        birthday_event = Event.query.filter_by(title='Birthday Party Collection').first()
        
        if not birthday_event:
            print("Birthday Party Collection event not found!")
            return
        
        # Check if items already exist
        existing_items = EventItem.query.filter_by(event_id=birthday_event.id).all()
        if existing_items:
            print(f"Event already has {len(existing_items)} items:")
            for item in existing_items:
                print(f"- {item.name}: Qty {item.quantity}, ₹{item.price}")
            return
        
        # Sample items for birthday party
        sample_items = [
            {
                "name": "Balloons (Set of 50)",
                "description": "Colorful party balloons for decoration",
                "quantity": 2,
                "price": 24.99,
                "category": "decorations",
                "image_url": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300"
            },
            {
                "name": "Birthday Banner",
                "description": "Happy Birthday banner with colorful design",
                "quantity": 1,
                "price": 12.99,
                "category": "decorations",
                "image_url": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300"
            },
            {
                "name": "Disposable Plates (25 pcs)",
                "description": "Colorful disposable plates for party",
                "quantity": 2,
                "price": 9.99,
                "category": "tableware",
                "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300"
            },
            {
                "name": "Party Hats (10 pcs)",
                "description": "Fun party hats for birthday celebration",
                "quantity": 1,
                "price": 7.99,
                "category": "accessories",
                "image_url": "https://images.unsplash.com/photo-1549451371-64aa98a6f660?w=300"
            },
            {
                "name": "Birthday Cake Candles",
                "description": "Number candles and regular candles set",
                "quantity": 3,
                "price": 5.99,
                "category": "accessories",
                "image_url": "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=300"
            },
            {
                "name": "Party Games Set",
                "description": "Fun games and activities for kids",
                "quantity": 1,
                "price": 19.99,
                "category": "entertainment",
                "image_url": "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300"
            }
        ]
        
        # Add items to the event
        for item_data in sample_items:
            new_item = EventItem(
                event_id=birthday_event.id,
                name=item_data["name"],
                description=item_data["description"],
                quantity=item_data["quantity"],
                price=item_data["price"],
                image_url=item_data["image_url"],
                category=item_data["category"]
            )
            db.session.add(new_item)
        
        # Update event item count
        birthday_event.items = len(sample_items)
        
        # Commit all changes
        db.session.commit()
        print(f"Successfully added {len(sample_items)} items to '{birthday_event.title}'")
        
        # Show added items
        for item_data in sample_items:
            print(f"- {item_data['name']}: Qty {item_data['quantity']}, ₹{item_data['price']} ({item_data['category']})")

if __name__ == '__main__':
    add_sample_items() 