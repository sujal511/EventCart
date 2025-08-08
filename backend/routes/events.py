from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Event, EventItem, User

events_bp = Blueprint('events', __name__)

@events_bp.route('', methods=['GET'])
def get_events():
    try:
        print("Getting events...")  # Debug log
        # Get query parameters for filtering
        category = request.args.get('category')
        print(f"Category filter: {category}")  # Debug log
        
        # Base query
        query = Event.query
        
        # Apply category filter if provided
        if category and category != 'all':
            query = query.filter_by(category=category)
        
        # Get all events
        events = query.all()
        print(f"Found {len(events)} events")  # Debug log
        
        # Convert events to dictionaries
        event_dicts = []
        for event in events:
            try:
                event_dict = event.to_dict()
                event_dicts.append(event_dict)
            except Exception as e:
                print(f"Error converting event {event.id} to dict: {str(e)}")
                continue
                
        print(f"Returning {len(event_dicts)} events")
        return jsonify(event_dicts), 200
        
    except Exception as e:
        import traceback
        error_msg = f"Error in get_events: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)  # Log the full error
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@events_bp.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    try:
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({
                'success': False,
                'message': 'Event not found'
            }), 404
        
        # Get event details
        event_data = event.to_dict()
        
        # Get all items for this event
        event_items = EventItem.query.filter_by(event_id=event_id).all()
        
        # Group items by category
        categories_dict = {}
        for item in event_items:
            category = item.category or 'default'
            if category not in categories_dict:
                categories_dict[category] = {
                    'id': category,
                    'name': category.replace('_', ' ').title(),
                    'items': []
                }
            categories_dict[category]['items'].append(item.to_dict())
        
        # Convert to list format expected by frontend
        event_data['categories'] = list(categories_dict.values())
        event_data['items'] = [item.to_dict() for item in event_items]
        
        # Parse delivery options if stored as JSON string
        if event_data.get('delivery_options'):
            try:
                import json
                if isinstance(event_data['delivery_options'], str):
                    event_data['delivery_options'] = json.loads(event_data['delivery_options'])
            except:
                # Fallback to default delivery options
                event_data['delivery_options'] = [
                    {'id': 'delivery', 'name': 'Local Delivery', 'price': 19.99, 'time': '2-3 days'},
                    {'id': 'express', 'name': 'Express Delivery', 'price': 34.99, 'time': '24 hours'},
                    {'id': 'pickup', 'name': 'Self Pickup', 'price': 0, 'time': 'Same day'}
                ]
        else:
            # Ensure delivery options exist
            event_data['delivery_options'] = [
                {'id': 'delivery', 'name': 'Local Delivery', 'price': 19.99, 'time': '2-3 days'},
                {'id': 'express', 'name': 'Express Delivery', 'price': 34.99, 'time': '24 hours'},
                {'id': 'pickup', 'name': 'Self Pickup', 'price': 0, 'time': 'Same day'}
            ]
        
        return jsonify(event_data), 200
        
    except Exception as e:
        import traceback
        error_msg = f"Error in get_event: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)  # Log the full error
        return jsonify({
            'success': False,
            'message': f'Error retrieving event: {str(e)}'
        }), 500

# Admin routes for event management
@events_bp.route('', methods=['POST'])
@jwt_required()
def create_event():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_admin:
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
        items=data.get('items', 0),
        price=data['price']
    )
    
    db.session.add(new_event)
    db.session.commit()
    
    # Add event items if provided
    if 'event_items' in data and isinstance(data['event_items'], list):
        for item_data in data['event_items']:
            new_item = EventItem(
                event_id=new_event.id,
                name=item_data.get('name', ''),
                description=item_data.get('description', ''),
                quantity=item_data.get('quantity', 1),
                image_url=item_data.get('image_url')
            )
            db.session.add(new_item)
        
        db.session.commit()
    
    return jsonify(new_event.to_dict()), 201

@events_bp.route('/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_admin:
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
    if 'items' in data:
        event.items = data['items']
    if 'price' in data:
        event.price = data['price']
    
    db.session.commit()
    
    # Update event items if provided
    if 'event_items' in data and isinstance(data['event_items'], list):
        # Remove existing items
        EventItem.query.filter_by(event_id=event_id).delete()
        
        # Add new items
        for item_data in data['event_items']:
            new_item = EventItem(
                event_id=event.id,
                name=item_data.get('name', ''),
                description=item_data.get('description', ''),
                quantity=item_data.get('quantity', 1),
                image_url=item_data.get('image_url')
            )
            db.session.add(new_item)
        
        db.session.commit()
    
    return jsonify(event.to_dict()), 200

@events_bp.route('/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    db.session.delete(event)
    db.session.commit()
    
    return jsonify({'message': 'Event deleted successfully'}), 200

# Event items routes
@events_bp.route('/<int:event_id>/items', methods=['GET'])
def get_event_items(event_id):
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    items = EventItem.query.filter_by(event_id=event_id).all()
    
    return jsonify([item.to_dict() for item in items]), 200

@events_bp.route('/<int:event_id>/items', methods=['POST'])
@jwt_required()
def add_event_item(event_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_admin:
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
        image_url=data.get('image_url')
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify(new_item.to_dict()), 201
