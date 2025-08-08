from flask import Blueprint, request
from bson import ObjectId
from datetime import datetime
from ..db import get_db
from ..utils.helpers import serialize_doc

precitas_bp = Blueprint('precitas', __name__)

@precitas_bp.get('')
def list_precitas():
    """Listar pre-citas del landing público"""
    db = get_db()
    
    estado = request.args.get('estado')
    q = {}
    if estado:
        q['estado'] = estado
    
    docs = [serialize_doc(d) for d in db.pre_citas.find(q).sort('fechaCreacion', -1).limit(200)]
    return {"success": True, "data": docs}

@precitas_bp.get('/<id>')
def get_precita(id: str):
    """Obtener una pre-cita específica"""
    db = get_db()
    try:
        doc = db.pre_citas.find_one({"_id": ObjectId(id)})
    except:
        doc = db.pre_citas.find_one({"id": id})
    
    if not doc:
        return {"error": "Pre-cita not found"}, 404
    
    return {"success": True, "data": serialize_doc(doc)}

@precitas_bp.post('')
def create_precita():
    """Crear nueva pre-cita desde el landing público"""
    db = get_db()
    data = request.get_json(force=True)
    
    # Validaciones requeridas
    required_fields = ['nombreCliente', 'telefono', 'email', 'nombreMascota', 'tipoMascota', 'motivoConsulta']
    for field in required_fields:
        if not data.get(field):
            return {"error": f"{field} required"}, 400
    
    # Estructura compatible con AppContext
    precita_doc = {
        "nombreCliente": data['nombreCliente'],
        "telefono": data['telefono'],
        "email": data['email'],
        "nombreMascota": data['nombreMascota'],
        "tipoMascota": data['tipoMascota'],
        "motivoConsulta": data['motivoConsulta'],
        "fechaPreferida": data.get('fechaPreferida'),
        "horaPreferida": data.get('horaPreferida'),
        "estado": data.get('estado', 'pendiente'),
        "fechaCreacion": datetime.utcnow(),
        "notasAdmin": data.get('notasAdmin'),
        "veterinarioAsignado": data.get('veterinarioAsignado'),
        "fechaNueva": data.get('fechaNueva'),
        "horaNueva": data.get('horaNueva'),
    }
    
    res = db.pre_citas.insert_one(precita_doc)
    precita_doc['_id'] = res.inserted_id
    
    return {"success": True, "data": serialize_doc(precita_doc)}, 201

@precitas_bp.put('/<id>/aprobar')
def aprobar_precita(id: str):
    """Aprobar una pre-cita y convertirla en cita real"""
    db = get_db()
    data = request.get_json(force=True)
    
    # Actualizar estado y datos
    update_data = {
        "estado": "aceptada",
        "fechaActualizacion": datetime.utcnow(),
        "veterinarioAsignado": data.get('veterinarioAsignado'),
        "fechaNueva": data.get('fechaNueva'),
        "horaNueva": data.get('horaNueva'),
        "notasAdmin": data.get('notasAdmin'),
    }
    
    try:
        result = db.pre_citas.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Pre-cita not found"}, 404
        doc = db.pre_citas.find_one({"_id": ObjectId(id)})
    except:
        result = db.pre_citas.update_one({"id": id}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Pre-cita not found"}, 404
        doc = db.pre_citas.find_one({"id": id})
    
    return {"success": True, "data": serialize_doc(doc)}

@precitas_bp.put('/<id>/rechazar')
def rechazar_precita(id: str):
    """Rechazar una pre-cita"""
    db = get_db()
    data = request.get_json(force=True)
    
    update_data = {
        "estado": "rechazada",
        "fechaActualizacion": datetime.utcnow(),
        "notasAdmin": data.get('notasAdmin', 'Pre-cita rechazada'),
    }
    
    try:
        result = db.pre_citas.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Pre-cita not found"}, 404
        doc = db.pre_citas.find_one({"_id": ObjectId(id)})
    except:
        result = db.pre_citas.update_one({"id": id}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Pre-cita not found"}, 404
        doc = db.pre_citas.find_one({"id": id})
    
    return {"success": True, "data": serialize_doc(doc)}
