from typing import List
from app.db.repositories.base import BaseRepository


class CommentRepository(BaseRepository):
    collection_name = "comments"

    async def get_by_idea(self, idea_id: str) -> List[dict]:
        return await self.find_many({"idea_id": idea_id})
