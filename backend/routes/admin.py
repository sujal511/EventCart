from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Event, EventItem, Order, OrderItem
from datetime import datetime, timedelta
from sqlalchemy import func, extract

admin_bp = Blueprint('admin', __name__)

# Helper function to check if user is admin
def is_admin(user_id):
    user = User.query.get(user_id)
    return user and user.is_admin

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Get counts for dashboard
    totalUsers = User.query.filter_by(is_admin=False).count()
    totalEvents = Event.query.count()
    totalOrders = Order.query.count()
    
    # Calculate total revenue
    totalRevenue = db.session.query(db.func.sum(Order.total_amount)).filter(
        Order.status != 'cancelled'
    ).scalar() or 0
    
    # Get recent orders with user information
    recent_orders_query = db.session.query(Order, User).join(User, Order.user_id == User.id).order_by(Order.created_at.desc()).limit(5).all()
    recent_orders = []
    for order, user in recent_orders_query:
        order_dict = order.to_dict()
        order_dict['user'] = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }
        recent_orders.append(order_dict)
    
    # Get order status distribution
    ordersByStatus = {}
    status_counts = db.session.query(Order.status, db.func.count(Order.id)).group_by(Order.status).all()
    for status, count in status_counts:
        ordersByStatus[status] = count
    
    # Get top events by order count
    top_events_query = db.session.query(
        Event,
        db.func.count(OrderItem.id).label('order_count')
    ).outerjoin(OrderItem, Event.id == OrderItem.event_id).group_by(Event.id).order_by(db.func.count(OrderItem.id).desc()).limit(10).all()
    
    topEvents = []
    for event, order_count in top_events_query:
        event_dict = event.to_dict()
        event_dict['order_count'] = order_count
        topEvents.append(event_dict)
    
    return jsonify({
        'totalUsers': totalUsers,
        'totalEvents': totalEvents,
        'totalOrders': totalOrders,
        'totalRevenue': totalRevenue,
        'recentOrders': recent_orders,
        'ordersByStatus': ordersByStatus,
        'topEvents': topEvents
    }), 200

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Get all non-admin users
    users = User.query.filter_by(is_admin=False).all()
    
    return jsonify([user.to_dict() for user in users]), 200

@admin_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_all_orders():
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Get query parameters
    status = request.args.get('status')
    
    # Base query with user information
    query = db.session.query(Order, User).join(User, Order.user_id == User.id)
    
    # Apply status filter if provided
    if status:
        query = query.filter(Order.status == status)
    
    # Get all orders
    orders_with_users = query.order_by(Order.created_at.desc()).all()
    
    # Format response
    orders = []
    for order, user in orders_with_users:
        order_dict = order.to_dict()
        order_dict['user'] = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }
        orders.append(order_dict)
    
    return jsonify(orders), 200

@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if not data.get('status'):
        return jsonify({'error': 'Status is required'}), 400
    
    # Validate status
    valid_statuses = ['pending', 'confirmed', 'cancelled', 'delivered']
    if data['status'] not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400
    
    # Get the order
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    # Update order status
    order.status = data['status']
    db.session.commit()
    
    return jsonify(order.to_dict()), 200

@admin_bp.route('/create-admin', methods=['POST'])
@jwt_required()
def create_admin():
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create new admin user
    new_admin = User(
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        is_admin=True
    )
    new_admin.set_password(data['password'])
    
    db.session.add(new_admin)
    db.session.commit()
    
    return jsonify(new_admin.to_dict()), 201

@admin_bp.route('/events', methods=['POST'])
@jwt_required()
def create_event():
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'description', 'location', 'date', 'category', 'price']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Create new event
    new_event = Event(
        title=data['title'],
        description=data['description'],
        image_url=data.get('image_url'),
        location=data['location'],
        date=data['date'],
        category=data['category'],
        attendees=data.get('attendees'),
        price=float(data['price']),
        delivery_options=data.get('delivery_options')
    )
    
    db.session.add(new_event)
    db.session.commit()
    
    return jsonify(new_event.to_dict()), 201

@admin_bp.route('/events/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    data = request.get_json()
    
    # Update event fields
    if 'title' in data:
        event.title = data['title']
    if 'description' in data:
        event.description = data['description']
    if 'image_url' in data:
        event.image_url = data['image_url']
    if 'location' in data:
        event.location = data['location']
    if 'date' in data:
        event.date = data['date']
    if 'category' in data:
        event.category = data['category']
    if 'attendees' in data:
        event.attendees = data['attendees']
    if 'price' in data:
        event.price = float(data['price'])
    if 'delivery_options' in data:
        event.delivery_options = data['delivery_options']
    
    event.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(event.to_dict()), 200

@admin_bp.route('/events/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    # Check if event has any orders
    order_count = db.session.query(OrderItem).filter_by(event_id=event_id).count()
    
    if order_count > 0:
        return jsonify({'error': 'Cannot delete event with existing orders'}), 400
    
    db.session.delete(event)
    db.session.commit()
    
    return jsonify({'message': 'Event deleted successfully'}), 200

@admin_bp.route('/events/<int:event_id>/items', methods=['GET'])
@jwt_required()
def get_event_items(event_id):
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    items = EventItem.query.filter_by(event_id=event_id).all()
    
    return jsonify([item.to_dict() for item in items]), 200

@admin_bp.route('/events/<int:event_id>/items', methods=['POST'])
@jwt_required()
def add_event_item(event_id):
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    data = request.get_json()
    
    # Validate required fields
    if not data.get('name'):
        return jsonify({'error': 'Item name is required'}), 400
    
    # Create new item
    new_item = EventItem(
        event_id=event_id,
        name=data['name'],
        description=data.get('description', ''),
        quantity=data.get('quantity', 1),
        price=data.get('price', 0.0),
        image_url=data.get('image_url'),
        category=data.get('category')
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify(new_item.to_dict()), 201

@admin_bp.route('/events/<int:event_id>/items/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_event_item(event_id, item_id):
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    item = EventItem.query.filter_by(id=item_id, event_id=event_id).first()
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    data = request.get_json()
    
    # Update item fields
    if 'name' in data:
        item.name = data['name']
    if 'description' in data:
        item.description = data['description']
    if 'quantity' in data:
        item.quantity = data['quantity']
    if 'price' in data:
        item.price = data['price']
    if 'image_url' in data:
        item.image_url = data['image_url']
    if 'category' in data:
        item.category = data['category']
    
    db.session.commit()
    
    return jsonify(item.to_dict()), 200

@admin_bp.route('/events/<int:event_id>/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_event_item(event_id, item_id):
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    item = EventItem.query.filter_by(id=item_id, event_id=event_id).first()
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({'message': 'Item deleted successfully'}), 200

@admin_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Get time range parameter (default to 30 days)
    days = int(request.args.get('days', 30))
    start_date = datetime.now() - timedelta(days=days)
    
    # Revenue analytics
    total_revenue = db.session.query(func.sum(Order.total_amount)).filter(
        Order.status != 'cancelled'
    ).scalar() or 0
    
    # Revenue from the past period for comparison
    previous_period_start = start_date - timedelta(days=days)
    previous_revenue = db.session.query(func.sum(Order.total_amount)).filter(
        Order.status != 'cancelled',
        Order.created_at >= previous_period_start,
        Order.created_at < start_date
    ).scalar() or 0
    
    current_revenue = db.session.query(func.sum(Order.total_amount)).filter(
        Order.status != 'cancelled',
        Order.created_at >= start_date
    ).scalar() or 0
    
    # Calculate revenue growth
    revenue_growth = 0
    if previous_revenue > 0:
        revenue_growth = ((current_revenue - previous_revenue) / previous_revenue) * 100
    
    # Monthly revenue data (last 6 months)
    monthly_revenue = []
    for i in range(6):
        month_start = datetime.now().replace(day=1) - timedelta(days=30 * i)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_revenue = db.session.query(func.sum(Order.total_amount)).filter(
            Order.status != 'cancelled',
            Order.created_at >= month_start,
            Order.created_at <= month_end
        ).scalar() or 0
        
        monthly_revenue.insert(0, {
            'month': month_start.strftime('%b'),
            'revenue': round(month_revenue, 2)
        })
    
    # User growth analytics
    total_users = User.query.filter_by(is_admin=False).count()
    users_current_period = User.query.filter(
        User.is_admin == False,
        User.created_at >= start_date
    ).count()
    
    users_previous_period = User.query.filter(
        User.is_admin == False,
        User.created_at >= previous_period_start,
        User.created_at < start_date
    ).count()
    
    # Calculate user growth
    user_growth_rate = 0
    if users_previous_period > 0:
        user_growth_rate = ((users_current_period - users_previous_period) / users_previous_period) * 100
    
    # Monthly user growth (last 6 months)
    user_growth_data = []
    for i in range(6):
        month_start = datetime.now().replace(day=1) - timedelta(days=30 * i)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_users = User.query.filter(
            User.is_admin == False,
            User.created_at >= month_start,
            User.created_at <= month_end
        ).count()
        
        user_growth_data.insert(0, {
            'month': month_start.strftime('%b'),
            'users': month_users
        })
    
    # Order analytics
    total_orders = Order.query.count()
    orders_current_period = Order.query.filter(Order.created_at >= start_date).count()
    orders_previous_period = Order.query.filter(
        Order.created_at >= previous_period_start,
        Order.created_at < start_date
    ).count()
    
    # Calculate order growth
    order_growth_rate = 0
    if orders_previous_period > 0:
        order_growth_rate = ((orders_current_period - orders_previous_period) / orders_previous_period) * 100
    
    # Order status distribution
    order_status_data = db.session.query(
        Order.status, 
        func.count(Order.id)
    ).group_by(Order.status).all()
    
    order_stats = {}
    for status, count in order_status_data:
        order_stats[status] = count
    
    # Category performance
    category_performance = db.session.query(
        Event.category,
        func.count(OrderItem.id).label('orders'),
        func.sum(OrderItem.price * OrderItem.quantity).label('revenue')
    ).join(OrderItem, Event.id == OrderItem.event_id)\
     .join(Order, OrderItem.order_id == Order.id)\
     .filter(Order.status != 'cancelled')\
     .group_by(Event.category)\
     .all()
    
    category_stats = {}
    for category, orders, revenue in category_performance:
        category_stats[category] = {
            'orders': orders or 0,
            'revenue': float(revenue or 0)
        }
    
    # Top performing events
    top_events = db.session.query(
        Event,
        func.count(OrderItem.id).label('order_count'),
        func.sum(OrderItem.price * OrderItem.quantity).label('revenue')
    ).outerjoin(OrderItem, Event.id == OrderItem.event_id)\
     .outerjoin(Order, OrderItem.order_id == Order.id)\
     .filter(db.or_(Order.status != 'cancelled', Order.status.is_(None)))\
     .group_by(Event.id)\
     .order_by(func.count(OrderItem.id).desc())\
     .limit(10).all()
    
    top_events_data = []
    for event, order_count, revenue in top_events:
        event_dict = event.to_dict()
        event_dict['order_count'] = order_count or 0
        event_dict['revenue'] = float(revenue or 0)
        top_events_data.append(event_dict)
    
    return jsonify({
        'totalRevenue': round(total_revenue, 2),
        'revenueGrowth': round(revenue_growth, 1),
        'monthlyRevenue': monthly_revenue,
        
        'totalUsers': total_users,
        'userGrowthRate': round(user_growth_rate, 1),
        'userGrowth': user_growth_data,
        
        'totalOrders': total_orders,
        'orderGrowthRate': round(order_growth_rate, 1),
        'orderStats': order_stats,
        
        'categoryStats': category_stats,
        'topEvents': top_events_data
    }), 200
