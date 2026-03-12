from typing import List
from fastapi import HTTPException, status

from app.db.repositories.idea_repository import IdeaRepository
from app.models.idea import IdeaCreate, IdeaUpdate


class IdeaService:
    def __init__(self, repo: IdeaRepository):
        self.repo = repo

    async def create_idea(self, idea_data: IdeaCreate, author_id: str) -> dict:
        data = idea_data.model_dump()
        data["author_id"] = author_id
        data["votes"] = 0
        return await self.repo.create(data)

    async def get_session_ideas(self, session_id: str) -> List[dict]:
        return await self.repo.get_by_session(session_id)

    async def update_idea(self, idea_id: str, update_data: IdeaUpdate, user_id: str) -> dict:
        idea = await self.repo.get_by_id(idea_id)
        if not idea:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found")
        if idea["author_id"] != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your idea")
        return await self.repo.update(idea_id, update_data.model_dump(exclude_unset=True))

    async def delete_idea(self, idea_id: str, user_id: str) -> bool:
        idea = await self.repo.get_by_id(idea_id)
        if not idea:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found")
        if idea["author_id"] != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your idea")
        return await self.repo.delete(idea_id)

    async def vote_idea(self, idea_id: str, increment: int = 1) -> dict:
        idea = await self.repo.get_by_id(idea_id)
        if not idea:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found")
        return await self.repo.update(idea_id, {"votes": idea.get("votes", 0) + increment})
