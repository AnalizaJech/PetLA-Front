from flask import Blueprint, request, current_app
from bson import ObjectId
from werkzeug.utils import secure_filename
import os
import base64
from datetime import datetime
from ..db import get_db
from ..utils.helpers import serialize_doc

appts_bp = Blueprint('appointments', __name__)

@appts_bp.get('')
def list_appointments():
    db = get_db()
    
    # Filtros compatibles con frontend
    estado = request.args.get('estado')
    vet_id = request.args.get('veterinarioId') or request.args.get('vetId')
    cliente_id = request.args.get('clienteId')
    fecha_desde = request.args.get('fechaDesde')
    fecha_hasta = request.args.get('fechaHasta')
    
    q = {}
    if estado:
        q['estado'] = estado
    if vet_id:
        q['veterinarioId'] = vet_id
    if cliente_id:
        q['clienteId'] = cliente_id
    
    # Filtros de fecha si se proporcionan
    if fecha_desde or fecha_hasta:
        date_filter = {}
        if fecha_desde:
            date_filter['$gte'] = fecha_desde
        if fecha_hasta:
            date_filter['$lte'] = fecha_hasta
        if date_filter:
            q['fecha'] = date_filter
    
    docs = [serialize_doc(d) for d in db.appointments.find(q).sort('fecha', 1).limit(500)]
    return {"success": True, "data": docs}

@appts_bp.get('/<id>')
def get_appointment(id: str):
    db = get_db()
    try:
        doc = db.appointments.find_one({"_id": ObjectId(id)})
    except:
        doc = db.appointments.find_one({"id": id})
    
    if not doc:
        return {"error": "Appointment not found"}, 404
    return {"success": True, "data": serialize_doc(doc)}

@appts_bp.post('')
def create_appointment():
    db = get_db()
    data = request.get_json(force=True)
    
    # Validaciones requeridas
    required_fields = ['mascota', 'fecha', 'motivo', 'tipoConsulta']
    for field in required_fields:
        if not data.get(field):
            return {"error": f"{field} required"}, 400
    
    # Estructura compatible con AppContext del frontend
    cita_doc = {
        "mascota": data['mascota'],  # nombre de la mascota
        "mascotaId": data.get('mascotaId'),
        "especie": data.get('especie', ''),
        "clienteId": data.get('clienteId'),
        "clienteNombre": data.get('clienteNombre'),
        "fecha": data['fecha'],
        "estado": data.get('estado', 'pendiente_pago'),
        "veterinario": data.get('veterinario', ''),
        "veterinarioId": data.get('veterinarioId'),
        "motivo": data['motivo'],
        "tipoConsulta": data['tipoConsulta'],
        "ubicacion": data.get('ubicacion', 'Clínica Principal'),
        "precio": data.get('precio', 0),
        "notas": data.get('notas'),
        "comprobantePago": data.get('comprobantePago'),
        "comprobanteData": data.get('comprobanteData'),
        "notasAdmin": data.get('notasAdmin'),
        "fechaCreacion": datetime.utcnow(),
    }
    
    res = db.appointments.insert_one(cita_doc)
    cita_doc['_id'] = res.inserted_id
    return {"success": True, "data": serialize_doc(cita_doc)}, 201

@appts_bp.put('/<id>')
def update_appointment(id: str):
    db = get_db()
    data = request.get_json(force=True)
    
    # Añadir timestamp de actualización
    update_data = {**data, "fechaActualizacion": datetime.utcnow()}
    
    try:
        result = db.appointments.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Appointment not found"}, 404
        doc = db.appointments.find_one({"_id": ObjectId(id)})
    except:
        result = db.appointments.update_one({"id": id}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Appointment not found"}, 404
        doc = db.appointments.find_one({"id": id})
    
    return {"success": True, "data": serialize_doc(doc)}

@appts_bp.delete('/<id>')
def delete_appointment(id: str):
    db = get_db()
    try:
        result = db.appointments.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return {"error": "Appointment not found"}, 404
    except:
        result = db.appointments.delete_one({"id": id})
        if result.deleted_count == 0:
            return {"error": "Appointment not found"}, 404
    
    return {"success": True, "message": "Appointment deleted successfully"}

@appts_bp.put('/<id>/estado')
def update_estado(id: str):
    db = get_db()
    data = request.get_json(force=True)
    estado = data.get('estado') or data.get('status')
    if not estado:
        return {"error": "estado required"}, 400
    
    update_data = {
        "estado": estado,
        "fechaActualizacion": datetime.utcnow()
    }
    
    # Agregar notas del admin si se proporcionan
    if data.get('notasAdmin'):
        update_data['notasAdmin'] = data['notasAdmin']
    
    try:
        result = db.appointments.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Appointment not found"}, 404
        doc = db.appointments.find_one({"_id": ObjectId(id)})
    except:
        result = db.appointments.update_one({"id": id}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Appointment not found"}, 404
        doc = db.appointments.find_one({"id": id})
    
    return {"success": True, "data": serialize_doc(doc)}

@appts_bp.post('/<id>/comprobante')
def upload_comprobante(id: str):
    # Manejar tanto archivo como datos en base64
    if 'file' in request.files:
        f = request.files['file']
        if f.filename == '':
            return {"error": "No file selected"}, 400
        
        # Convertir a base64 para compatibilidad
        file_data = f.read()
        base64_data = base64.b64encode(file_data).decode('utf-8')
        
        comprobante_data = {
            "id": id,
            "data": f"data:{f.content_type};base64,{base64_data}",
            "originalName": f.filename,
            "size": len(file_data),
            "type": f.content_type,
            "timestamp": int(datetime.utcnow().timestamp() * 1000)
        }
    else:
        # Datos JSON directamente
        data = request.get_json(force=True)
        comprobante_data = data.get('comprobanteData')
        if not comprobante_data:
            return {"error": "file or comprobanteData required"}, 400
    
    db = get_db()
    update_data = {
        "comprobanteData": comprobante_data,
        "comprobantePago": comprobante_data.get('data', ''),
        "estado": "en_validacion",
        "fechaActualizacion": datetime.utcnow()
    }
    
    try:
        result = db.appointments.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Appointment not found"}, 404
        doc = db.appointments.find_one({"_id": ObjectId(id)})
    except:
        result = db.appointments.update_one({"id": id}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Appointment not found"}, 404
        doc = db.appointments.find_one({"id": id})
    
    return {"success": True, "data": serialize_doc(doc)}

@appts_bp.put('/<id>/validar-pago')
def validar_pago(id: str):
    db = get_db()
    data = request.get_json(force=True)
    valid = data.get('valid')
    notas = data.get('notasAdmin')
    
    if valid is None:
        return {"error": "valid field required"}, 400
    
    new_status = 'aceptada' if valid else 'rechazada'
    update_data = {
        "estado": new_status,
        "fechaActualizacion": datetime.utcnow()
    }
    
    if notas:
        update_data['notasAdmin'] = notas
    
    try:
        result = db.appointments.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Appointment not found"}, 404
        doc = db.appointments.find_one({"_id": ObjectId(id)})
    except:
        result = db.appointments.update_one({"id": id}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Appointment not found"}, 404
        doc = db.appointments.find_one({"id": id})
    
    return {"success": True, "data": serialize_doc(doc)}

@appts_bp.put('/<id>/atender')
def atender(id: str):
    db = get_db()
    data = request.get_json(force=True)
    
    update_data = {
        "estado": "atendida",
        "fechaActualizacion": datetime.utcnow()
    }
    
    # Si hay datos del historial clínico, los guardamos
    if data.get('historialData'):
        update_data['historialData'] = data['historialData']
    
    # Notas adicionales del veterinario
    if data.get('notas'):
        update_data['notas'] = data['notas']
    
    try:
        result = db.appointments.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Appointment not found"}, 404
        doc = db.appointments.find_one({"_id": ObjectId(id)})
    except:
        result = db.appointments.update_one({"id": id}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Appointment not found"}, 404
        doc = db.appointments.find_one({"id": id})
    
    return {"success": True, "data": serialize_doc(doc)}
