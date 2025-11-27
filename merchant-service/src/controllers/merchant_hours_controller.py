from fastapi import HTTPException
from src.services.merchant_service import merchant_exists
from src.services.merchant_location_service import location_exists
from src.services.merchant_hours_service import add_hours, update_hours, delete_hour

def add_hours_controller(merchant_id: int, location_id: int, data):
    if not merchant_exists(merchant_id):
        raise HTTPException(status_code=404, detail="Merchant not found")

    if not location_exists(location_id):
        raise HTTPException(status_code=404, detail="Location not found")

    result, error = add_hours(location_id, data)

    if error:
        raise HTTPException(status_code=400, detail=error)

    return result

def update_hours_controller(merchant_id, location_id, hour_id, data):
    updated = update_hours(merchant_id, location_id, hour_id, data)

    if updated is None:
        raise HTTPException(status_code=404, detail="Location not found")

    if updated == "hours_not_found":
        raise HTTPException(status_code=404, detail="Hours entry not found")

    return updated

def delete_hour_controller(merchant_id: int, location_id: int, hour_id: int):
    result = delete_hour(merchant_id, location_id, hour_id)

    if result is None:
        raise HTTPException(status_code=404, detail="Location not found")

    if result == "not_found":
        raise HTTPException(status_code=404, detail="Hours entry not found")

    return {"detail": "Hour deleted successfully"}