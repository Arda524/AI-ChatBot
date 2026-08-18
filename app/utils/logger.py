
import logging
import os
from pathlib import Path
from datetime import datetime


class ColoredFormatter(logging.Formatter):
    """Custom formatter with ANSI colors"""
    
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
    }
    RESET = '\033[0m'
    
    def format(self, record):
        color = self.COLORS.get(record.levelname, '')
        record.levelname = f"{color}{record.levelname}{self.RESET}"
        return super().format(record)


def setup_logging(app):
    """Configure application logging"""
    log_level = logging.DEBUG if app.config.get('DEBUG', False) else logging.INFO
    
    # Create logs directory
    log_dir = Path(__file__).resolve().parent.parent.parent / 'logs'
    log_dir.mkdir(exist_ok=True)
    
    # File handler
    file_handler = logging.FileHandler(
        log_dir / f'chatbot_{datetime.now().strftime("%Y%m%d")}.log'
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    ))
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(ColoredFormatter(
        '%(levelname)s │ %(message)s'
    ))
    
    # Clear existing handlers and add new ones
    app.logger.handlers.clear()
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(log_level)
    
    # Log startup
    app.logger.info(f"Logging configured - Level: {logging.getLevelName(log_level)}")