
from flask_cors import CORS

cors = CORS()


def init_extensions(app):
    """Initialize all Flask extensions"""
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": app.config.get('CORS_ORIGINS', '*'),
            "methods": ["GET", "POST", "DELETE"],
            "allow_headers": ["Content-Type"]
        }
    })