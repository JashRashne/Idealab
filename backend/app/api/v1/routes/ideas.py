from typing import List
from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.db.client import get_database
from app.db.repositories.idea_repository import IdeaRepository
from app.models.idea import IdeaCreate, IdeaUpdate, IdeaResponse
from app.services.idea_service import IdeaService

router = APIRouter()


def get_idea_service(db=Depends(get_database)) -> IdeaService:
    return IdeaService(IdeaRepository(db))


@router.post("/", response_model=IdeaResponse, status_code=201)
async def create_idea(
    idea_data: IdeaCreate,
    service: IdeaService = Depends(get_idea_service),
    current_user: dict = Depends(get_current_user),
):
    return await service.create_idea(idea_data, current_user["_id"])


@router.get("/session/{session_id}", response_model=List[IdeaResponse])
async def get_session_ideas(session_id: str, service: IdeaService = Depends(get_idea_service)):
    return await service.get_session_ideas(session_id)


@router.patch("/{idea_id}", response_model=IdeaResponse)
async def update_idea(
    idea_id: str,
    update_data: IdeaUpdate,
    service: IdeaService = Depends(get_idea_service),
    current_user: dict = Depends(get_current_user),
):
    return await service.update_idea(idea_id, update_data, current_user["_id"])


@router.delete("/{idea_id}", status_code=204)
async def delete_idea(
    idea_id: str,
    service: IdeaService = Depends(get_idea_service),
    current_user: dict = Depends(get_current_user),
):
    await service.delete_idea(idea_id, current_user["_id"])


@router.post("/{idea_id}/vote", response_model=IdeaResponse)
async def vote_idea(idea_id: str, service: IdeaService = Depends(get_idea_service)):
    return await service.vote_idea(idea_id)
