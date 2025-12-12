from fastapi import APIRouter, Depends
from src.utils.auth import verify_token
from src.models.merchant_hours import MerchantHoursCreate, MerchantHoursUpdate
from src.controllers.merchant_hours_controller import add_hours_controller, update_hours_controller, delete_hour_controller

router = APIRouter(prefix="/merchants", tags=["Merchant Hours"])

@router.post("/{merchant_id}/locations/{location_id}/hours")
def add_hours(merchant_id: int, location_id: int, request: MerchantHoursCreate, user=Depends(verify_token)):
    return add_hours_controller(merchant_id, location_id, request)

@router.put("/{merchant_id}/locations/{location_id}/hours/{hour_id}")
def update_hours(merchant_id: int, location_id: int, hour_id: int, data: MerchantHoursUpdate, user=Depends(verify_token)):
    return update_hours_controller(merchant_id, location_id, hour_id, data)

@router.delete("/{merchant_id}/locations/{location_id}/hours/{hour_id}")
def delete_hour(merchant_id: int, location_id: int, hour_id: int, user=Depends(verify_token)):
    return delete_hour_controller(merchant_id, location_id, hour_id)
