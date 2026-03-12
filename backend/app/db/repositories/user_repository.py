from typing import Optional
from app.db.repositories.base import BaseRepository


class UserRepository(BaseRepository):
    collection_name = "users"

    async def get_by_email(self, email: str) -> Optional[dict]:
        doc = await self.collection.find_one({"email": email.lower()})
        return self._serialize(doc)

    async def get_by_username(self, username: str) -> Optional[dict]:
        doc = await self.collection.find_one({"username": username})
        return self._serialize(doc)
