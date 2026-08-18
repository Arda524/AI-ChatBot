
import openai
from app.services.faq_service import FAQService
from app.services.context_service import ContextService
from app.models.database import ChatDatabase


class ChatService:
    """Main chat processing service"""
    
    SYSTEM_PROMPT = """You are a helpful, friendly AI assistant. 
    Provide clear, concise, and accurate responses. 
    If you're unsure about something, acknowledge it honestly."""
    
    def __init__(self, api_key, db_path='chat_history.db'):
        openai.api_key = api_key
        self.db = ChatDatabase(db_path)
        self.context_service = ContextService()
    
    def process_message(self, user_id, message, model="gpt-4", 
                       max_tokens=150, temperature=0.7):
        """Process user message and return response"""
        
        # Save user message
        self.db.save_message(user_id, 'user', message)
        self.context_service.add_message(user_id, 'user', message)
        
        # Check FAQ first
        faq_intent = FAQService.detect_intent(message)
        
        if faq_intent:
            response = FAQService.get_response(faq_intent)
            source = 'faq'
        else:
            response = self._get_gpt_response(user_id, message, model, 
                                              max_tokens, temperature)
            source = 'gpt4'
        
        # Save bot response
        self.db.save_message(user_id, 'assistant', response, source)
        self.context_service.add_message(user_id, 'assistant', response)
        
        return response, source
    
    def _get_gpt_response(self, user_id, message, model, max_tokens, temperature):
        """Get response from GPT"""
        context = self.context_service.get_context_for_gpt(
            user_id, 
            system_prompt=self.SYSTEM_PROMPT
        )
        context.append({"role": "user", "content": message})
        
        try:
            response = openai.ChatCompletion.create(
                model=model,
                messages=context,
                max_tokens=max_tokens,
                temperature=temperature,
                presence_penalty=0.6,
                frequency_penalty=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    def get_history(self, user_id, limit=50):
        """Get chat history"""
        return self.db.get_chat_history(user_id, limit)
    
    def clear_history(self, user_id):
        """Clear chat history"""
        self.db.clear_history(user_id)
        self.context_service.clear_context(user_id)