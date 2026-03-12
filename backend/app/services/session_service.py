from typing import List
from fastapi import HTTPException, status

from app.db.repositories.session_repository import SessionRepository
from app.models.session import SessionCreate, SessionUpdate


class SessionService:
    def __init__(self, repo: SessionRepository):
        self.repo = repo

    async def create_session(self, session_data: SessionCreate, owner_id: str) -> dict:
        data = session_data.model_dump()
        data["owner_id"] = owner_id
        data["is_active"] = True
        data["participants"] = [owner_id]
        return await self.repo.create(data)

    async def get_sessions(self) -> List[dict]:
        return await self.repo.get_active_sessions()

    async def get_session(self, session_id: str) -> dict:
        session = await self.repo.get_by_id(session_id)
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        return session

    async def join_session(self, session_id: str, user_id: str) -> dict:
        session = await self.get_session(session_id)
        participants = session.get("participants", [])
        if user_id not in participants:
            participants.append(user_id)
            return await self.repo.update(session_id, {"participants": participants})
        return session
