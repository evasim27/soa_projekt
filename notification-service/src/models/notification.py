from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    user_id: int
    type: str
    title: str
    message: str
    offer_id: Optional[int] = None
    order_id: Optional[int] = None
    status: str = "pending"
    channel: str = "in_app"

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: int
    created_at: datetime
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    status: Optional[str] = None
    read_at: Optional[datetime] = None