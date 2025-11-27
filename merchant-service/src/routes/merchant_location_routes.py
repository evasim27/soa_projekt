from fastapi import APIRouter
from src.models.merchant_location import MerchantLocationCreate, MerchantLocationUpdate
from src.controllers.merchant_location_controller import add_location_controller, update_location_controller, delete_location_controller

router = APIRouter(prefix="/merchants", tags=["Merchant Locations"])

@router.post("/{merchant_id}/locations")
def add_location(merchant_id: int, request: MerchantLocationCreate):
    return add_location_controller(merchant_id, request)

@router.put("/{merchant_id}/locations/{location_id}")
def update_location(merchant_id: int, location_id: int, data: MerchantLocationUpdate):
    return update_location_controller(merchant_id, location_id, data)

@router.delete("/{merchant_id}/locations/{location_id}")
def delete_location(merchant_id: int, location_id: int):
    return delete_location_controller(merchant_id, location_id)
