from typing import List
from app.db.repositories.base import BaseRepository


class IdeaRepository(BaseRepository):
    collection_name = "ideas"

    async def get_by_session(self, session_id: str) -> List[dict]:
        return await self.find_many({"session_id": session_id})

    async def get_children(self, parent_id: str) -> List[dict]:
        return await self.find_many({"parent_id": parent_id})
