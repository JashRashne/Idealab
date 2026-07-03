from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.db.client import get_database
from app.db.repositories.comment_repository import CommentRepository
from app.db.repositories.idea_repository import IdeaRepository
from app.models.comment import CommentCreate, CommentResponse
from app.services.comment_service import CommentService
from app.websockets.manager import manager

router = APIRouter()


class ReactBody(BaseModel):
    emoji: str


def get_comment_service(db=Depends(get_database)) -> CommentService:
    return CommentService(CommentRepository(db))


@router.post("/", response_model=CommentResponse, status_code=201)
async def add_comment(
    comment_data: CommentCreate,
    service: CommentService = Depends(get_comment_service),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database),
):
    comment = await service.add_comment(comment_data, current_user["id"])
    # Broadcast to the session so other participants know to refresh comments
    idea = await IdeaRepository(db).get_by_id(comment_data.idea_id)
    if idea:
        await manager.broadcast(
            idea["session_id"],
            {"type": "comment_added", "payload": {"idea_id": comment["idea_id"]}},
            exclude_user_id=current_user["id"],
        )
    return comment


# GET /comments/{idea_id}  — matches frontend getComments call
@router.get("/{idea_id}", response_model=List[CommentResponse])
async def get_idea_comments(
    idea_id: str, service: CommentService = Depends(get_comment_service)
):
    return await service.get_idea_comments(idea_id)


@router.post("/{comment_id}/react", response_model=CommentResponse)
async def react_to_comment(
    comment_id: str,
    body: ReactBody,
    service: CommentService = Depends(get_comment_service),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database),
):
    comment = await service.react_to_comment(comment_id, current_user["id"], body.emoji)
    idea = await IdeaRepository(db).get_by_id(comment["idea_id"])
    if idea:
        await manager.broadcast(
            idea["session_id"],
            {
                "type": "comment_reaction_updated",
                "payload": {"comment_id": comment_id, "idea_id": comment["idea_id"]},
            },
            exclude_user_id=current_user["id"],
        )
    return comment


@router.delete("/{comment_id}", status_code=204)
async def delete_comment(
    comment_id: str,
    service: CommentService = Depends(get_comment_service),
    current_user: dict = Depends(get_current_user),
):
    await service.delete_comment(comment_id, current_user["id"])
