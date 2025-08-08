from flask import Blueprint, request
from bson import ObjectId
from datetime import datetime
from ..db import get_db
from ..utils.helpers import serialize_doc

historial_bp = Blueprint('historial', __name__)

@historial_bp.get('/mascota/<mascota_id>')
def get_historial_mascota(mascota_id: str):
    """Obtener historial clínico completo de una mascota"""
    db = get_db()
    
    # Buscar en colección de historial clínico
    query = {"mascotaId": mascota_id}
    docs = [serialize_doc(d) for d in db.historial_clinico.find(query).sort('fecha', -1)]
    
    return {"success": True, "data": docs}

@historial_bp.get('/<id>')
def get_consulta(id: str):
    """Obtener una consulta específica del historial"""
    db = get_db()
    try:
        doc = db.historial_clinico.find_one({"_id": ObjectId(id)})
    except:
        doc = db.historial_clinico.find_one({"id": id})
    
    if not doc:
        return {"error": "Consulta not found"}, 404
    
    return {"success": True, "data": serialize_doc(doc)}

@historial_bp.post('')
def create_consulta():
    """Crear nueva entrada en historial clínico"""
    db = get_db()
    data = request.get_json(force=True)
    
    # Validaciones requeridas
    required_fields = ['mascotaId', 'fecha', 'diagnostico', 'tratamiento']
    for field in required_fields:
        if not data.get(field):
            return {"error": f"{field} required"}, 400
    
    # Estructura del historial clínico compatible con frontend
    historial_doc = {
        "mascotaId": data['mascotaId'],
        "mascotaNombre": data.get('mascotaNombre', ''),
        "fecha": data['fecha'],
        "veterinario": data.get('veterinario', ''),
        "veterinarioId": data.get('veterinarioId'),
        "tipoConsulta": data.get('tipoConsulta'),
        "motivo": data.get('motivo', ''),
        "diagnostico": data['diagnostico'],
        "tratamiento": data['tratamiento'],
        "servicios": data.get('servicios', []),
        "medicamentos": data.get('medicamentos', []),
        "examenes": data.get('examenes', []),
        "vacunas": data.get('vacunas', []),
        "peso": data.get('peso'),
        "temperatura": data.get('temperatura'),
        "presionArterial": data.get('presionArterial'),
        "frecuenciaCardiaca": data.get('frecuenciaCardiaca'),
        "observaciones": data.get('observaciones', ''),
        "proximaVisita": data.get('proximaVisita'),
        "estado": data.get('estado', 'completada'),
        "archivosAdjuntos": data.get('archivosAdjuntos', []),
        "fechaCreacion": datetime.utcnow(),
    }
    
    res = db.historial_clinico.insert_one(historial_doc)
    historial_doc['_id'] = res.inserted_id
    
    return {"success": True, "data": serialize_doc(historial_doc)}, 201

@historial_bp.put('/<id>')
def update_consulta(id: str):
    """Actualizar consulta en historial"""
    db = get_db()
    data = request.get_json(force=True)
    
    update_data = {**data, "fechaActualizacion": datetime.utcnow()}
    
    try:
        result = db.historial_clinico.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Consulta not found"}, 404
        doc = db.historial_clinico.find_one({"_id": ObjectId(id)})
    except:
        result = db.historial_clinico.update_one({"id": id}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Consulta not found"}, 404
        doc = db.historial_clinico.find_one({"id": id})
    
    return {"success": True, "data": serialize_doc(doc)}
