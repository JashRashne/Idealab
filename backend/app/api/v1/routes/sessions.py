from typing import List
from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.db.client import get_database
from app.db.repositories.session_repository import SessionRepository
from app.models.session import SessionCreate, SessionResponse
from app.services.session_service import SessionService

router = APIRouter()


def get_session_service(db=Depends(get_database)) -> SessionService:
    return SessionService(SessionRepository(db))


@router.post("/", response_model=SessionResponse, status_code=201)
async def create_session(
    session_data: SessionCreate,
    service: SessionService = Depends(get_session_service),
    current_user: dict = Depends(get_current_user),
):
    return await service.create_session(session_data, current_user["_id"])


@router.get("/", response_model=List[SessionResponse])
async def list_sessions(service: SessionService = Depends(get_session_service)):
    return await service.get_sessions()


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, service: SessionService = Depends(get_session_service)):
    return await service.get_session(session_id)


@router.post("/{session_id}/join", response_model=SessionResponse)
async def join_session(
    session_id: str,
    service: SessionService = Depends(get_session_service),
    current_user: dict = Depends(get_current_user),
):
    return await service.join_session(session_id, current_user["_id"])
