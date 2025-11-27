from pydantic import BaseModel
from typing import List, Optional
from src.models.merchant_hours import MerchantHours

class MerchantLocationCreate(BaseModel):
    address: str
    city: str
    postal_code: str

class MerchantLocation(BaseModel):
    id: int
    merchant_id: int
    address: str
    city: str
    postal_code: str
    hours: List[MerchantHours] = []

    class Config:
        orm_mode = True

class MerchantLocationUpdate(BaseModel):
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None