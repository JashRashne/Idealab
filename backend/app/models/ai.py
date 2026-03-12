from typing import List, Optional
from pydantic import BaseModel


class AIPromptRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    max_tokens: Optional[int] = 1024


# Matches frontend AIJob type exactly
class AIJobResponse(BaseModel):
    id: str
    session_id: str
    type: str  # "expand" | "summarize" | "merge"
    input_idea_ids: List[str]
    output: str
    created_at: str


class AIExpandRequest(BaseModel):
    idea_id: str


class AISummarizeRequest(BaseModel):
    session_id: str


class AIMergeRequest(BaseModel):
    idea_id_1: str
    idea_id_2: str


class AISuggestRequest(BaseModel):
    session_id: str
    existing_ideas: List[str] = []


class AIResponse(BaseModel):
    content: str
    model: str
    tokens_used: Optional[int] = None
