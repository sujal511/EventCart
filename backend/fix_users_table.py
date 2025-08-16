#!/usr/bin/env python3
"""
Migration script to fix the users table schema.
This script will:
1. Rename 'password' column to 'password_hash'
2. Add missing 'terms_agreed' column
3. Remove deprecated address-related columns
"""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def fix_users_table():
    # Get database URL
    database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:1234@localhost:5432/shifthub')
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Start a transaction
            trans = conn.begin()
            
            try:
                print("Starting users table migration...")
                
                # 1. Rename 'password' column to 'password_hash'
                print("1. Renaming 'password' column to 'password_hash'...")
                conn.execute(text("ALTER TABLE users RENAME COLUMN password TO password_hash;"))
                
                # 2. Add 'terms_agreed' column if it doesn't exist
                print("2. Adding 'terms_agreed' column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_agreed BOOLEAN DEFAULT FALSE NOT NULL;"))
                
                # 3. Remove deprecated address columns (optional - comment out if you want to keep them)
                print("3. Removing deprecated address columns...")
                try:
                    conn.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS address;"))
                    conn.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS city;"))
                    conn.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS state;"))
                    conn.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS zip_code;"))
                    print("   Deprecated address columns removed.")
                except Exception as e:
                    print(f"   Warning: Could not remove some address columns: {e}")
                
                # Commit the transaction
                trans.commit()
                print("✅ Migration completed successfully!")
                
            except Exception as e:
                # Rollback on error
                trans.rollback()
                print(f"❌ Migration failed: {e}")
                raise
                
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        raise

if __name__ == "__main__":
    fix_users_table()
