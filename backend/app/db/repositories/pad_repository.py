from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase


class PadRepository:
    collection_name = "pads"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db[self.collection_name]

    async def upsert(self, session_id: str, user_id: str, content: str) -> dict:
        now = datetime.now(timezone.utc).isoformat()
        await self.collection.update_one(
            {"session_id": session_id, "user_id": user_id},
            {
                "$set": {
                    "content": content,
                    "updated_at": now,
                    "session_id": session_id,
                    "user_id": user_id,
                }
            },
            upsert=True,
        )
        doc = await self.collection.find_one(
            {"session_id": session_id, "user_id": user_id}
        )
        if doc and "_id" in doc:
            del doc["_id"]
        return doc

    async def get(self, session_id: str, user_id: str) -> Optional[dict]:
        doc = await self.collection.find_one(
            {"session_id": session_id, "user_id": user_id}
        )
        if doc and "_id" in doc:
            del doc["_id"]
        return doc
