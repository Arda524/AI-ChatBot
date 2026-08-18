
from datetime import datetime
from collections import OrderedDict


class ContextService:
    """Manage conversation context"""
    
    def __init__(self, max_messages=20):
        self.max_messages = max_messages
        self._contexts = OrderedDict()
    
    def get_context(self, user_id, max_messages=10):
        """Get recent conversation context"""
        if user_id not in self._contexts:
            self._contexts[user_id] = []
        return self._contexts[user_id][-max_messages:]
    
    def add_message(self, user_id, role, content):
        """Add message to context"""
        if user_id not in self._contexts:
            self._contexts[user_id] = []
        
        self._contexts[user_id].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        
        # Trim old messages
        if len(self._contexts[user_id]) > self.max_messages:
            self._contexts[user_id] = self._contexts[user_id][-self.max_messages:]
    
    def clear_context(self, user_id):
        """Clear context"""
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