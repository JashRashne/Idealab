from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase


class BaseRepository:
    collection_name: str = ""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection: AsyncIOMotorCollection = db[self.collection_name]

    @staticmethod
    def _serialize(doc: Optional[dict]) -> Optional[dict]:
        if doc is None:
            return None
        if "_id" in doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
        return doc

    async def get_by_id(self, id: str) -> Optional[dict]:
        try:
            doc = await self.collection.find_one({"_id": ObjectId(id)})
            return self._serialize(doc)
        except Exception:
            return None

    async def create(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data.setdefault("created_at", now)
        data.setdefault("updated_at", now)
        result = await self.collection.insert_one(data)
        doc = await self.collection.find_one({"_id": result.inserted_id})
        return self._serialize(doc)

    async def update(self, id: str, data: dict) -> Optional[dict]:
        data["updated_at"] = datetime.now(timezone.utc)
        try:
            await self.collection.update_one({"_id": ObjectId(id)}, {"$set": data})
            doc = await self.collection.find_one({"_id": ObjectId(id)})
            return self._serialize(doc)
        except Exception:
            return None

    async def delete(self, id: str) -> bool:
        try:
            result = await self.collection.delete_one({"_id": ObjectId(id)})
            return result.deleted_count > 0
        except Exception:
            return False

    async def find_many(
        self, query: Dict[str, Any] = {}, limit: int = 100, skip: int = 0
    ) -> List[dict]:
        cursor = self.collection.find(query).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [self._serialize(doc) for doc in docs]
