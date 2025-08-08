from flask import Blueprint, request
from bson import ObjectId
from datetime import datetime
from ..db import get_db
from ..utils.helpers import serialize_doc

pets_bp = Blueprint('pets', __name__)

@pets_bp.get('')
def list_pets():
    db = get_db()
    cliente_id = request.args.get('clienteId') or request.args.get('cliente_id')
    q = {}
    if cliente_id:
        q['clienteId'] = cliente_id
    
    # Buscar con límite y ordenar por fecha de creación
    docs = [serialize_doc(d) for d in db.pets.find(q).sort('fechaNacimiento', -1).limit(200)]
    return {"success": True, "data": docs}

@pets_bp.get('/<id>')
def get_pet(id: str):
    db = get_db()
    try:
        doc = db.pets.find_one({"_id": ObjectId(id)})
    except:
        doc = db.pets.find_one({"id": id})
    
    if not doc:
        return {"error": "Pet not found"}, 404
    return {"success": True, "data": serialize_doc(doc)}

@pets_bp.post('')
def create_pet():
    db = get_db()
    data = request.get_json(force=True)
    
    # Validaciones básicas
    required_fields = ['nombre', 'especie', 'raza', 'fechaNacimiento', 'clienteId']
    for field in required_fields:
        if not data.get(field):
            return {"error": f"{field} required"}, 400
    
    # Estructura compatible con frontend
    pet_doc = {
        "nombre": data['nombre'],
        "especie": data['especie'],
        "raza": data['raza'],
        "sexo": data.get('sexo'),
        "fechaNacimiento": data['fechaNacimiento'],
        "peso": data.get('peso'),
        "microchip": data.get('microchip'),
        "estado": data.get('estado', 'saludable'),
        "clienteId": data['clienteId'],
        "proximaCita": data.get('proximaCita'),
        "ultimaVacuna": data.get('ultimaVacuna'),
        "foto": data.get('foto'),
        "fechaCreacion": datetime.utcnow(),
    }
    
    res = db.pets.insert_one(pet_doc)
    pet_doc['_id'] = res.inserted_id
    return {"success": True, "data": serialize_doc(pet_doc)}, 201

@pets_bp.put('/<id>')
def update_pet(id: str):
    db = get_db()
    data = request.get_json(force=True)
    
    # Añadir timestamp de actualización
    update_data = {**data, "fechaActualizacion": datetime.utcnow()}
    
    try:
        result = db.pets.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Pet not found"}, 404
        doc = db.pets.find_one({"_id": ObjectId(id)})
    except:
        result = db.pets.update_one({"id": id}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "Pet not found"}, 404
        doc = db.pets.find_one({"id": id})
    
    return {"success": True, "data": serialize_doc(doc)}

@pets_bp.delete('/<id>')
def delete_pet(id: str):
    db = get_db()
    try:
        result = db.pets.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return {"error": "Pet not found"}, 404
    except:
        result = db.pets.delete_one({"id": id})
        if result.deleted_count == 0:
            return {"error": "Pet not found"}, 404
    
    return {"success": True, "message": "Pet deleted successfully"}

@pets_bp.post('/<id>/upload-photo')
def upload_photo(id: str):
    if 'file' not in request.files:
        return {"error": "file required"}, 400
    
    f = request.files['file']
    if f.filename == '':
        return {"error": "No file selected"}, 400
    
    # En este caso, asumimos que el frontend enviará la imagen en base64
    # Para compatibilidad con el sistema actual
    import base64
    import io
    
    # Leer archivo y convertir a base64
    file_data = f.read()
    base64_data = base64.b64encode(file_data).decode('utf-8')
    
    db = get_db()
    try:
        result = db.pets.update_one(
            {"_id": ObjectId(id)}, 
            {"$set": {"foto": f"data:{f.content_type};base64,{base64_data}"}}
        )
        if result.matched_count == 0:
            return {"error": "Pet not found"}, 404
        doc = db.pets.find_one({"_id": ObjectId(id)})
    except:
        result = db.pets.update_one(
            {"id": id}, 
            {"$set": {"foto": f"data:{f.content_type};base64,{base64_data}"}}
        )
        if result.matched_count == 0:
            return {"error": "Pet not found"}, 404
        doc = db.pets.find_one({"id": id})
    
    return {"success": True, "data": serialize_doc(doc)}
