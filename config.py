import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration"""
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'change-this-in-production')
    
    # OpenAI
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    GPT_MODEL = os.getenv('GPT_MODEL', 'gpt-4')
    MAX_TOKENS = int(os.getenv('MAX_TOKENS', 150))
    TEMPERATURE = float(os.getenv('TEMPERATURE', 0.7))
    
    # Database
    DATABASE_PATH = os.getenv('DATABASE_PATH', 'chat_history.db')
    
    # Chat Settings
    MAX_CONTEXT_MESSAGES = 10
    MAX_MEMORY_MESSAGES = 20
    
    # Server
    HOST = os.getenv('FLASK_HOST', '127.0.0.1')
    PORT = int(os.getenv('FLASK_PORT', 5000))
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    ENV = 'development'


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    ENV = 'production'
    
    # Security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    DATABASE_PATH = 'test_chat.db'


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}