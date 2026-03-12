from typing import List
from fastapi import HTTPException, status

from app.db.repositories.idea_repository import IdeaRepository
from app.models.idea import IdeaCreate, IdeaUpdate


class IdeaService:
    def __init__(self, repo: IdeaRepository):
        self.repo = repo

    async def create_idea(self, idea_data: IdeaCreate, author_id: str) -> dict:
        data = idea_data.model_dump()
        data["created_by"] = author_id
        data["votes"] = []
        data["status"] = "active"
        return await self.repo.create(data)

    async def get_session_ideas(self, session_id: str) -> List[dict]:
        return await self.repo.get_by_session(session_id)

    async def get_idea_tree(self, session_id: str) -> List[dict]:
        ideas = await self.repo.get_by_session(session_id)
        return self._build_tree(ideas)

    def _build_tree(self, ideas: List[dict]) -> List[dict]:
        by_id = {idea["id"]: {"idea": idea, "children": []} for idea in ideas}
        roots = []
        for idea in ideas:
            parent_id = idea.get("parent_idea_id")
            if parent_id and parent_id in by_id:
                by_id[parent_id]["children"].append(by_id[idea["id"]])
            else:
                roots.append(by_id[idea["id"]])
        return roots

    async def update_idea(
        self, idea_id: str, update_data: IdeaUpdate, user_id: str
    ) -> dict:
        idea = await self.repo.get_by_id(idea_id)
        if not idea:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found"
            )
        if idea["created_by"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not your idea"
            )
        return await self.repo.update(idea_id, update_data.model_dump(exclude_unset=True))

    async def update_idea_status(
        self, idea_id: str, new_status: str, user_id: str
    ) -> dict:
        idea = await self.repo.get_by_id(idea_id)
        if not idea:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found"
            )
        return await self.repo.update(idea_id, {"status": new_status})

    async def delete_idea(self, idea_id: str, user_id: str) -> bool:
        idea = await self.repo.get_by_id(idea_id)
        if not idea:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found"
            )
        if idea["created_by"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not your idea"
            )
        return await self.repo.delete(idea_id)

    async def vote_idea(self, idea_id: str, user_id: str) -> dict:
        idea = await self.repo.get_by_id(idea_id)
        if not idea:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found"
            )
        votes: List[str] = idea.get("votes") or []
        if user_id in votes:
            votes = [v for v in votes if v != user_id]
        else:
            votes = [*votes, user_id]
        return await self.repo.update(idea_id, {"votes": votes})
