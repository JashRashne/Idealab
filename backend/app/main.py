from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.client import connect_db, close_db
from app.api.v1.router import api_router
from app.websockets.handler import websocket_endpoint


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Augenblick API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Augenblick API is running"}


@app.websocket("/ws/{session_id}")
async def websocket_route(websocket: WebSocket, session_id: str, token: str):
    await websocket_endpoint(websocket, session_id, token)
