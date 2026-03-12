from typing import List
from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.db.client import get_database
from app.db.repositories.comment_repository import CommentRepository
from app.models.comment import CommentCreate, CommentResponse
from app.services.comment_service import CommentService

router = APIRouter()


def get_comment_service(db=Depends(get_database)) -> CommentService:
    return CommentService(CommentRepository(db))


@router.post("/", response_model=CommentResponse, status_code=201)
async def add_comment(
    comment_data: CommentCreate,
    service: CommentService = Depends(get_comment_service),
    current_user: dict = Depends(get_current_user),
):
    return await service.add_comment(comment_data, current_user["_id"])


@router.get("/idea/{idea_id}", response_model=List[CommentResponse])
async def get_idea_comments(idea_id: str, service: CommentService = Depends(get_comment_service)):
    return await service.get_idea_comments(idea_id)


@router.delete("/{comment_id}", status_code=204)
async def delete_comment(
    comment_id: str,
    service: CommentService = Depends(get_comment_service),
    current_user: dict = Depends(get_current_user),
):
    await service.delete_comment(comment_id, current_user["_id"])
