from app import app, db
from models import User, Event, EventItem, Order, OrderItem, PasswordReset, Cart, CartItem, PaymentMethod, Address
import os
from sqlalchemy import inspect

# Create database tables
with app.app_context():
    print("Migrating database...")
    
    # Check if tables already exist
    inspector = inspect(db.engine)
    existing_tables = inspector.get_table_names()
    
    print(f"Existing tables: {existing_tables}")
    
    # Create all tables that don't exist
    db.create_all()
    print("Created all missing tables")
    
    # Note: This will not remove columns from existing tables
    # For a production environment, you would need to use Alembic or a similar
    # migration tool to handle schema changes safely
    
    print("Migration complete!")
    print("Note: Address fields in the User table are now deprecated and will be ignored.")
    print("User data should now use the new Address model instead.")
