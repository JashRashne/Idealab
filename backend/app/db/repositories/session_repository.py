from typing import List
from app.db.repositories.base import BaseRepository


class SessionRepository(BaseRepository):
    collection_name = "sessions"

    async def get_by_owner(self, owner_id: str) -> List[dict]:
        return await self.find_many({"owner_id": owner_id})

    async def get_active_sessions(self) -> List[dict]:
        return await self.find_many({"status": "active"})

    async def get_sessions(self, include_closed: bool = True) -> List[dict]:
        if include_closed:
            return await self.find_many({})
        return await self.get_active_sessions()

    async def get_user_sessions(
        self, user_id: str, include_closed: bool = True
    ) -> List[dict]:
        """Returns sessions where the user is in participant_ids."""
        query: dict = {"participant_ids": user_id}
        if not include_closed:
            query["status"] = "active"
        return await self.find_many(query)
