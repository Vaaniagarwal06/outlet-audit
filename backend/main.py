"""Outlet Audit CRUD API. The only persisted collection is `audits`."""
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

from datetime import datetime
from typing import Literal

from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict
from pymongo.errors import PyMongoError

MONGO_URL = os.getenv("MONGO_URL", "mongodb://127.0.0.1:27017")
MONGO_DATABASE = os.getenv("MONGO_DATABASE", "outlet_audit")


class Photo(BaseModel):
    model_config = ConfigDict(extra="forbid")
    base64: str


class Checkpoint(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str
    title: str = Field(min_length=1, max_length=180)
    status: Literal["pass", "fail", "na", "unanswered"] = "unanswered"
    notes: str = Field(default="", max_length=3000)
    photos: list[Photo] = Field(default_factory=list)


class Parameter(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=1, max_length=120)
    score: float = Field(default=0, ge=0, le=100)
    checkpoints: list[Checkpoint] = Field(default_factory=list)


class Audit(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(min_length=1, max_length=100)
    outletName: str = Field(min_length=1, max_length=120)
    brand: str = Field(min_length=1, max_length=100)
    auditorName: str = Field(min_length=1, max_length=120)
    dateTime: datetime
    status: Literal["in_progress", "completed"] = "in_progress"
    overallScore: float = Field(default=0, ge=0, le=100)
    parameters: list[Parameter] = Field(min_length=12, max_length=12)


async def audits_collection(request: Request):
    try:
        return request.app.state.mongo[MONGO_DATABASE].audits
    except Exception as exc:
        raise HTTPException(503, "Audit database is unavailable. Check MONGO_URL.") from exc


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.mongo = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=3000)
    try:
        await app.state.mongo.admin.command("ping")
        print("✅ MongoDB Connected")
    except Exception as e:
        print("❌ MongoDB Error:")
        print(e)
    yield
    app.state.mongo.close()


app = FastAPI(title="Outlet Audit API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)


def serialize(document: dict) -> dict:
    document.pop("_id", None)
    return document


@app.get("/audits", response_model=list[Audit])
async def list_audits(request: Request):
    collection = await audits_collection(request)
    try:
        return [serialize(row) async for row in collection.find({}, {"_id": 0}).sort("dateTime", -1)]
    except PyMongoError as exc:
        raise HTTPException(503, "Audit database is unavailable. Check MONGO_URL.") from exc


@app.get("/audits/{audit_id}", response_model=Audit)
async def get_audit(audit_id: str, request: Request):
    collection = await audits_collection(request)
    try:
        audit = await collection.find_one({"id": audit_id}, {"_id": 0})
    except PyMongoError as exc:
        raise HTTPException(503, "Audit database is unavailable. Check MONGO_URL.") from exc
    if not audit:
        raise HTTPException(404, "Audit not found")
    return serialize(audit)


@app.post("/audits", response_model=Audit, status_code=201)
async def create_audit(payload: Audit, request: Request):
    collection = await audits_collection(request)
    document = payload.model_dump(mode="json")
    try:
        if await collection.find_one({"id": payload.id}, {"_id": 1}):
            raise HTTPException(409, "An audit with this id already exists")
        await collection.insert_one(document)
    except HTTPException:
        raise
    except PyMongoError as exc:
        raise HTTPException(503, "Audit database is unavailable. Check MONGO_URL.") from exc
    return serialize(document)


@app.put("/audits/{audit_id}", response_model=Audit)
async def update_audit(audit_id: str, payload: Audit, request: Request):
    if audit_id != payload.id:
        raise HTTPException(400, "The request id must match the audit id")
    collection = await audits_collection(request)
    document = payload.model_dump(mode="json")
    try:
        updated = await collection.replace_one({"id": audit_id}, document)
    except PyMongoError as exc:
        raise HTTPException(503, "Audit database is unavailable. Check MONGO_URL.") from exc
    if not updated.matched_count:
        raise HTTPException(404, "Audit not found")
    return serialize(document)


@app.delete("/audits/{audit_id}", status_code=204)
async def delete_audit(audit_id: str, request: Request):
    collection = await audits_collection(request)
    try:
        deleted = await collection.delete_one({"id": audit_id})
    except PyMongoError as exc:
        raise HTTPException(503, "Audit database is unavailable. Check MONGO_URL.") from exc
    if not deleted.deleted_count:
        raise HTTPException(404, "Audit not found")
    return Response(status_code=204)
