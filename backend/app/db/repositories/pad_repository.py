from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase


class PadRepository:
    collection_name = "pads"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db[self.collection_name]

    async def upsert(
        self,
        session_id: str,
        user_id: str,
        content: str,
        is_private: Optional[bool] = None,
    ) -> dict:
        now = datetime.now(timezone.utc).isoformat()
        update_payload = {
            "content": content,
            "updated_at": now,
            "session_id": session_id,
            "user_id": user_id,
        }
        if is_private is not None:
            update_payload["is_private"] = is_private

        await self.collection.update_one(
            {"session_id": session_id, "user_id": user_id},
            {"$set": update_payload},
            upsert=True,
        )
        doc = await self.collection.find_one(
            {"session_id": session_id, "user_id": user_id}
        )
        if doc and "_id" in doc:
            del doc["_id"]
        if doc is not None and "is_private" not in doc:
            doc["is_private"] = False
        return doc

    async def get(self, session_id: str, user_id: str) -> Optional[dict]:
        doc = await self.collection.find_one(
            {"session_id": session_id, "user_id": user_id}
        )
        if doc and "_id" in doc:
            del doc["_id"]
        if doc is not None and "is_private" not in doc:
            doc["is_private"] = False
        return doc
