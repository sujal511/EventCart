from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os
import sys
import traceback
import logging
from dotenv import load_dotenv
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy import create_engine
import re

# Load environment variables
load_dotenv()

# Get database URL from environment
database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/shifthub')

# Create database if it doesn't exist
if database_url:
    # Extract database name from URL for logging
    db_name_match = re.search(r'/([^/]+)$', database_url)
    db_name = db_name_match.group(1) if db_name_match else "shifthub"
    
    try:
        engine = create_engine(database_url)
        if not database_exists(engine.url):
            print(f"Creating PostgreSQL database: {db_name}")
            create_database(engine.url)
            print(f"Database {db_name} created successfully!")
        else:
            print(f"PostgreSQL database {db_name} already exists.")
    except Exception as e:
        print(f"Error with PostgreSQL database: {str(e)}")

# Import models after database setup
from models import db
from routes.auth import auth_bp
from routes.events import events_bp
from routes.orders import orders_bp
from routes.admin import admin_bp
from routes.cart import cart_bp
from routes.dashboard import dashboard_bp
from routes.users import users_bp


app = Flask(__name__)

# Configure CORS to properly handle all origins during development
# Note: With credentials enabled, we must specify explicit origins (not wildcards)

# Enhanced CORS setup with proper preflight handling
allowed_origins = [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:5174", "http://127.0.0.1:5174",
    "http://localhost:5175", "http://127.0.0.1:5175",
    "http://localhost:5176", "http://127.0.0.1:5176",
    "http://localhost:5177", "http://127.0.0.1:5177",
    "http://localhost:5178", "http://127.0.0.1:5178",
    "http://localhost:5179", "http://127.0.0.1:5179",
    "http://localhost:5180", "http://127.0.0.1:5180",
    "http://localhost:5181", "http://127.0.0.1:5181",
    "http://localhost:3000", "http://127.0.0.1:3000"
]

# Use manual CORS handling for all routes to avoid duplicate headers
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    
    # If the request origin is in our list of allowed origins
    if origin and origin in allowed_origins:
        # Replace any existing headers to avoid duplicates
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Credentials', 'true')
        response.headers.set('Access-Control-Expose-Headers', 'Content-Type, Authorization')
    
    return response

@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        response = make_response()
        response.status_code = 200
        origin = request.headers.get('Origin')
        
        # If the request origin is in our list of allowed origins
        if origin and origin in allowed_origins:
            response.headers.set('Access-Control-Allow-Origin', origin)
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            response.headers.set('Access-Control-Allow-Credentials', 'true')
            response.headers.set('Access-Control-Expose-Headers', 'Content-Type, Authorization')
        
        return response

# Remove the Flask-CORS middleware to avoid duplicate headers
# CORS(app, resources={...}) - This is removed to prevent conflicts

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure JWT with a default secret key if not set in environment
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev_secret_key_123')  # Default key for development
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'success': False,
        'message': 'The token has expired',
        'error': 'token_expired'
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'success': False,
        'message': 'Signature verification failed',
        'error': 'invalid_token'
    }), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({
        'success': False,
        'message': 'Request does not contain an access token',
        'error': 'authorization_required'
    }), 401

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(events_bp, url_prefix='/api/events')
app.register_blueprint(orders_bp, url_prefix='/api/orders')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(cart_bp, url_prefix='/api/cart')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
app.register_blueprint(users_bp, url_prefix='/api/users')


@app.route('/')
def index():
    return {"message": "Welcome to EventCart API"}

if __name__ == '__main__':
    with app.app_context():
        # Create tables if they don't exist (don't drop existing tables)
        db.create_all()
        print("Database tables have been initialized!")
    app.run(debug=True, port=5000)
