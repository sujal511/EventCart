from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from flask_jwt_extended.exceptions import JWTExtendedException
from models import db, User, Order, Event
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import jwt

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get dashboard statistics for the current user"""
    try:
        # Verify JWT token directly to handle expired tokens with a custom message
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        
        # Get user
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
    
        # Get user orders
        orders = Order.query.filter_by(user_id=user_id).all()
        
        # Calculate total orders
        total_orders = len(orders)
        
        # Calculate pending orders
        pending_orders = Order.query.filter_by(user_id=user_id, status='pending').count()
        
        # Calculate total spent (excluding cancelled orders)
        total_spent = sum(order.total_amount for order in orders if order.status != 'cancelled')
        
        # Get recent activity (orders and their status changes)
        recent_activity = []
        
        # Add recent orders to activity
        for order in Order.query.filter_by(user_id=user_id).order_by(desc(Order.created_at)).limit(5).all():
            action = "Order placed"
            if order.status == 'delivered':
                action = "Order delivered"
            elif order.status == 'cancelled':
                action = "Order cancelled"
            
            # Get the first order item's event title to show
            order_item = order.order_items[0] if order.order_items else None
            event_title = order_item.event_title if order_item else "Unknown Event"
            
            recent_activity.append({
                'id': order.id,
                'action': action,
                'event': event_title,
                'date': order.created_at.strftime('%d %b, %Y'),
                'amount': f"₹{order.total_amount:.2f}"
            })
        
        # Get upcoming events (events with dates in the future)
        # In a real app, you would parse the date string and compare with current date
        # For simplicity, we'll just get the most recent events
        upcoming_events_list = []
        events = Event.query.order_by(desc(Event.created_at)).limit(3).all()
        for event in events:
            upcoming_events_list.append({
                'id': event.id,
                'name': event.title,
                'date': event.date,
                'location': event.location,
                'image': event.image_url or "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800"
            })
        
        # Get recent orders
        recent_orders = []
        for order in Order.query.filter_by(user_id=user_id).order_by(desc(Order.created_at)).limit(4).all():
            recent_orders.append({
                'id': order.order_number,
                'date': order.created_at.strftime('%d %b, %Y'),
                'status': order.status.capitalize(),
                'items': len(order.order_items),
                'total': f"₹{order.total_amount:.2f}"
            })
        
        return jsonify({
            'success': True,
            'data': {
                'name': f"{user.first_name} {user.last_name}",
                'email': user.email,
                'totalOrders': total_orders,
                'pendingOrders': pending_orders,
                'totalSpent': total_spent,
                'upcomingEvents': len(upcoming_events_list),
                'recentActivity': recent_activity,
                'upcomingEventsList': upcoming_events_list,
                'recentOrders': recent_orders
            },
            'message': 'Dashboard stats retrieved successfully'
        }), 200
        
    except JWTExtendedException as e:
        return jsonify({
            'success': False,
            'message': 'Your session has expired. Please log in again.'
        }), 401
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 422
