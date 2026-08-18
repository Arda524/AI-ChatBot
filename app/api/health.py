"""
Health Check API Blueprint
"""
from flask import Blueprint, jsonify, current_app
from app.models.database import ChatDatabase
import openai

health_bp = Blueprint('health', __name__)


@health_bp.route('/health', methods=['GET'])
def health_check():
    """Comprehensive health check"""
    health_status = {
        'status': 'healthy',
        'version': '1.0.0',
        'checks': {}
    }
    
    # Check database
    try:
        db = ChatDatabase(current_app.config.get('DATABASE_PATH', 'chat_history.db'))
        db.get_connection()
        health_status['checks']['database'] = 'connected'
    except Exception as e:
        health_status['status'] = 'unhealthy'
        health_status['checks']['database'] = f'error: {str(e)}'
    
    # Check OpenAI API
    try:
        openai.api_key = current_app.config['OPENAI_API_KEY']
        openai.Model.list()
        health_status['checks']['openai_api'] = 'connected'
    except Exception as e:
        health_status['checks']['openai_api'] = f'error: {str(e)}'
    
    # Determine HTTP status code
    status_code = 200 if health_status['status'] == 'healthy' else 503
    
    return jsonify(health_status), status_code


@health_bp.route('/ping', methods=['GET'])
def ping():
    """Simple ping endpoint"""
    return jsonify({'message': 'pong', 'status': 'ok'})