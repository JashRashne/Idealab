from fastapi import APIRouter

from app.api.v1.routes import auth, ideas, sessions, comments, ai

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(ideas.router, prefix="/ideas", tags=["ideas"])
api_router.include_router(comments.router, prefix="/comments", tags=["comments"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])


@api_router.get("/hello")
async def hello():
    return {"message": "Hello from Augenblick API 👋"}
