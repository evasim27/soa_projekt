from pydantic import BaseModel, Field, validator
from datetime import time
from typing import Optional

class MerchantHoursCreate(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    open_time: time | None = None
    close_time: time | None = None

    @validator("close_time")
    def validate_times(cls, close_time, values):
        open_time = values.get("open_time")
        if open_time and close_time and open_time >= close_time:
            raise ValueError("open_time must be earlier than close_time")
        return close_time


class MerchantHours(BaseModel):
    id: int
    location_id: int
    day_of_week: int
    open_time: str | None
    close_time: str | None

    class Config:
        orm_mode = True

class MerchantHoursUpdate(BaseModel):
    day_of_week: Optional[int] = Field(default=None, ge=0, le=6)
    open_time: Optional[str] = None
    close_time: Optional[str] = None