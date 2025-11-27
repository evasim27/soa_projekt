from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from src.controllers.merchant_controller import (
    create_merchant_controller,
    get_all_merchants_controller,
    get_all_merchants_full_controller,
    get_merchant_full_controller,
    update_merchant_controller,
    delete_merchant_controller
)

from src.models.merchant import MerchantBase, MerchantFull, MerchantUpdate
from src.models.merchant_location import MerchantLocationCreate

router = APIRouter(prefix="/merchants", tags=["Merchants"])

class MerchantRequest(BaseModel):
    user_id: int
    business_name: str
    description: str | None = None
    location: MerchantLocationCreate


@router.post("/")
def create_merchant(request: MerchantRequest):
    return create_merchant_controller(request, request.location)


@router.get("/", response_model=List[MerchantBase])
def get_merchants():
    return get_all_merchants_controller()

@router.get("/full")
def get_all_merchants_full():
    return get_all_merchants_full_controller()


@router.get("/{merchant_id}", response_model=MerchantFull)
def get_merchant(merchant_id: int):
    return get_merchant_full_controller(merchant_id)

@router.put("/{merchant_id}")
def update_merchant(merchant_id: int, data: MerchantUpdate):
    return update_merchant_controller(merchant_id, data)

@router.delete("/{merchant_id}")
def delete_merchant(merchant_id: int):
    return delete_merchant_controller(merchant_id)