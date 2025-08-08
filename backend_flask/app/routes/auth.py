from flask import Blueprint, request, current_app
from passlib.hash import bcrypt
from datetime import datetime
from ..db import get_db
from ..utils.jwt import create_tokens, verify_token
from ..utils.helpers import serialize_doc
from bson import ObjectId

auth_bp = Blueprint('auth', __name__)

@auth_bp.post('/login')
def login():
    data = request.get_json(force=True)
    identifier = data.get('identifier') or data.get('email')
    password = data.get('password')
    if not identifier or not password:
        return {"error": "identifier and password required"}, 400
    
    db = get_db()
    # Buscar por email, username o telefono (como frontend espera)
    query = {"$or": [
        {"email": identifier},
        {"username": identifier},
        {"telefono": identifier}
    ]}
    user = db.users.find_one(query)
    
    if not user or not bcrypt.verify(password, user.get('password', '')):
        return {"error": "invalid credentials"}, 401
    
    tokens = create_tokens(str(user['_id']), user.get('rol', 'cliente'))
    profile = serialize_doc(user)
    if 'password' in profile:
        del profile['password']
    
    return {"success": True, "tokens": tokens, "user": profile}

@auth_bp.post('/register')
def register():
    data = request.get_json(force=True)
    
    # Validaciones requeridas
    required_fields = ['nombre', 'email', 'password']
    for field in required_fields:
        if not data.get(field):
            return {"error": f"{field} required"}, 400
    
    db = get_db()
    
    # Verificar email único
    if db.users.find_one({"email": data['email']}):
        return {"error": "email already exists"}, 409
    
    # Verificar username único si se proporciona
    if data.get('username') and db.users.find_one({"username": data['username']}):
        return {"error": "username already exists"}, 409
    
    # Estructura del usuario compatible con frontend
    doc = {
        "nombre": data['nombre'],
        "apellidos": data.get('apellidos'),
        "username": data.get('username'),
        "email": data['email'],
        "telefono": data.get('telefono'),
        "direccion": data.get('direccion'),
        "fechaNacimiento": data.get('fechaNacimiento'),
        "genero": data.get('genero'),
        "rol": data.get('rol', 'cliente'),
        "password": bcrypt.hash(data['password']),
        "documento": data.get('documento'),
        "tipoDocumento": data.get('tipoDocumento'),
        "fechaRegistro": datetime.utcnow(),
        "foto": data.get('foto'),
        # Campos para veterinarios
        "especialidad": data.get('especialidad'),
        "experiencia": data.get('experiencia'),
        "colegiatura": data.get('colegiatura'),
    }
    
    res = db.users.insert_one(doc)
    tokens = create_tokens(str(res.inserted_id), doc['rol'])
    doc['_id'] = res.inserted_id
    profile = serialize_doc(doc)
    del profile['password']
    
    return {"success": True, "tokens": tokens, "user": profile}, 201

@auth_bp.post('/refresh-token')
def refresh_token():
    data = request.get_json(force=True)
    token = data.get('refresh_token')
    if not token:
        return {"error": "refresh_token required"}, 400
    
    try:
        payload = verify_token(token, expected_type='refresh')
        user_id = payload['sub']
        db = get_db()
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return {"error": "user not found"}, 404
        
        role = user.get('rol', 'cliente')
        tokens = create_tokens(user_id, role)
        return {"success": True, "tokens": tokens}
    except Exception as e:
        return {"error": "invalid token"}, 401
