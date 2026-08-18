from flask import Flask
from config import config
from app.extensions import init_extensions
import os


def create_app(config_name=None):
    """Create and configure Flask application"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(
        __name__,
        template_folder='templates',
        static_folder='../static'
    )
    
    # Load configuration
    app.config.from_object(config.get(config_name, config['default']))
    
    # Initialize extensions
    init_extensions(app)
    
    # Register blueprints
    from app.api import main_bp
    from app.api.chat import chat_bp
    from app.api.history import history_bp
    from app.api.tts import tts_bp
    from app.api.health import health_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(tts_bp)
    app.register_blueprint(health_bp)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def server_error(error):
        app.logger.error(f'Server error: {error}')
        return {'error': 'Internal server error'}, 500
    
    return app