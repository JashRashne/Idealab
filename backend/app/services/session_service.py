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
        data["status"] = "active"
        data["participant_ids"] = [owner_id]
        return await self.repo.create(data)

    async def get_sessions(self, include_closed: bool = True) -> List[dict]:
        return await self.repo.get_sessions(include_closed=include_closed)

    async def get_user_sessions(
        self, user_id: str, include_closed: bool = True
    ) -> List[dict]:
        """Returns sessions where the user is a participant (includes owner)."""
        return await self.repo.get_user_sessions(user_id, include_closed=include_closed)

    async def get_session(self, session_id: str) -> dict:
        session = await self.repo.get_by_id(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
            )
        return session

    async def join_session(self, session_id: str, user_id: str) -> dict:
        session = await self.get_session(session_id)
        participant_ids = session.get("participant_ids") or []
        if user_id not in participant_ids:
            participant_ids.append(user_id)
            return await self.repo.update(
                session_id, {"participant_ids": participant_ids}
            )
        return session

    async def end_session(self, session_id: str, user_id: str) -> dict:
        session = await self.get_session(session_id)
        if session.get("owner_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the session owner can end the session",
            )
        return await self.repo.update(
            session_id,
            {
                "is_active": False,
                "status": "closed",
                "ended_at": __import__("datetime").datetime.utcnow(),
            },
        )
