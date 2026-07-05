import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    DATABASE_PATH = os.getenv('DATABASE_PATH', 'chat_history.db')
    
    # Chat settings
    MAX_CONTEXT_MESSAGES = 10
    MAX_MEMORY_MESSAGES = 20
    GPT_MODEL = "gpt-4"
    MAX_TOKENS = 150
    TEMPERATURE = 0.7
    
    # Flask settings
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    HOST = os.getenv('FLASK_HOST', '127.0.0.1')
    PORT = int(os.getenv('FLASK_PORT', 5000))

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    
class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DATABASE_PATH = 'test_chat.db'

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}