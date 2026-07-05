class FAQService:
    """Handle FAQ detection and responses"""
    
    # FAQ Categories with keywords and responses
    FAQ_DATA = {
        'greeting': {
            'keywords': ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon'],
            'response': "Hello! How can I assist you today?",
            'priority': 1
        },
        'farewell': {
            'keywords': ['bye', 'goodbye', 'see you', 'later', 'take care'],
            'response': "Goodbye! Feel free to reach out if you need anything else.",
            'priority': 1
        },
        'help': {
            'keywords': ['help', 'support', 'assist', 'how to', 'guide'],
            'response': "I'm here to help! You can ask me questions about our services, get support, or just chat.",
            'priority': 2
        },
        'pricing': {
            'keywords': ['price', 'cost', 'pricing', 'plan', 'subscription', 'charge', 'fee'],
            'response': "We offer various pricing plans starting from $9.99/month. Would you like more details?",
            'priority': 1
        },
        'features': {
            'keywords': ['feature', 'capability', 'what can you do', 'function', 'ability'],
            'response': "I can help with customer support, answer FAQs, provide information, and assist with general inquiries.",
            'priority': 2
        },
        'contact': {
            'keywords': ['contact', 'email', 'phone', 'reach', 'call', 'message'],
            'response': "You can reach our team at support@example.com or call us at 1-800-555-0123.",
            'priority': 1
        },
        'hours': {
            'keywords': ['hours', 'open', 'available', 'time', 'schedule', 'working'],
            'response': "Our support team is available 24/7. Current response time is under 5 minutes.",
            'priority': 2
        }
    }
    
    @classmethod
    def detect_intent(cls, message):
        """Detect FAQ intent from message"""
        message_lower = message.lower()
        matches = []
        
        for intent, data in cls.FAQ_DATA.items():
            for keyword in data['keywords']:
                if keyword in message_lower:
                    matches.append((intent, data['priority']))
                    break
        
        if matches:
            # Return highest priority match
            matches.sort(key=lambda x: x[1])
            return matches[0][0]
        
        return None
    
    @classmethod
    def get_response(cls, intent):
        """Get FAQ response for detected intent"""
        if intent and intent in cls.FAQ_DATA:
            return cls.FAQ_DATA[intent]['response']
        return None
    
    @classmethod
    def is_faq(cls, message):
        """Check if message matches any FAQ"""
        return cls.detect_intent(message) is not None