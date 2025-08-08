from models import db
from app import app
from sqlalchemy import text

if __name__ == "__main__":
    with app.app_context():
        try:
            db.session.execute(text('ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS customized_items TEXT'))
            db.session.commit()
            print('Successfully added customized_items column to cart_items table')
        except Exception as e:
            print(f'Error: {e}')
            db.session.rollback() 