from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.common import TimestampedModel, IdeaStatus


class IdeaBase(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    branch_name: str = "main"


class IdeaCreate(IdeaBase):
    session_id: str
    parent_idea_id: Optional[str] = None


class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    branch_name: Optional[str] = None
    status: Optional[IdeaStatus] = None


class IdeaInDB(IdeaBase, TimestampedModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = None
    session_id: str
    parent_idea_id: Optional[str] = None
    created_by: str
    status: IdeaStatus = IdeaStatus.ACTIVE
    votes: List[str] = []  # list of user_id strings


class IdeaResponse(IdeaBase, TimestampedModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = None
    session_id: str
    parent_idea_id: Optional[str] = None
    created_by: str
    status: IdeaStatus = IdeaStatus.ACTIVE
    votes: List[str] = []  # list of user_id strings


class IdeaNode(BaseModel):
    idea: IdeaResponse
    children: List["IdeaNode"] = []

    model_config = ConfigDict(arbitrary_types_allowed=True)


IdeaNode.model_rebuild()


class IdeaListResponse(BaseModel):
    ideas: List[IdeaResponse]
    total: int