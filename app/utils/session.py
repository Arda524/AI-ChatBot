from flask import session
import uuid

class SessionManager:
    """Manage user sessions"""
    
    @staticmethod
    def get_or_create_session():
        """Get existing session or create new one"""
        if 'user_id' not in session:
            session['user_id'] = str(uuid.uuid4())
            session['created_at'] = str(uuid.uuid1())  # timestamp-based
        return session['user_id']
    
    @staticmethod
    def get_user_id():
        """Get current user ID"""
        return session.get('user_id')
    
    @staticmethod
    def clear_session():
        """Clear session data"""
        session.clear()