from pydantic import BaseModel
from typing import List, Optional
from src.models.merchant_location import MerchantLocation

class MerchantBase(BaseModel):
    id: int
    user_id: int
    business_name: str
    description: str | None = None

class MerchantFull(MerchantBase):
    locations: List[MerchantLocation] = []  

    class Config:
        orm_mode = True


class MerchantUpdate(BaseModel):
    business_name: Optional[str] = None
    description: Optional[str] = None



