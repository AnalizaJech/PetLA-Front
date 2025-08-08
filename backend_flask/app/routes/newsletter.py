from flask import Blueprint, request
from bson import ObjectId
from datetime import datetime
from ..db import get_db
from ..utils.helpers import serialize_doc

newsletter_bp = Blueprint('newsletter', __name__)

@newsletter_bp.get('/suscriptores')
def list_subscribers():
    """Listar suscriptores del newsletter"""
    db = get_db()
    
    activo = request.args.get('activo')
    q = {}
    if activo is not None:
        q['activo'] = activo.lower() == 'true'
    
    docs = [serialize_doc(d) for d in db.newsletter_suscriptores.find(q).sort('fechaSuscripcion', -1)]
    return {"success": True, "data": docs}

@newsletter_bp.post('/suscribir')
def subscribe():
    """Suscribir email al newsletter"""
    db = get_db()
    data = request.get_json(force=True)
    
    email = data.get('email')
    if not email:
        return {"error": "email required"}, 400
    
    # Verificar si ya existe
    existing = db.newsletter_suscriptores.find_one({"email": email})
    if existing:
        if existing.get('activo'):
            return {"error": "Email already subscribed"}, 409
        else:
            # Reactivar suscripción
            db.newsletter_suscriptores.update_one(
                {"email": email},
                {"$set": {"activo": True, "fechaReactivacion": datetime.utcnow()}}
            )
            doc = db.newsletter_suscriptores.find_one({"email": email})
            return {"success": True, "data": serialize_doc(doc)}
    
    # Nueva suscripción
    subscriber_doc = {
        "email": email,
        "fechaSuscripcion": datetime.utcnow(),
        "activo": True,
        "origen": data.get('origen', 'web')
    }
    
    res = db.newsletter_suscriptores.insert_one(subscriber_doc)
    subscriber_doc['_id'] = res.inserted_id
    
    return {"success": True, "data": serialize_doc(subscriber_doc)}, 201

@newsletter_bp.delete('/unsuscribe/<email>')
def unsubscribe(email: str):
    """Desuscribir email del newsletter"""
    db = get_db()
    
    result = db.newsletter_suscriptores.update_one(
        {"email": email},
        {"$set": {"activo": False, "fechaDesuscripcion": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        return {"error": "Email not found"}, 404
    
    return {"success": True, "message": "Email unsubscribed successfully"}

@newsletter_bp.get('/emails')
def list_newsletter_emails():
    """Listar emails del newsletter enviados"""
    db = get_db()
    
    estado = request.args.get('estado')
    q = {}
    if estado:
        q['estado'] = estado
    
    docs = [serialize_doc(d) for d in db.newsletter_emails.find(q).sort('fechaEnvio', -1)]
    return {"success": True, "data": docs}

@newsletter_bp.post('/send')
def send_newsletter():
    """Enviar newsletter"""
    db = get_db()
    data = request.get_json(force=True)
    
    # Validaciones requeridas
    required_fields = ['asunto', 'contenido']
    for field in required_fields:
        if not data.get(field):
            return {"error": f"{field} required"}, 400
    
    # Obtener suscriptores activos
    suscriptores = list(db.newsletter_suscriptores.find({"activo": True}))
    destinatarios = [s['email'] for s in suscriptores]
    
    # Estructura del email
    newsletter_doc = {
        "asunto": data['asunto'],
        "contenido": data['contenido'],
        "fechaEnvio": datetime.utcnow(),
        "destinatarios": destinatarios,
        "estado": data.get('estado', 'enviado'),
        "colorTema": data.get('colorTema'),
        "plantilla": data.get('plantilla'),
        "imagenes": data.get('imagenes', []),
        "archivos": data.get('archivos', []),
        "totalEnviados": len(destinatarios),
    }
    
    res = db.newsletter_emails.insert_one(newsletter_doc)
    newsletter_doc['_id'] = res.inserted_id
    
    # Aquí iría la lógica real de envío de emails
    # Por ahora solo guardamos en BD
    
    return {"success": True, "data": serialize_doc(newsletter_doc)}, 201
