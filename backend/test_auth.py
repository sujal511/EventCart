from app import app
from models import db, User
import json

def test_auth_routes():
    print("Testing auth routes...")
    
    # Clean up test user if it exists
    with app.app_context():
        test_user = User.query.filter_by(email="test@example.com").first()
        if test_user:
            db.session.delete(test_user)
            db.session.commit()
            print("Removed existing test user")
    
    # Test client
    client = app.test_client()
    
    # Test registration endpoint
    print("\nTesting registration endpoint...")
    registration_data = {
        "email": "test@example.com",
        "password": "password123",
        "first_name": "Test",
        "last_name": "User",
        "phone": "1234567890",
        "terms_agreed": True
    }
    
    response = client.post(
        "/api/auth/register", 
        data=json.dumps(registration_data),
        content_type="application/json"
    )
    
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.data.decode('utf-8')}")
    
    # Test login endpoint
    print("\nTesting login endpoint...")
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    response = client.post(
        "/api/auth/login", 
        data=json.dumps(login_data),
        content_type="application/json"
    )
    
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.data.decode('utf-8')}")

if __name__ == "__main__":
    test_auth_routes()
