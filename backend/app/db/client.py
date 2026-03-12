from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

_client: AsyncIOMotorClient = None
_db: AsyncIOMotorDatabase = None


async def connect_db() -> None:
    global _client, _db
    _client = AsyncIOMotorClient(
        settings.mongodb_url,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
    )
    _db = _client[settings.database_name]
    try:
        await _client.admin.command("ping")
        print(f"[DB] Connected to MongoDB Atlas — {settings.database_name}")
    except Exception as e:
        print(f"[DB] WARNING: Could not reach MongoDB — {e}")
        print("[DB] Server will still start; DB calls will fail until connection is available.")


async def close_db() -> None:
    global _client
    if _client:
        _client.close()
        print("[DB] Disconnected from MongoDB")


def get_database() -> AsyncIOMotorDatabase:
    return _db
