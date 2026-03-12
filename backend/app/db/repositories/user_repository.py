from typing import List, Optional
from bson import ObjectId
from app.db.repositories.base import BaseRepository


class UserRepository(BaseRepository):
    collection_name = "users"

    async def get_by_email(self, email: str) -> Optional[dict]:
        doc = await self.collection.find_one({"email": email.lower()})
        return self._serialize(doc)

    async def get_by_username(self, username: str) -> Optional[dict]:
        doc = await self.collection.find_one({"username": username})
        return self._serialize(doc)

    async def get_by_ids(self, ids: List[str]) -> List[dict]:
        oid_list = []
        for id_ in ids:
            try:
                oid_list.append(ObjectId(id_))
            except Exception:
                pass
        if not oid_list:
            return []
        cursor = self.collection.find({"_id": {"$in": oid_list}})
        docs = await cursor.to_list(length=len(oid_list))
        return [self._serialize(doc) for doc in docs if doc]
