from datetime import datetime
from collections import OrderedDict

class ContextService:
    """Manage conversation context (short-term memory)"""
    
    def __init__(self, max_messages=20):
        self.max_messages = max_messages
        self._contexts = OrderedDict()
    
    def get_context(self, user_id, max_messages=10):
        """Get recent conversation context"""
        if user_id not in self._contexts:
            self._contexts[user_id] = []
        
        context = self._contexts[user_id]
        return context[-max_messages:] if context else []
    
    def add_message(self, user_id, role, content):
        """Add a message to context"""
        if user_id not in self._contexts:
            self._contexts[user_id] = []
        
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        }
        
        self._contexts[user_id].append(message)
        
        # Trim old messages if exceeding max
        if len(self._contexts[user_id]) > self.max_messages:
            self._contexts[user_id] = self._contexts[user_id][-self.max_messages:]
    
    def clear_context(self, user_id):
        """Clear context for a user"""
        if user_id in self._contexts:
            self._contexts[user_id] = []
    
    def get_context_for_gpt(self, user_id, system_prompt=None, max_messages=8):
        """Format context for GPT API"""
        context = self.get_context(user_id, max_messages)
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        for msg in context:
            messages.append({
                "role": msg['role'],
                "content": msg['content']
            })
        
        return messages