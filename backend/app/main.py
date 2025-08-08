from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://petla:petla123@mongo:27017/petla?authSource=admin")
DB_NAME = os.getenv("MONGO_DB", "petla")

app = FastAPI(title="PetLA API", version="0.1.0")

# CORS for local dev (Vite on 8080)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client: AsyncIOMotorClient | None = None

def get_db():
    if client is None:
        raise RuntimeError("Mongo client not initialized")
    return client[DB_NAME]

@app.on_event("startup")
async def startup_event():
    global client
    client = AsyncIOMotorClient(MONGO_URI)

@app.on_event("shutdown")
async def shutdown_event():
    global client
    if client is not None:
        client.close()

# Models
class User(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    email: str
    role: str
    specialty: Optional[str] = None

class Pet(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    ownerId: str
    name: str
    species: str
    breed: Optional[str] = None
    birthdate: Optional[str] = None
    notes: Optional[str] = None

class Appointment(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    petId: str
    ownerId: str
    vetId: str
    date: str
    status: str
    reason: Optional[str] = None
    notes: Optional[str] = None

# Health
@app.get("/health")
async def health(db=Depends(get_db)):
    ping = await db.command({"ping": 1})
    return {"status": "ok", "mongo": ping.get("ok", 0) == 1}

# Users
@app.get("/api/users", response_model=List[User])
async def list_users(db=Depends(get_db)):
    cursor = db.users.find({})
    return [User(**{**doc, "_id": str(doc["_id"])}) async for doc in cursor]

# Pets
@app.get("/api/pets", response_model=List[Pet])
async def list_pets(db=Depends(get_db)):
    cursor = db.pets.find({})
    return [Pet(**{**doc, "_id": str(doc["_id"])}) async for doc in cursor]

# Appointments
@app.get("/api/appointments", response_model=List[Appointment])
async def list_appointments(db=Depends(get_db)):
    cursor = db.appointments.find({})
    return [Appointment(**{**doc, "_id": str(doc["_id"])}) async for doc in cursor]

