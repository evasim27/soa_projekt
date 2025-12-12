from fastapi import APIRouter, Depends
from src.utils.auth import verify_token
from src.models.merchant_location import MerchantLocationCreate, MerchantLocationUpdate
from src.controllers.merchant_location_controller import add_location_controller, update_location_controller, delete_location_controller

router = APIRouter(prefix="/merchants", tags=["Merchant Locations"])

@router.post("/{merchant_id}/locations")
def add_location(merchant_id: int, request: MerchantLocationCreate, user=Depends(verify_token)):
    return add_location_controller(merchant_id, request)

@router.put("/{merchant_id}/locations/{location_id}")
def update_location(merchant_id: int, location_id: int, data: MerchantLocationUpdate, user=Depends(verify_token)):
    return update_location_controller(merchant_id, location_id, data)

@router.delete("/{merchant_id}/locations/{location_id}")
def delete_location(merchant_id: int, location_id: int, user=Depends(verify_token)):
    return delete_location_controller(merchant_id, location_id)
