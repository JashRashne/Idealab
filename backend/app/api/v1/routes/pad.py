from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.db.client import get_database
from app.db.repositories.pad_repository import PadRepository
from app.models.pad import PadUpdate, PadResponse
from app.services.pad_service import PadService
from app.websockets.manager import manager

router = APIRouter()


def get_pad_service(db=Depends(get_database)) -> PadService:
    return PadService(PadRepository(db))


@router.put("/{session_id}", response_model=PadResponse)
async def update_pad(
    session_id: str,
    data: PadUpdate,
    service: PadService = Depends(get_pad_service),
    current_user: dict = Depends(get_current_user),
):
    pad = await service.update_pad(
        session_id,
        current_user["id"],
        data.content,
        data.is_private,
    )

    if not pad.get("is_private", False):
        await manager.broadcast(
            session_id,
            {
                "type": "pad_updated",
                "payload": {
                    "user_id": current_user["id"],
                    "session_id": session_id,
                    "content": data.content,
                },
            },
            exclude_user_id=current_user["id"],
        )
    return pad


@router.get("/{session_id}/{user_id}", response_model=PadResponse)
async def get_pad(
    session_id: str,
    user_id: str,
    service: PadService = Depends(get_pad_service),
    current_user: dict = Depends(get_current_user),
):
    pad = await service.get_pad(session_id, user_id)
    if not pad:
        return {
            "user_id": user_id,
            "session_id": session_id,
            "content": "",
            "updated_at": None,
            "is_private": False,
        }

    if pad.get("is_private") and current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This pad is private",
        )

    return pad
