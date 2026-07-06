from flask import Flask
from config import config
from app.extensions import init_extensions
import os

def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'default')
    
    # Fix: Use correct template folder path
    app = Flask(__name__, 
                template_folder='templates',      # Relative to app/
                static_folder='templates/static')        # Go up one level to chatbot/static
    
    app.config.from_object(config[config_name])
    init_extensions(app)
    
    # Register blueprints
    from app.api.chat import chat_bp
    from app.api.history import history_bp
    from app.api.tts import tts_bp
    
    app.register_blueprint(chat_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(tts_bp)
    
    from app.api import main_bp
    app.register_blueprint(main_bp)
    
    return app