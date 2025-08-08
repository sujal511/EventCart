#!/usr/bin/env python3

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, User

def create_test_user():
    with app.app_context():
        # Check if test user already exists
        existing_user = User.query.filter_by(email='test@example.com').first()
        
        if existing_user:
            print("Test user already exists!")
            print(f"Email: {existing_user.email}")
            print(f"Name: {existing_user.first_name} {existing_user.last_name}")
            return existing_user
        
        # Create test user
        test_user = User(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone='1234567890',
            terms_agreed=True,
            is_admin=False
        )
        
        # Set password to 'password123'
        test_user.set_password('password123')
        
        # Add to database
        db.session.add(test_user)
        db.session.commit()
        
        print("✅ Test user created successfully!")
        print("📧 Email: test@example.com")
        print("🔑 Password: password123")
        print(f"👤 Name: {test_user.first_name} {test_user.last_name}")
        
        return test_user

def create_admin_user():
    with app.app_context():
        # Check if admin user already exists
        existing_admin = User.query.filter_by(email='admin@shifthub.com').first()
        
        if existing_admin:
            print("Admin user already exists!")
            print(f"Email: {existing_admin.email}")
            print(f"Name: {existing_admin.first_name} {existing_admin.last_name}")
            return existing_admin
        
        # Create admin user
        admin_user = User(
            email='admin@shifthub.com',
            first_name='Admin',
            last_name='User',
            phone='9876543210',
            terms_agreed=True,
            is_admin=True
        )
        
        # Set password to 'admin123'
        admin_user.set_password('admin123')
        
        # Add to database
        db.session.add(admin_user)
        db.session.commit()
        
        print("✅ Admin user created successfully!")
        print("📧 Email: admin@shifthub.com")
        print("🔑 Password: admin123")
        print(f"👤 Name: {admin_user.first_name} {admin_user.last_name}")
        
        return admin_user

if __name__ == '__main__':
    print("Creating test users...")
    print("=" * 50)
    
    # Create regular test user
    create_test_user()
    print()
    
    # Create admin user
    create_admin_user()
    print()
    
    print("=" * 50)
    print("You can now test login with:")
    print("Regular User - Email: test@example.com, Password: password123")
    print("Admin User - Email: admin@shifthub.com, Password: admin123")
