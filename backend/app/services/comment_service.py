from typing import List
from fastapi import HTTPException, status

from app.db.repositories.comment_repository import CommentRepository
from app.models.comment import CommentCreate


class CommentService:
    def __init__(self, repo: CommentRepository):
        self.repo = repo

    async def add_comment(self, comment_data: CommentCreate, author_id: str) -> dict:
        data = comment_data.model_dump()
        data["author_id"] = author_id
        return await self.repo.create(data)

    async def get_idea_comments(self, idea_id: str) -> List[dict]:
        return await self.repo.get_by_idea(idea_id)

    async def delete_comment(self, comment_id: str, user_id: str) -> bool:
        comment = await self.repo.get_by_id(comment_id)
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
        if comment["author_id"] != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your comment")
        return await self.repo.delete(comment_id)
