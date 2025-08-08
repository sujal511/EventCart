from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Cart, CartItem, Event

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    """Get the current user's cart"""
    user_id = get_jwt_identity()
    
    # Find user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get or create cart
    cart = user.cart
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()
    
    # Return cart data
    return jsonify(cart.to_dict()), 200

@cart_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    """Add an item to the cart"""
    import json
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate request data
    if not data or 'event_id' not in data or 'quantity' not in data:
        return jsonify({'error': 'Event ID and quantity are required'}), 400
    
    event_id = data['event_id']
    quantity = int(data['quantity'])
    custom_price = data.get('custom_price')  # Custom price for customized packages
    customized_items = data.get('customized_items')  # Customized items data
    
    # Find event
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    # Find user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get or create cart
    cart = user.cart
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()
    
    # Use custom price if provided, otherwise use event price
    item_price = custom_price if custom_price is not None else event.price
    
    # Convert customized_items to JSON string if provided
    customized_items_json = None
    if customized_items:
        customized_items_json = json.dumps(customized_items)
    
    # Check if item already in cart
    cart_item = CartItem.query.filter_by(cart_id=cart.id, event_id=event_id).first()
    
    if cart_item:
        # Update existing item
        cart_item.quantity = quantity  # Replace quantity instead of adding
        cart_item.price = item_price  # Update price
        cart_item.customized_items = customized_items_json  # Update customized items
    else:
        # Add new item
        cart_item = CartItem(
            cart_id=cart.id,
            event_id=event_id,
            quantity=quantity,
            price=item_price,
            customized_items=customized_items_json
        )
        db.session.add(cart_item)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Item added to cart',
        'cart': cart.to_dict()
    }), 200

@cart_bp.route('/remove/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    """Remove an item from the cart"""
    user_id = get_jwt_identity()
    
    # Find user and cart
    user = User.query.get(user_id)
    if not user or not user.cart:
        return jsonify({'error': 'Cart not found'}), 404
    
    # Find cart item
    cart_item = CartItem.query.filter_by(id=item_id, cart_id=user.cart.id).first()
    if not cart_item:
        return jsonify({'error': 'Item not found in cart'}), 404
    
    # Remove item
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({
        'message': 'Item removed from cart',
        'cart': user.cart.to_dict()
    }), 200

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    """Clear the cart"""
    user_id = get_jwt_identity()
    
    # Find user and cart
    user = User.query.get(user_id)
    if not user or not user.cart:
        return jsonify({'error': 'Cart not found'}), 404
    
    # Delete all items
    CartItem.query.filter_by(cart_id=user.cart.id).delete()
    db.session.commit()
    
    return jsonify({
        'message': 'Cart cleared',
        'cart': {
            'items': [],
            'total': 0
        }
    }), 200
