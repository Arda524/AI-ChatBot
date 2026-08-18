
import re
from typing import Tuple


class MessageValidator:
    """Validate and sanitize chat messages"""
    
    MAX_LENGTH = 500
    MIN_LENGTH = 1
    BLOCKED_PATTERNS = [
        r'<script.*?>.*?</script>',
        r'javascript:',
        r'onerror=',
        r'onload=',
    ]
    
    @classmethod
    def validate(cls, message: str) -> Tuple[bool, str]:
        """
        Validate a message
        Returns: (is_valid, cleaned_message_or_error)
        """
        if not message or not isinstance(message, str):
            return False, "Message must be a non-empty string"
        
        # Strip whitespace
        message = message.strip()
        
        # Check length
        if len(message) < cls.MIN_LENGTH:
            return False, "Message is too short"
        
        if len(message) > cls.MAX_LENGTH:
            return False, f"Message exceeds {cls.MAX_LENGTH} characters"
        
        # Check for malicious content
        for pattern in cls.BLOCKED_PATTERNS:
            if re.search(pattern, message, re.IGNORECASE):
                return False, "Message contains invalid content"
        
        # Sanitize
        cleaned = cls.sanitize(message)
        
        return True, cleaned
    
    @classmethod
    def sanitize(cls, message: str) -> str:
        """Sanitize message content"""
        # Remove HTML tags
        message = re.sub(r'<[^>]+>', '', message)
        # Remove extra whitespace
        message = ' '.join(message.split())
        return message