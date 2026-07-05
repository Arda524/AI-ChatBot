from flask_cors import CORS

# Initialize extensions
cors = CORS()

def init_extensions(app):
    """Initialize Flask extensions"""
    cors.init_app(app)