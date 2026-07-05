from flask import Blueprint, render_template
from app.utils.session import SessionManager

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    user_id = SessionManager.get_or_create_session()
    return render_template('index.html', user_id=user_id)