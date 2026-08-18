
from flask import session
import uuid
from datetime import datetime


class SessionManager:
    """Manage user sessions"""
    
    @staticmethod
    def get_or_create_session():
        """Get existing session or create new one"""
        if 'user_id' not in session:
            session['user_id'] = str(uuid.uuid4())
            session['created_at'] = datetime.now().isoformat()
            session['message_count'] = 0
        return session['user_id']
    
    @staticmethod
    def get_user_id():
        """Get current user ID"""
        return session.get('user_id')
    
    @staticmethod
    def increment_message_count():
        """Increment message counter"""
        session['message_count'] = session.get('message_count', 0) + 1
    
    @staticmethod
    def clear_session():
        """Clear session data"""
        session.clear()