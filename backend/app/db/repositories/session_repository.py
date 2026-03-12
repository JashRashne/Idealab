from typing import List
from app.db.repositories.base import BaseRepository


class SessionRepository(BaseRepository):
    collection_name = "sessions"

    async def get_by_owner(self, owner_id: str) -> List[dict]:
        return await self.find_many({"owner_id": owner_id})

    async def get_active_sessions(self) -> List[dict]:
        return await self.find_many({"is_active": True})
