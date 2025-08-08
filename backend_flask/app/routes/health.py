from flask import Blueprint
from ..db import get_db

health_bp = Blueprint('health', __name__)

@health_bp.get('/health')
def health():
    db = get_db()
    ping = db.command({'ping': 1})
    return {"status": "ok", "mongo": ping.get('ok', 0) == 1}
