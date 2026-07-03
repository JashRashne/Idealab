from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.db.client import get_database
from app.db.repositories.idea_repository import IdeaRepository
from app.models.ai import (
    AIExpandRequest,
    AISummarizeRequest,
    AIMergeRequest,
    AIJobResponse,
    AIPromptRequest,
    AIResponse,
)
from app.models.idea import IdeaResponse
from app.services.ai_service import AIService
from app.services.idea_service import IdeaService
from app.websockets.manager import manager

router = APIRouter()
_ai_service = AIService()


def get_idea_repo(db=Depends(get_database)) -> IdeaRepository:
    return IdeaRepository(db)


def get_idea_service(db=Depends(get_database)) -> IdeaService:
    return IdeaService(IdeaRepository(db))


@router.post("/expand", response_model=AIJobResponse)
async def expand_idea(
    request: AIExpandRequest,
    repo: IdeaRepository = Depends(get_idea_repo),
    _=Depends(get_current_user),
):
    idea = await repo.get_by_id(request.idea_id)
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found"
        )
    return await _ai_service.expand_idea(idea)


@router.post("/summarize", response_model=AIJobResponse)
async def summarize_session(
    request: AISummarizeRequest,
    repo: IdeaRepository = Depends(get_idea_repo),
    _=Depends(get_current_user),
):
    ideas = await repo.get_by_session(request.session_id)
    return await _ai_service.summarize_session(request.session_id, ideas)


@router.post("/merge", response_model=IdeaResponse)
async def merge_ideas(
    request: AIMergeRequest,
    repo: IdeaRepository = Depends(get_idea_repo),
    service: IdeaService = Depends(get_idea_service),
    current_user: dict = Depends(get_current_user),
):
    idea1 = await repo.get_by_id(request.idea_id_1)
    idea2 = await repo.get_by_id(request.idea_id_2)
    if not idea1 or not idea2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both ideas not found",
        )
    merged_data = await _ai_service.merge_ideas(idea1, idea2)
    # Persist the merged idea via IdeaService so it gets created_at/updated_at
    from app.models.idea import IdeaCreate
    idea_create = IdeaCreate(
        session_id=merged_data["session_id"],
        title=merged_data["title"],
        content=merged_data["content"],
        branch_name=merged_data["branch_name"],
        parent_idea_id=None,
        tags=merged_data["tags"],
    )
    idea = await service.create_idea(idea_create, current_user["id"])
    # Force status to merged
    idea = await repo.update(idea["id"], {"status": "merged"})
    await manager.broadcast(
        idea["session_id"],
        {"type": "idea_added", "payload": {"idea": idea}},
        exclude_user_id=current_user["id"],
    )
    return idea


@router.post("/chat", response_model=AIResponse)
async def chat(request: AIPromptRequest, _=Depends(get_current_user)):
    return await _ai_service.chat(request)
