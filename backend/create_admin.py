#!/usr/bin/env python3

import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import db, User
from app import app

def create_admin_user():
    """Create an admin user with the specified credentials"""
    
    with app.app_context():
        # Check if admin user already exists
        existing_admin = User.query.filter_by(email='shifthubadmin@gmail.com').first()
        
        if existing_admin:
            if existing_admin.is_admin:
                print("✅ Admin user already exists!")
                print(f"Email: {existing_admin.email}")
                print(f"Name: {existing_admin.first_name} {existing_admin.last_name}")
                print("You can login with the existing credentials.")
                return
            else:
                print("❌ User exists but is not an admin. Making them admin...")
                existing_admin.is_admin = True
                db.session.commit()
                print("✅ User is now an admin!")
                return
        
        # Create new admin user
        admin_user = User(
            email='shifthubadmin@gmail.com',
            first_name='Admin',
            last_name='User',
            phone='1234567890',
            terms_agreed=True,
            is_admin=True
        )
        
        # Set password
        admin_user.set_password('12345678')
        
        # Add to database
        db.session.add(admin_user)
        db.session.commit()
        
        print("✅ Admin user created successfully!")
        print("📧 Email: shifthubadmin@gmail.com")
        print("🔑 Password: 12345678")
        print("🎯 You can now login to the admin panel at: http://localhost:5174/admin")

if __name__ == "__main__":
    try:
        create_admin_user()
    except Exception as e:
        print(f"❌ Error creating admin user: {str(e)}")
        sys.exit(1) 