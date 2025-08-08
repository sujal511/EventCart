from app import app
from models import db, User

email = "kamblesujal835@gmail.com"  # Change to the user's email

with app.app_context():
    user = User.query.filter_by(email=email).first()
    if user:
        user.is_admin = True
        db.session.commit()
        print(f"{email} is now an admin.")
    else:
        print("User not found.")