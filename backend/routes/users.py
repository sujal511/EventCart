from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Order, Address, PaymentMethod, Wishlist, Event
from sqlalchemy import desc
import requests

users_bp = Blueprint('users', __name__)

@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get the current user's profile information"""
    user_id = get_jwt_identity()
    
    # Find user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Return user data
    return jsonify(user.to_dict()), 200

@users_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_user_profile():
    """Update the current user's profile information"""
    user_id = get_jwt_identity()
    
    # Find user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update user fields
    if 'firstName' in data:
        user.first_name = data['firstName']
    if 'lastName' in data:
        user.last_name = data['lastName']
    if 'phone' in data:
        user.phone = data['phone']
    
    db.session.commit()
    
    return jsonify(user.to_dict()), 200

@users_bp.route('/me/orders', methods=['GET'])
@jwt_required()
def get_user_orders():
    """Get the current user's order history"""
    user_id = get_jwt_identity()
    
    # Find user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    # Get user orders
    orders = Order.query.filter_by(user_id=user_id).order_by(desc(Order.created_at)).all()
    
    # Format orders for response
    formatted_orders = []
    for order in orders:
        order_items = order.order_items
        items = []
        for item in order_items:
            items.append({
                'name': item.event_title,
                'quantity': item.quantity
            })
        
        formatted_orders.append({
            'id': order.order_number,
            'date': order.created_at.strftime('%Y-%m-%d'),
            'total': float(order.total_amount),
            'status': order.status.capitalize(),
            'items': items
        })
    
    return jsonify({
        'success': True,
        'data': formatted_orders,
        'message': 'Orders retrieved successfully'
    }), 200

@users_bp.route('/me/delete', methods=['DELETE'])
@jwt_required()
def delete_user_account():
    """Delete the current user's account"""
    user_id = get_jwt_identity()
    
    # Find user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    try:
        # Delete user (this will cascade delete related data)
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Account deleted successfully'
        }), 200
        
    except Exception as e:
        print(f"Delete account error: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Failed to delete account'
        }), 500

# Address endpoints
@users_bp.route('/me/addresses', methods=['GET'])
@jwt_required()
def get_user_addresses():
    """Get the current user's addresses"""
    user_id = get_jwt_identity()
    
    # Find user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    # Get addresses
    addresses = Address.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'success': True, 
        'data': [address.to_dict() for address in addresses],
        'message': 'Addresses retrieved successfully'
    }), 200

@users_bp.route('/me/addresses', methods=['POST'])
@jwt_required()
def add_user_address():
    """Add a new address for the current user"""
    user_id = get_jwt_identity()
    
    # Find user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'Invalid request data'}), 422
    
    # Validate required fields
    required_fields = ['address_line', 'city', 'state', 'postal_code']
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return jsonify({
            'success': False, 
            'message': f'Missing required fields: {", ".join(missing_fields)}'
        }), 422
    
    # Check if this is the first address (make it default)
    is_default = False
    if Address.query.filter_by(user_id=user_id).count() == 0:
        is_default = True
    elif data.get('is_default'):
        # If this address is set as default, update other addresses
        Address.query.filter_by(user_id=user_id, is_default=True).update({Address.is_default: False})
        is_default = True
    
    # Create new address
    address = Address(
        user_id=user_id,
        address_line=data['address_line'],
        city=data['city'],
        state=data['state'],
        postal_code=data['postal_code'],
        country=data.get('country', 'India'),
        address_type=data.get('address_type', 'Home'),
        is_default=is_default
    )
    
    db.session.add(address)
    db.session.commit()
    
    return jsonify({'success': True, 'data': address.to_dict(), 'message': 'Address added successfully'}), 201

@users_bp.route('/me/addresses/<int:address_id>', methods=['PUT'])
@jwt_required()
def update_user_address(address_id):
    """Update an address for the current user"""
    user_id = get_jwt_identity()
    
    # Find address
    address = Address.query.filter_by(id=address_id, user_id=user_id).first()
    if not address:
        return jsonify({'error': 'Address not found'}), 404
    
    data = request.get_json()
    
    # Update address fields
    if 'address_line' in data:
        address.address_line = data['address_line']
    if 'city' in data:
        address.city = data['city']
    if 'state' in data:
        address.state = data['state']
    if 'postal_code' in data:
        address.postal_code = data['postal_code']
    if 'country' in data:
        address.country = data['country']
    if 'address_type' in data:
        address.address_type = data['address_type']
    
    # Handle default status
    if 'is_default' in data and data['is_default'] and not address.is_default:
        # Update other addresses
        Address.query.filter_by(user_id=user_id, is_default=True).update({Address.is_default: False})
        address.is_default = True
    
    db.session.commit()
    
    return jsonify(address.to_dict()), 200

@users_bp.route('/me/addresses/<int:address_id>', methods=['DELETE'])
@jwt_required()
def delete_user_address(address_id):
    """Delete an address for the current user"""
    user_id = get_jwt_identity()
    
    # Find address
    address = Address.query.filter_by(id=address_id, user_id=user_id).first()
    if not address:
        return jsonify({'error': 'Address not found'}), 404
    
    # Check if this is the default address
    was_default = address.is_default
    
    # Delete address
    db.session.delete(address)
    
    # If this was the default address, set another address as default
    if was_default:
        new_default = Address.query.filter_by(user_id=user_id).first()
        if new_default:
            new_default.is_default = True
    
    db.session.commit()
    
    return jsonify({'message': 'Address deleted successfully'}), 200

@users_bp.route('/lookup-postal-code/<postal_code>', methods=['GET'])
def lookup_postal_code(postal_code):
    """Look up location details using postal code"""
    # This endpoint doesn't require authentication
    try:
        # Using India Post API for postal code lookup (example)
        response = requests.get(f'https://api.postalpincode.in/pincode/{postal_code}')
        data = response.json()
        
        if data[0]['Status'] == 'Success':
            post_office = data[0]['PostOffice'][0]
            return jsonify({
                'city': post_office['Block'] or post_office['District'],
                'state': post_office['State'],
                'country': 'India'
            }), 200
        else:
            return jsonify({'error': 'Postal code not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Payment method endpoints
@users_bp.route('/me/payment-methods', methods=['GET'])
@jwt_required()
def get_user_payment_methods():
    """Get the current user's payment methods"""
    user_id = get_jwt_identity()
    
    # Find user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    # Get payment methods
    payment_methods = PaymentMethod.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'success': True, 
        'data': [method.to_dict() for method in payment_methods],
        'message': 'Payment methods retrieved successfully'
    }), 200

@users_bp.route('/me/payment-methods', methods=['POST'])
@jwt_required()
def add_user_payment_method():
    """Add a new payment method for the current user"""
    user_id = get_jwt_identity()
    
    # Find user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'Invalid request data'}), 422
    
    # Validate required fields
    required_fields = ['card_type', 'last_four', 'expiry_month', 'expiry_year']
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return jsonify({
            'success': False, 
            'message': f'Missing required fields: {", ".join(missing_fields)}'
        }), 422
    
    # Check if this is the first payment method (make it default)
    is_default = False
    if PaymentMethod.query.filter_by(user_id=user_id).count() == 0:
        is_default = True
    elif data.get('is_default'):
        # If this payment method is set as default, update other payment methods
        PaymentMethod.query.filter_by(user_id=user_id, is_default=True).update({PaymentMethod.is_default: False})
        is_default = True
    
    # Create new payment method
    payment_method = PaymentMethod(
        user_id=user_id,
        card_type=data['card_type'],
        last_four=data['last_four'],
        expiry_month=data['expiry_month'],
        expiry_year=data['expiry_year'],
        is_default=is_default
    )
    
    db.session.add(payment_method)
    db.session.commit()
    
    return jsonify({
        'success': True, 
        'data': payment_method.to_dict(), 
        'message': 'Payment method added successfully'
    }), 201

@users_bp.route('/me/payment-methods/<int:payment_id>', methods=['DELETE'])
@jwt_required()
def delete_user_payment_method(payment_id):
    """Delete a payment method for the current user"""
    user_id = get_jwt_identity()
    
    # Find payment method
    payment_method = PaymentMethod.query.filter_by(id=payment_id, user_id=user_id).first()
    if not payment_method:
        return jsonify({'success': False, 'message': 'Payment method not found'}), 404
    
    # Check if this is the default payment method and if we have other methods
    if payment_method.is_default and PaymentMethod.query.filter_by(user_id=user_id).count() > 1:
        # Set another payment method as default
        alternate = PaymentMethod.query.filter(PaymentMethod.user_id == user_id, PaymentMethod.id != payment_id).first()
        if alternate:
            alternate.is_default = True
    
    # Delete payment method
    db.session.delete(payment_method)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Payment method deleted successfully'}), 200

@users_bp.route('/me/payment-methods/<int:payment_id>/set-default', methods=['PUT'])
@jwt_required()
def set_default_payment_method(payment_id):
    """Set a payment method as default for the current user"""
    user_id = get_jwt_identity()
    
    # Find payment method
    payment_method = PaymentMethod.query.filter_by(id=payment_id, user_id=user_id).first()
    if not payment_method:
        return jsonify({'success': False, 'message': 'Payment method not found'}), 404
    
    # Update all payment methods to not be default
    PaymentMethod.query.filter_by(user_id=user_id).update({PaymentMethod.is_default: False})
    
    # Set this payment method as default
    payment_method.is_default = True
    
    db.session.commit()
    
    return jsonify(payment_method.to_dict()), 200

# Wishlist endpoints  
@users_bp.route('/me/wishlist', methods=['GET'])
@jwt_required()
def get_user_wishlist():
    """Get the current user's wishlist"""
    user_id = get_jwt_identity()
    
    # Find user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    # Get wishlist items
    wishlist_items = Wishlist.query.filter_by(user_id=user_id).order_by(desc(Wishlist.added_at)).all()
    
    return jsonify({
        'success': True,
        'data': [item.to_dict() for item in wishlist_items],
        'message': 'Wishlist retrieved successfully'
    }), 200

@users_bp.route('/me/wishlist', methods=['POST'])
@jwt_required()
def add_to_wishlist():
    """Add an event to the current user's wishlist"""
    user_id = get_jwt_identity()
    
    # Find user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    data = request.get_json()
    if not data or not data.get('event_id'):
        return jsonify({'success': False, 'message': 'Event ID is required'}), 422
    
    event_id = data['event_id']
    
    # Check if event exists
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'success': False, 'message': 'Event not found'}), 404
    
    # Check if already in wishlist
    existing = Wishlist.query.filter_by(user_id=user_id, event_id=event_id).first()
    if existing:
        return jsonify({'success': False, 'message': 'Event already in wishlist'}), 409
    
    # Add to wishlist
    wishlist_item = Wishlist(user_id=user_id, event_id=event_id)
    db.session.add(wishlist_item)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'data': wishlist_item.to_dict(),
        'message': 'Event added to wishlist successfully'
    }), 201

@users_bp.route('/me/wishlist/<int:event_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(event_id):
    """Remove an event from the current user's wishlist"""
    user_id = get_jwt_identity()
    
    # Find wishlist item
    wishlist_item = Wishlist.query.filter_by(user_id=user_id, event_id=event_id).first()
    if not wishlist_item:
        return jsonify({'success': False, 'message': 'Event not found in wishlist'}), 404
    
    # Remove from wishlist
    db.session.delete(wishlist_item)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Event removed from wishlist successfully'
    }), 200
