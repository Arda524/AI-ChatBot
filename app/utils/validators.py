import re

class MessageValidator:
    """Validate chat messages"""
    
    MAX_LENGTH = 500
    MIN_LENGTH = 1
    
    @classmethod
    def validate(cls, message):
        """Validate a message"""
        if not message or not isinstance(message, str):
            return False, "Message must be a non-empty string"
        
        message = message.strip()
        
        if len(message) < cls.MIN_LENGTH:
            return False, "Message is too short"
        
        if len(message) > cls.MAX_LENGTH:
            return False, f"Message exceeds {cls.MAX_LENGTH} characters"
        
        # Check for malicious content (basic)
        if re.search(r'<script|javascript:', message, re.IGNORECASE):
            return False, "Message contains invalid content"
        
        return True, message
    
    @classmethod
    def sanitize(cls, message):
        """Basic sanitization"""
        # Remove HTML tags
        message = re.sub(r'<[^>]+>', '', message)
        # Remove extra whitespace
        message = ' '.join(message.split())
        return message