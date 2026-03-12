from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from app.models.common import TimestampedModel
from app.models.user import UserResponse


class ReactionRecord(BaseModel):
    user_id: str
    emoji: str
    reacted_at: datetime = Field(default_factory=datetime.utcnow)


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    idea_id: str                        # maps to IdeaInDB._id


class CommentUpdate(BaseModel):
    content: Optional[str] = None


class CommentInDB(CommentBase, TimestampedModel):
    """
    Mirrors the MongoDB document exactly.
    Never return this directly from a route — use CommentResponse.
    """
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = None
    idea_id: str
    author_id: str
    reactions: List[ReactionRecord] = []
    is_edited: bool = False

class CommentResponse(CommentBase, TimestampedModel):
    """
    Returned by API.
    """
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = None
    idea_id: str
    author_id: str
    reactions: List[ReactionRecord] = []
    is_edited: bool = False


class CommentListResponse(BaseModel):
    comments: List[CommentResponse]
    total: int