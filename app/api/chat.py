from flask import Blueprint, request, jsonify
from datetime import datetime
from app.utils.session import SessionManager
from app.utils.validators import MessageValidator
from app.services.chat_service import ChatService
from flask import current_app

chat_bp = Blueprint('chat', __name__, url_prefix='/api')

# Initialize chat service (in production, use dependency injection)
def get_chat_service():
    return ChatService(
        api_key=current_app.config['OPENAI_API_KEY'],
        db_path=current_app.config['DATABASE_PATH']
    )

@chat_bp.route('/chat', methods=['POST'])
def chat():
    """Handle chat messages"""
    try:
        user_id = SessionManager.get_or_create_session()
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data['message']
        
        # Validate message
        is_valid, result = MessageValidator.validate(message)
        if not is_valid:
            return jsonify({'error': result}), 400
        
        # Process message
        chat_service = get_chat_service()
        response, source = chat_service.process_message(
            user_id=user_id,
            message=MessageValidator.sanitize(result),
            model=current_app.config.get('GPT_MODEL', 'gpt-4'),
            max_tokens=current_app.config.get('MAX_TOKENS', 150),
            temperature=current_app.config.get('TEMPERATURE', 0.7)
        )
        
        return jsonify({
            'response': response,
            'source': source,
            'timestamp': datetime.now().isoformat(),
            'user_id': user_id
        })
        
    except Exception as e:
        current_app.logger.error(f"Chat error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500