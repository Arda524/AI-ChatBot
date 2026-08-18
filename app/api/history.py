"""
History API Blueprint
"""
from flask import Blueprint, request, jsonify, current_app
from app.utils.session import SessionManager
from app.services.chat_service import ChatService

history_bp = Blueprint('history', __name__, url_prefix='/api')


def get_chat_service():
    """Get chat service instance"""
    return ChatService(
        api_key=current_app.config['OPENAI_API_KEY'],
        db_path=current_app.config['DATABASE_PATH']
    )


@history_bp.route('/history', methods=['GET'])
def get_history():
    """Get chat history"""
    try:
        user_id = SessionManager.get_or_create_session()
        limit = request.args.get('limit', 50, type=int)
        
        chat_service = get_chat_service()
        history = chat_service.get_history(user_id, limit)
        
        return jsonify({
            'history': history,
            'user_id': user_id,
            'count': len(history)
        })
    except Exception as e:
        current_app.logger.error(f"History error: {str(e)}")
        return jsonify({'error': 'Failed to load history'}), 500


@history_bp.route('/history/clear', methods=['DELETE'])
def clear_history():
    """Clear chat history"""
    try:
        user_id = SessionManager.get_or_create_session()
        
        chat_service = get_chat_service()
        chat_service.clear_history(user_id)
        
        return jsonify({'message': 'History cleared successfully'})
    except Exception as e:
        current_app.logger.error(f"Clear history error: {str(e)}")
        return jsonify({'error': 'Failed to clear history'}), 500