import os
import time
import jwt
from typing import Dict, Any

JWT_SECRET = os.getenv("JWT_SECRET", "change_me_in_env")
JWT_ALG = "HS256"
ACCESS_TTL = 60 * 60  # 1 hour
REFRESH_TTL = 60 * 60 * 24 * 7  # 7 days


def create_tokens(user_id: str, role: str) -> Dict[str, str]:
    now = int(time.time())
    access_payload: Dict[str, Any] = {
        "sub": user_id,
        "role": role,
        "type": "access",
        "iat": now,
        "exp": now + ACCESS_TTL,
    }
    refresh_payload: Dict[str, Any] = {
        "sub": user_id,
        "type": "refresh",
        "iat": now,
        "exp": now + REFRESH_TTL,
    }
    return {
        "access_token": jwt.encode(access_payload, JWT_SECRET, algorithm=JWT_ALG),
        "refresh_token": jwt.encode(refresh_payload, JWT_SECRET, algorithm=JWT_ALG),
    }


def verify_token(token: str, expected_type: str = "access") -> Dict[str, Any]:
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    if payload.get("type") != expected_type:
        raise jwt.InvalidTokenError("Invalid token type")
    return payload
