from flask import Blueprint, request
from bson import ObjectId
from datetime import datetime
from ..db import get_db
from ..utils.helpers import serialize_doc

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.get('')
def list_notifications():
    """Listar notificaciones del usuario actual"""
    db = get_db()
    
    user_id = request.args.get('usuarioId')
    leida = request.args.get('leida')
    
    q = {}
    if user_id:
        q['usuarioId'] = user_id
    if leida is not None:
        q['leida'] = leida.lower() == 'true'
    
    docs = [serialize_doc(d) for d in db.notificaciones.find(q).sort('fechaCreacion', -1).limit(100)]
    return {"success": True, "data": docs}

@notifications_bp.post('')
def create_notification():
    """Crear nueva notificación"""
    db = get_db()
    data = request.get_json(force=True)
    
    # Validaciones requeridas
    required_fields = ['usuarioId', 'tipo', 'titulo', 'mensaje']
    for field in required_fields:
        if not data.get(field):
            return {"error": f"{field} required"}, 400
    
    # Estructura compatible con AppContext
    notification_doc = {
        "usuarioId": data['usuarioId'],
        "tipo": data['tipo'],
        "titulo": data['titulo'],
        "mensaje": data['mensaje'],
        "leida": data.get('leida', False),
        "fechaCreacion": datetime.utcnow(),
        "datos": data.get('datos', {}),
    }
    
    res = db.notificaciones.insert_one(notification_doc)
    notification_doc['_id'] = res.inserted_id
    
    return {"success": True, "data": serialize_doc(notification_doc)}, 201

@notifications_bp.put('/<id>/leida')
def mark_as_read(id: str):
    """Marcar notificación como leída"""
    db = get_db()
    
    update_data = {
        "leida": True,
        "fechaLectura": datetime.utcnow()
    }
    
    try:
        result = db.notificaciones.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Notification not found"}, 404
        doc = db.notificaciones.find_one({"_id": ObjectId(id)})
    except:
        result = db.notificaciones.update_one({"id": id}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Notification not found"}, 404
        doc = db.notificaciones.find_one({"id": id})
    
    return {"success": True, "data": serialize_doc(doc)}

@notifications_bp.put('/mark-all-read')
def mark_all_as_read():
    """Marcar todas las notificaciones como leídas para un usuario"""
    db = get_db()
    data = request.get_json(force=True)
    
    user_id = data.get('usuarioId')
    if not user_id:
        return {"error": "usuarioId required"}, 400
    
    update_data = {
        "leida": True,
        "fechaLectura": datetime.utcnow()
    }
    
    result = db.notificaciones.update_many(
        {"usuarioId": user_id, "leida": False}, 
        {"$set": update_data}
    )
    
    return {"success": True, "message": f"Marked {result.modified_count} notifications as read"}
