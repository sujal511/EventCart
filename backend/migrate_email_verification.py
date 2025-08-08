#!/usr/bin/env python3
"""
Migration script to add email verification functionality
"""

import sqlite3
import os
from datetime import datetime

def migrate_database():
    """Add email verification fields and create pending_users table"""
    
    # Database path
    db_path = 'shifthub.db'
    
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found!")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Starting email verification migration...")
        
        # 1. Add email verification fields to users table
        print("Adding email verification fields to users table...")
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'is_email_verified' not in columns:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN is_email_verified BOOLEAN DEFAULT 0 NOT NULL
            """)
            print("✓ Added is_email_verified column")
        else:
            print("✓ is_email_verified column already exists")
        
        if 'email_verification_token' not in columns:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN email_verification_token VARCHAR(255)
            """)
            print("✓ Added email_verification_token column")
        else:
            print("✓ email_verification_token column already exists")
        
        if 'email_verification_sent_at' not in columns:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN email_verification_sent_at DATETIME
            """)
            print("✓ Added email_verification_sent_at column")
        else:
            print("✓ email_verification_sent_at column already exists")
        
        # 2. Create pending_users table
        print("Creating pending_users table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS pending_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email VARCHAR(120) UNIQUE NOT NULL,
                password_hash VARCHAR(256) NOT NULL,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                terms_agreed BOOLEAN DEFAULT 0 NOT NULL,
                verification_token VARCHAR(255) UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL
            )
        """)
        print("✓ Created pending_users table")
        
        # 3. Update existing users to be verified (for backward compatibility)
        print("Updating existing users to be verified...")
        cursor.execute("""
            UPDATE users 
            SET is_email_verified = 1 
            WHERE is_email_verified = 0
        """)
        updated_count = cursor.rowcount
        print(f"✓ Updated {updated_count} existing users to verified status")
        
        # 4. Create indexes for better performance
        print("Creating indexes...")
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_pending_users_email 
            ON pending_users(email)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_pending_users_token 
            ON pending_users(verification_token)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_pending_users_expires 
            ON pending_users(expires_at)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_users_verification_token 
            ON users(email_verification_token)
        """)
        print("✓ Created indexes")
        
        # Commit changes
        conn.commit()
        print("\n✅ Email verification migration completed successfully!")
        
        # Show table structure
        print("\n📋 Updated users table structure:")
        cursor.execute("PRAGMA table_info(users)")
        for column in cursor.fetchall():
            print(f"  - {column[1]} ({column[2]})")
        
        print("\n📋 New pending_users table structure:")
        cursor.execute("PRAGMA table_info(pending_users)")
        for column in cursor.fetchall():
            print(f"  - {column[1]} ({column[2]})")
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        conn.rollback()
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        conn.rollback()
        return False
    finally:
        if conn:
            conn.close()

def verify_migration():
    """Verify that the migration was successful"""
    try:
        conn = sqlite3.connect('shifthub.db')
        cursor = conn.cursor()
        
        print("\n🔍 Verifying migration...")
        
        # Check users table
        cursor.execute("PRAGMA table_info(users)")
        user_columns = [column[1] for column in cursor.fetchall()]
        
        required_user_columns = ['is_email_verified', 'email_verification_token', 'email_verification_sent_at']
        for col in required_user_columns:
            if col in user_columns:
                print(f"✓ users.{col} exists")
            else:
                print(f"❌ users.{col} missing")
                return False
        
        # Check pending_users table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='pending_users'")
        if cursor.fetchone():
            print("✓ pending_users table exists")
        else:
            print("❌ pending_users table missing")
            return False
        
        # Check indexes
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'")
        indexes = [row[0] for row in cursor.fetchall()]
        expected_indexes = [
            'idx_pending_users_email',
            'idx_pending_users_token', 
            'idx_pending_users_expires',
            'idx_users_verification_token'
        ]
        
        for idx in expected_indexes:
            if idx in indexes:
                print(f"✓ Index {idx} exists")
            else:
                print(f"⚠️  Index {idx} missing (not critical)")
        
        print("\n✅ Migration verification completed!")
        return True
        
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🚀 Starting email verification migration...")
    print("=" * 50)
    
    success = migrate_database()
    
    if success:
        verify_migration()
        print("\n" + "=" * 50)
        print("🎉 Migration completed successfully!")
        print("\nNext steps:")
        print("1. Set up email configuration in .env file:")
        print("   - SMTP_SERVER=smtp.gmail.com")
        print("   - SMTP_PORT=587")
        print("   - EMAIL_ADDRESS=your-email@gmail.com")
        print("   - EMAIL_PASSWORD=your-app-password")
        print("   - SENDER_NAME=ShiftHub")
        print("   - FRONTEND_URL=http://localhost:3000")
        print("\n2. Install required Python packages:")
        print("   pip install jinja2")
        print("\n3. Restart your Flask application")
    else:
        print("\n❌ Migration failed!")
        exit(1) 