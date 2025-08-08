from app import app
from models import db

def update_database():
    with app.app_context():
        # This will update the database schema to include the new fields
        db.create_all()
        print("Database schema updated successfully!")

if __name__ == "__main__":
    update_database()
