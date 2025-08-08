from flask import Blueprint, request
from bson import ObjectId
from datetime import datetime
from passlib.hash import bcrypt
from ..db import get_db
from ..utils.helpers import serialize_doc

users_bp = Blueprint('users', __name__)

@users_bp.get('')
def list_users():
    """Listar usuarios con filtros opcionales"""
    db = get_db()
    
    # Filtros compatibles con frontend
    rol = request.args.get('rol') or request.args.get('role')
    search = request.args.get('search')
    
    q = {}
    if rol:
        q['rol'] = rol
    
    # Búsqueda por nombre o email
    if search:
        q['$or'] = [
            {"nombre": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"apellidos": {"$regex": search, "$options": "i"}}
        ]
    
    docs = [serialize_doc(d) for d in db.users.find(q).limit(200)]
    
    # Remover campos sensibles
    for doc in docs:
        if 'password' in doc:
            del doc['password']
    
    return {"success": True, "data": docs}

@users_bp.get('/<id>')
def get_user(id: str):
    """Obtener un usuario específico"""
    db = get_db()
    try:
        doc = db.users.find_one({"_id": ObjectId(id)})
    except:
        doc = db.users.find_one({"id": id})
    
    if not doc:
        return {"error": "User not found"}, 404
    
    doc = serialize_doc(doc)
    if 'password' in doc:
        del doc['password']
    
    return {"success": True, "data": doc}

@users_bp.post('')
def create_user():
    """Crear nuevo usuario"""
    db = get_db()
    data = request.get_json(force=True)
    
    # Validaciones requeridas
    required_fields = ['nombre', 'email']
    for field in required_fields:
        if not data.get(field):
            return {"error": f"{field} required"}, 400
    
    # Verificar email único
    if db.users.find_one({"email": data['email']}):
        return {"error": "Email already exists"}, 409
    
    # Verificar username único si se proporciona
    if data.get('username') and db.users.find_one({"username": data['username']}):
        return {"error": "Username already exists"}, 409
    
    # Estructura del usuario compatible con AppContext
    user_doc = {
        "nombre": data['nombre'],
        "apellidos": data.get('apellidos'),
        "username": data.get('username'),
        "email": data['email'],
        "telefono": data.get('telefono'),
        "direccion": data.get('direccion'),
        "fechaNacimiento": data.get('fechaNacimiento'),
        "genero": data.get('genero'),
        "rol": data.get('rol', 'cliente'),
        "documento": data.get('documento'),
        "tipoDocumento": data.get('tipoDocumento'),
        "fechaRegistro": datetime.utcnow(),
        "foto": data.get('foto'),
        # Campos para veterinarios
        "especialidad": data.get('especialidad'),
        "experiencia": data.get('experiencia'),
        "colegiatura": data.get('colegiatura'),
    }
    
    # Hash password si se proporciona
    if data.get('password'):
        user_doc['password'] = bcrypt.hash(data['password'])
    
    res = db.users.insert_one(user_doc)
    user_doc['_id'] = res.inserted_id
    
    result = serialize_doc(user_doc)
    if 'password' in result:
        del result['password']
    
    return {"success": True, "data": result}, 201

@users_bp.put('/<id>')
def update_user(id: str):
    """Actualizar usuario"""
    db = get_db()
    data = request.get_json(force=True)
    
    # Verificar email único si se está cambiando
    if 'email' in data:
        existing = db.users.find_one({"email": data['email']})
        if existing and str(existing['_id']) != id:
            return {"error": "Email already exists"}, 409
    
    # Verificar username único si se está cambiando
    if 'username' in data:
        existing = db.users.find_one({"username": data['username']})
        if existing and str(existing['_id']) != id:
            return {"error": "Username already exists"}, 409
    
    # Hash password si se está actualizando
    if 'password' in data:
        data['password'] = bcrypt.hash(data['password'])
    
    # Añadir timestamp de actualización
    update_data = {**data, "fechaActualizacion": datetime.utcnow()}
    
    try:
        result = db.users.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "User not found"}, 404
        doc = db.users.find_one({"_id": ObjectId(id)})
    except:
        result = db.users.update_one({"id": id}, {"$set": update_data})
        if result.matched_count == 0:
            return {"error": "User not found"}, 404
        doc = db.users.find_one({"id": id})
    
    result = serialize_doc(doc)
    if 'password' in result:
        del result['password']
    
    return {"success": True, "data": result}

@users_bp.delete('/<id>')
def delete_user(id: str):
    """Eliminar usuario"""
    db = get_db()
    
    try:
        result = db.users.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return {"error": "User not found"}, 404
    except:
        result = db.users.delete_one({"id": id})
        if result.deleted_count == 0:
            return {"error": "User not found"}, 404
    
    # También eliminar mascotas y citas relacionadas
    db.pets.delete_many({"clienteId": id})
    db.appointments.delete_many({"clienteId": id})
    db.notificaciones.delete_many({"usuarioId": id})
    
    return {"success": True, "message": "User deleted successfully"}

@users_bp.get('/profile')
def get_profile():
    """Obtener perfil del usuario actual (requiere autenticación)"""
    # Este endpoint necesitaría middleware de autenticación
    # Por ahora retorna un placeholder
    return {"error": "Authentication required"}, 401

@users_bp.put('/profile')
def update_profile():
    """Actualizar perfil del usuario actual (requiere autenticación)"""
    # Este endpoint necesitaría middleware de autenticación
    # Por ahora retorna un placeholder
    return {"error": "Authentication required"}, 401

@users_bp.post('/upload-avatar')
def upload_avatar():
    """Subir avatar del usuario"""
    if 'file' not in request.files:
        return {"error": "file required"}, 400
    
    f = request.files['file']
    if f.filename == '':
        return {"error": "No file selected"}, 400
    
    # Convertir a base64 para compatibilidad con el frontend
    import base64
    
    file_data = f.read()
    base64_data = base64.b64encode(file_data).decode('utf-8')
    
    user_id = request.form.get('userId')
    if not user_id:
        return {"error": "userId required"}, 400
    
    db = get_db()
    try:
        result = db.users.update_one(
            {"_id": ObjectId(user_id)}, 
            {"$set": {"foto": f"data:{f.content_type};base64,{base64_data}"}}
        )
        if result.matched_count == 0:
            return {"error": "User not found"}, 404
        doc = db.users.find_one({"_id": ObjectId(user_id)})
    except:
        result = db.users.update_one(
            {"id": user_id}, 
            {"$set": {"foto": f"data:{f.content_type};base64,{base64_data}"}}
        )
        if result.matched_count == 0:
            return {"error": "User not found"}, 404
        doc = db.users.find_one({"id": user_id})
    
    result = serialize_doc(doc)
    if 'password' in result:
        del result['password']
    
    return {"success": True, "data": result}
