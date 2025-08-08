from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, OrderItem, User, Event

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_user_orders():
    user_id = get_jwt_identity()
    
    # Get all orders for the user
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    
    return jsonify([order.to_dict() for order in orders]), 200

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    user_id = get_jwt_identity()
    
    # Get the order
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    return jsonify(order.to_dict()), 200

@orders_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['items', 'shipping_address', 'shipping_city', 'shipping_state', 
                      'shipping_pincode', 'payment_method', 'total_amount']
    
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Validate items
    if not isinstance(data['items'], list) or len(data['items']) == 0:
        return jsonify({'error': 'At least one item is required'}), 400
    
    # Create new order
    new_order = Order(
        user_id=user_id,
        total_amount=data['total_amount'],
        shipping_address=data['shipping_address'],
        shipping_city=data['shipping_city'],
        shipping_state=data['shipping_state'],
        shipping_pincode=data['shipping_pincode'],
        payment_method=data['payment_method']
    )
    
    db.session.add(new_order)
    db.session.flush()  # Get the order ID without committing
    
    # Add order items
    for item_data in data['items']:
        # Validate item data
        if not item_data.get('event_id') or not item_data.get('quantity'):
            continue
        
        # Get event details
        event = Event.query.get(item_data['event_id'])
        if not event:
            continue
        
        # Create order item
        new_item = OrderItem(
            order_id=new_order.id,
            event_id=event.id,
            event_title=event.title,
            price=event.price,
            quantity=item_data['quantity']
        )
        
        db.session.add(new_item)
    
    db.session.commit()
    
    return jsonify(new_order.to_dict()), 201

@orders_bp.route('/<int:order_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_order(order_id):
    user_id = get_jwt_identity()
    
    # Get the order
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    # Check if order can be cancelled
    if order.status not in ['pending', 'confirmed']:
        return jsonify({'error': 'Order cannot be cancelled'}), 400
    
    # Update order status
    order.status = 'cancelled'
    db.session.commit()
    
    return jsonify(order.to_dict()), 200
