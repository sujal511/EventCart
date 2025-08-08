from models import db, User
from app import app

with app.app_context():
    admin = User.query.filter_by(email='shifthubadmin@gmail.com').first()
    if admin:
        print(f"✅ Admin user found!")
        print(f"📧 Email: {admin.email}")
        print(f"👤 Name: {admin.first_name} {admin.last_name}")
        print(f"🔐 Is Admin: {admin.is_admin}")
        print(f"📱 Phone: {admin.phone}")
    else:
        print("❌ Admin user not found!") 