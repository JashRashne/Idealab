from typing import Optional

from pydantic import BaseModel


class PadUpdate(BaseModel):
    content: str
    is_private: Optional[bool] = None


class PadResponse(BaseModel):
    user_id: str
    session_id: str
    content: str
    updated_at: Optional[str] = None
    is_private: bool = False
