from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from app.models.common import TimestampedModel, IdeaStatus
from app.models.user import UserResponse  # real import, not TYPE_CHECKING


class VoteRecord(BaseModel):
    user_id: str
    voted_at: datetime = Field(default_factory=datetime.utcnow)


class IdeaBase(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    branch_name: str = "main"


class IdeaCreate(IdeaBase):
    session_id: str
    parent_id: Optional[str] = None


class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    branch_name: Optional[str] = None
    status: Optional[IdeaStatus] = None


class IdeaInDB(IdeaBase, TimestampedModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    session_id: str
    parent_id: Optional[str] = None
    author_id: str
    status: IdeaStatus = IdeaStatus.ACTIVE
    votes: List[VoteRecord] = []
    vote_count: int = 0
    children_count: int = 0
    is_ai_generated: bool = False


class IdeaResponse(IdeaBase, TimestampedModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    session_id: str
    parent_id: Optional[str] = None
    author_id: str
    status: IdeaStatus = IdeaStatus.ACTIVE
    votes: List[VoteRecord] = []
    vote_count: int = 0
    children_count: int = 0
    is_ai_generated: bool = False
    has_voted: bool = False
    author: Optional[UserResponse] = None  # no quotes needed, real import


class IdeaNode(BaseModel):
    idea: IdeaResponse
    children: List["IdeaNode"] = []        # quotes only for self-reference

    model_config = ConfigDict(arbitrary_types_allowed=True)


IdeaNode.model_rebuild()


class IdeaListResponse(BaseModel):
    ideas: List[IdeaResponse]
    total: int