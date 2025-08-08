#!/usr/bin/env python3

import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    # Database connection
    connection = psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'shifthub'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'password'),
        port=os.getenv('DB_PORT', '5432')
    )
    
    cursor = connection.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='cart_items' AND column_name='customized_items'
        """)
        
        if cursor.fetchone():
            print("Column 'customized_items' already exists in cart_items table")
        else:
            # Add the customized_items column
            cursor.execute("""
                ALTER TABLE cart_items 
                ADD COLUMN customized_items TEXT NULL
            """)
            
            connection.commit()
            print("Successfully added 'customized_items' column to cart_items table")
            
    except Exception as e:
        print(f"Error updating database: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    main() 