from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.dependencies import get_current_user
from app.db.client import get_database
from app.db.repositories.idea_repository import IdeaRepository
from app.db.repositories.session_repository import SessionRepository
from app.models.idea import IdeaCreate, IdeaUpdate, IdeaResponse, IdeaNode
from app.services.idea_service import IdeaService
from app.websockets.manager import manager

router = APIRouter()


def get_idea_service(db=Depends(get_database)) -> IdeaService:
    return IdeaService(IdeaRepository(db))


@router.post("/", response_model=IdeaResponse, status_code=201)
async def create_idea(
    idea_data: IdeaCreate,
    service: IdeaService = Depends(get_idea_service),
    current_user: dict = Depends(get_current_user),
):
    idea = await service.create_idea(idea_data, current_user["id"])
    await manager.broadcast(
        idea["session_id"],
        {"type": "idea_added", "payload": {"idea": idea}},
        exclude_user_id=current_user["id"],
    )
    return idea


@router.get("/tree/{session_id}", response_model=List[IdeaNode])
async def get_idea_tree(
    session_id: str, service: IdeaService = Depends(get_idea_service)
):
    return await service.get_idea_tree(session_id)


@router.get("/session/{session_id}", response_model=List[IdeaResponse])
async def get_session_ideas(
    session_id: str, service: IdeaService = Depends(get_idea_service)
):
    return await service.get_session_ideas(session_id)


@router.patch("/{idea_id}", response_model=IdeaResponse)
async def update_idea(
    idea_id: str,
    update_data: IdeaUpdate,
    service: IdeaService = Depends(get_idea_service),
    current_user: dict = Depends(get_current_user),
):
    idea = await service.update_idea(idea_id, update_data, current_user["id"])
    await manager.broadcast(
        idea["session_id"],
        {"type": "vote_updated", "payload": {"idea": idea}},
        exclude_user_id=current_user["id"],
    )
    return idea


@router.patch("/{idea_id}/status", response_model=IdeaResponse)
async def update_idea_status(
    idea_id: str,
    status: str = Query(...),
    service: IdeaService = Depends(get_idea_service),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database),
):
    idea_repo = IdeaRepository(db)
    idea = await idea_repo.get_by_id(idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    if status == "merged":
        session_repo = SessionRepository(db)
        session = await session_repo.get_by_id(idea["session_id"])
        if not session or session.get("owner_id") != current_user["id"]:
            raise HTTPException(
                status_code=403,
                detail="Only the session owner can mark ideas as merged",
            )
    elif status == "shortlisted":
        session_repo = SessionRepository(db)
        session = await session_repo.get_by_id(idea["session_id"])
        is_idea_owner = idea.get("created_by") == current_user["id"]
        is_session_owner = bool(session and session.get("owner_id") == current_user["id"])
        if not (is_idea_owner or is_session_owner):
            raise HTTPException(
                status_code=403,
                detail="Only the idea owner or session owner can shortlist this idea",
            )
    else:
        if idea.get("created_by") != current_user["id"]:
            raise HTTPException(
                status_code=403,
                detail="Only the idea creator can change its status",
            )

    updated = await service.update_idea_status(idea_id, status, current_user["id"])
    await manager.broadcast(
        updated["session_id"],
        {"type": "vote_updated", "payload": {"idea": updated}},
        exclude_user_id=current_user["id"],
    )
    return updated


@router.delete("/{idea_id}", status_code=204)
async def delete_idea(
    idea_id: str,
    service: IdeaService = Depends(get_idea_service),
    current_user: dict = Depends(get_current_user),
):
    await service.delete_idea(idea_id, current_user["id"])


@router.post("/{idea_id}/vote", response_model=IdeaResponse)
async def vote_idea(
    idea_id: str,
    service: IdeaService = Depends(get_idea_service),
    current_user: dict = Depends(get_current_user),
):
    idea = await service.vote_idea(idea_id, current_user["id"])
    await manager.broadcast(
        idea["session_id"],
        {"type": "vote_updated", "payload": {"idea": idea}},
        exclude_user_id=current_user["id"],
    )
    return idea
