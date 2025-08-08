#!/usr/bin/env python3

from app import app, db
from sqlalchemy import text

def add_email_verification_columns():
    """Add email verification columns to the users table"""
    with app.app_context():
        try:
            # Add the missing columns
            with db.engine.connect() as conn:
                # Add is_email_verified column
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT TRUE
                """))
                
                # Add email_verification_token column
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255)
                """))
                
                # Add email_verification_sent_at column
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP
                """))
                
                # Update all existing users to have verified status
                conn.execute(text("""
                    UPDATE users 
                    SET is_email_verified = TRUE 
                    WHERE is_email_verified IS NULL
                """))
                
                conn.commit()
                
            print("✅ Successfully added email verification columns")
            print("✅ All existing users set to verified status")
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    add_email_verification_columns() 