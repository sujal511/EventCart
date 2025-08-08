from app import app
from models import db, Event

def check_events():
    with app.app_context():
        events = Event.query.all()
        print(f'Total events: {len(events)}')
        
        for event in events:
            print(f'ID: {event.id}, Title: {event.title}, Category: {event.category}')

if __name__ == "__main__":
    check_events()
