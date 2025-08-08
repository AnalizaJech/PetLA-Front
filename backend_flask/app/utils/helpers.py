from bson import ObjectId
from datetime import datetime


def to_object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except Exception:
        raise ValueError("Invalid ObjectId")


def serialize_doc(doc):
    if not doc:
        return None
    # shallow copy
    out = {}
    # id primero
    _id = doc.get("_id")
    if isinstance(_id, ObjectId):
        out["id"] = str(_id)
    # copiar resto convirtiendo tipos
    for k, v in doc.items():
        if k == "_id":
            continue
        if isinstance(v, ObjectId):
            out[k] = str(v)
        elif isinstance(v, datetime):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out
