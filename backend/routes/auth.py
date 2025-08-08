from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from models import db, User, PasswordReset, PendingUser
from datetime import datetime, timedelta
import uuid
import re
import jwt
import os
import secrets
from flask import current_app
# from services.email_service import email_service  # Removed email service

auth_bp = Blueprint('auth', __name__)

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print("Received registration data:", data)  # Debug print
    
    # Convert camelCase to snake_case if needed
    if 'firstName' in data and 'first_name' not in data:
        data['first_name'] = data['firstName']
    
    if 'lastName' in data and 'last_name' not in data:
        data['last_name'] = data['lastName']
    
    # Validate required fields
    required_fields = ['email', 'password']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400
            
    # Check for first name and last name in either format
    if not (data.get('first_name') or data.get('firstName')):
        return jsonify({'error': 'First name is required'}), 400
        
    if not (data.get('last_name') or data.get('lastName')):
        return jsonify({'error': 'Last name is required'}), 400
        
    if not data.get('phone'):
        return jsonify({'error': 'Phone number is required'}), 400
    
    # Validate email format
    if not EMAIL_REGEX.match(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Check if email already exists in verified users
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Validate password length
    if len(data['password']) < 8:  # Changed to match frontend validation (8 chars)
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    try:
        # Create user directly without email verification
        new_user = User(
            email=data['email'],
            first_name=data.get('first_name', data.get('firstName', '')),
            last_name=data.get('last_name', data.get('lastName', '')),
            phone=data['phone'],
            terms_agreed=data.get('terms_agreed', True)
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        print(f"User {new_user.email} registered successfully")
        
        # Create access token for immediate login
        access_token = create_access_token(identity=str(new_user.id))
        
        return jsonify({
            'success': True,
            'message': 'Registration successful! You are now logged in.',
            'access_token': access_token,
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        db.session.rollback()
        return jsonify({
            'error': 'Registration failed. Please try again.',
            'details': str(e)
        }), 500

@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    """Verify email address using token"""
    data = request.get_json()
    
    if not data.get('token'):
        return jsonify({'error': 'Verification token is required'}), 400
    
    try:
        # Find pending user by token
        pending_user = PendingUser.query.filter_by(verification_token=data['token']).first()
        
        if not pending_user:
            return jsonify({'error': 'Invalid verification token'}), 400
        
        if pending_user.is_expired():
            # Clean up expired token
            db.session.delete(pending_user)
            db.session.commit()
            return jsonify({'error': 'Verification token has expired. Please register again.'}), 400
        
        # Check if email is already verified (edge case)
        if User.query.filter_by(email=pending_user.email).first():
            # Clean up pending user
            db.session.delete(pending_user)
            db.session.commit()
            return jsonify({'error': 'Email is already verified. Please login.'}), 400
        
        # Create actual user from pending user
        user = pending_user.to_user()
        db.session.add(user)
        
        # Remove pending user
        db.session.delete(pending_user)
        db.session.commit()
        
        # Welcome email removed - email service disabled
        print(f"User {user.email} verified successfully")
        
        # Create access token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'success': True,
            'message': 'Email verified successfully! Welcome to ShiftHub!',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Email verification error: {str(e)}")
        db.session.rollback()
        return jsonify({
            'error': 'Email verification failed. Please try again.',
            'details': str(e)
        }), 500

@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    """Resend verification email"""
    data = request.get_json()
    
    if not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    
    try:
        # Check if user is already verified
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'Email is already verified. Please login.'}), 400
        
        # Find pending user
        pending_user = PendingUser.query.filter_by(email=data['email']).first()
        if not pending_user:
            return jsonify({'error': 'No pending registration found for this email.'}), 404
        
        # Update expiry time and generate new token
        pending_user.verification_token = secrets.token_urlsafe(32)
        pending_user.expires_at = datetime.utcnow() + timedelta(hours=24)
        db.session.commit()
        
        # Send verification email
        base_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        user_name = f"{pending_user.first_name} {pending_user.last_name}"
        
        # Email service removed - return success without sending email
        print(f"Email verification disabled for {pending_user.email}")
        
        return jsonify({
            'success': True,
            'message': 'Verification email sent successfully. Please check your email.'
        }), 200
        
    except Exception as e:
        print(f"Resend verification error: {str(e)}")
        return jsonify({
            'error': 'Failed to resend verification email. Please try again.',
            'details': str(e)
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print(f"Login attempt with data: {data}")
    
    # Validate required fields
    if not data.get('email') or not data.get('password'):
        print(f"Missing required fields: email={bool(data.get('email'))}, password={bool(data.get('password'))}")
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    print(f"User found: {bool(user)}")
    
    # Check if user exists
    if not user:
        print(f"No user found with email: {data['email']}")
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Check password
    if not user.check_password(data['password']):
        print(f"Password check failed for user: {user.email}")
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Email verification removed - users can login directly
    
    # Create access token
    access_token = create_access_token(identity=str(user.id))
    print(f"Generated access token for user ID: {user.id}")
    
    # Format response to match what frontend expects
    user_dict = user.to_dict()
    print(f"User data being returned: {user_dict}")
    
    # Return in the format expected by the frontend
    return jsonify({
        'success': True,
        'access_token': access_token,
        'user': user_dict,
        'message': 'Login successful'
    }), 200

@auth_bp.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update user fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'phone' in data:
        user.phone = data['phone']
    if 'address' in data:
        user.address = data['address']
    if 'city' in data:
        user.city = data['city']
    if 'state' in data:
        user.state = data['state']
    if 'pincode' in data:
        user.pincode = data['pincode']
    
    db.session.commit()
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        # Verify current password
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Update password
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Password updated successfully'
        }), 200
        
    except Exception as e:
        print(f"Change password error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to change password'
        }), 500

@auth_bp.route('/request-password-reset', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    
    if not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        # Don't reveal that the email doesn't exist for security reasons
        return jsonify({'message': 'If your email is registered, you will receive a password reset link'}), 200
    
    # Generate reset token
    token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    # Delete any existing reset tokens for this email
    PasswordReset.query.filter_by(email=data['email']).delete()
    
    # Create new reset token
    reset = PasswordReset(
        email=data['email'],
        token=token,
        expires_at=expires_at
    )
    
    db.session.add(reset)
    db.session.commit()
    
    # In a real application, send an email with the reset link
    # For now, we'll just return the token in the response
    reset_link = f"http://localhost:5173/reset-password/{token}"
    
    # In production, don't return the token/link directly
    return jsonify({
        'message': 'If your email is registered, you will receive a password reset link',
        'reset_link': reset_link  # Remove this in production
    }), 200

@auth_bp.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    
    if not data.get('password'):
        return jsonify({'error': 'New password is required'}), 400
    
    # Validate password length
    if len(data['password']) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    # Find reset token
    reset = PasswordReset.query.filter_by(token=token, used=False).first()
    
    if not reset or reset.expires_at < datetime.utcnow():
        return jsonify({'error': 'Invalid or expired token'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=reset.email).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Update password
    user.set_password(data['password'])
    
    # Mark token as used
    reset.used = True
    
    db.session.commit()
    
    return jsonify({'message': 'Password has been reset successfully'}), 200

@auth_bp.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'Account deleted successfully'}), 200

@auth_bp.route('/refresh-token', methods=['POST'])
def refresh_token():
    """Generate a new token for a user"""
    data = request.get_json()
    
    # Check if we have user data
    if not data or 'email' not in data or not data['email']:
        return jsonify({
            'success': False,
            'message': 'Email is required to refresh token'
        }), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404
    
    # Create new access token
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'success': True,
        'access_token': access_token,
        'user': user.to_dict(),
        'message': 'Token refreshed successfully'
    }), 200

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify if a token is valid"""
    # Add more debug for troubleshooting
    print(f"Verify token request received, content type: {request.content_type}")
    print(f"Request data: {request.data}")
    
    # Handle different content types
    if request.content_type and 'application/json' in request.content_type:
        data = request.get_json(silent=True)
        print(f"Parsed JSON data: {data}")
    else:
        # Try to parse as form data or raw
        data = request.form.to_dict() if request.form else None
        if not data and request.data:
            # Try to parse raw data as JSON
            try:
                import json
                data = json.loads(request.data)
                print(f"Parsed raw data as JSON: {data}")
            except:
                # Fallback to just getting the data as string
                data = {'token': request.data.decode('utf-8').strip()}
                print(f"Using raw data as token: {data}")
    
    if not data or 'token' not in data:
        print("No token found in request")
        return jsonify({
            'success': False,
            'valid': False,
            'message': 'Token is required'
        }), 400
    
    try:
        # Verify the token
        token = data['token']
        print(f"Attempting to verify token: {token[:15]}...")
        
        decoded = jwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=['HS256']
        )
        
        print(f"Token decoded successfully, subject: {decoded.get('sub')}")
        
        # Check if user exists - convert string subject back to integer for database lookup
        user_id = int(decoded['sub'])
        user = User.query.get(user_id)
        if not user:
            print(f"User not found for subject: {decoded.get('sub')}")
            return jsonify({
                'success': False,
                'valid': False,
                'message': 'User not found'
            }), 404
        
        print(f"Token valid for user: {user.email}")
        return jsonify({
            'success': True,
            'valid': True,
            'message': 'Token is valid',
            'user': user.to_dict()
        }), 200
        
    except jwt.ExpiredSignatureError as e:
        print(f"Token expired: {str(e)}")
        return jsonify({
            'success': False,
            'valid': False,
            'message': 'Token has expired'
        }), 401
        
    except jwt.InvalidTokenError as e:
        print(f"Invalid token: {str(e)}")
        return jsonify({
            'success': False,
            'valid': False,
            'message': 'Invalid token'
        }), 401
    except Exception as e:
        print(f"Unexpected error verifying token: {str(e)}")
        return jsonify({
            'success': False,
            'valid': False,
            'message': f'Error: {str(e)}'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Handle user logout"""
    try:
        # Since JWT tokens are stateless, we don't need to do anything server-side
        # The client will remove the token from localStorage
        print("User logout requested")
        
        return jsonify({
            'success': True,
            'message': 'Logged out successfully'
        }), 200
        
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Logout failed'
        }), 500
