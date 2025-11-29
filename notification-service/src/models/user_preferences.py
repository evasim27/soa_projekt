from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserPreferencesBase(BaseModel):
    user_id: int
    new_offers_enabled: bool = True
    reservation_confirmations_enabled: bool = True
    expiration_reminders_enabled: bool = True
    pickup_reminders_enabled: bool = True
    preferred_channel: str = "in_app"

class UserPreferencesCreate(UserPreferencesBase):
    pass

class UserPreferencesResponse(UserPreferencesBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserPreferencesUpdate(BaseModel):
    new_offers_enabled: Optional[bool] = None
    reservation_confirmations_enabled: Optional[bool] = None
    expiration_reminders_enabled: Optional[bool] = None
    pickup_reminders_enabled: Optional[bool] = None
    preferred_channel: Optional[str] = None