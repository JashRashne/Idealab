from typing import List, Optional
from pydantic import BaseModel


class AIPromptRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    max_tokens: Optional[int] = 1024


class AIExpandRequest(BaseModel):
    idea_title: str
    idea_content: str
    context: Optional[str] = None


class AISuggestRequest(BaseModel):
    session_id: str
    existing_ideas: List[str] = []


class AIResponse(BaseModel):
    content: str
    model: str
    tokens_used: Optional[int] = None
