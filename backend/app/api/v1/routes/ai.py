from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.models.ai import AIPromptRequest, AIExpandRequest, AISuggestRequest, AIResponse
from app.services.ai_service import AIService

router = APIRouter()
_ai_service = AIService()


@router.post("/chat", response_model=AIResponse)
async def chat(request: AIPromptRequest, _=Depends(get_current_user)):
    return await _ai_service.chat(request)


@router.post("/expand", response_model=AIResponse)
async def expand_idea(request: AIExpandRequest, _=Depends(get_current_user)):
    return await _ai_service.expand_idea(request)


@router.post("/suggest", response_model=AIResponse)
async def suggest_ideas(request: AISuggestRequest, _=Depends(get_current_user)):
    return await _ai_service.suggest_ideas(request)
