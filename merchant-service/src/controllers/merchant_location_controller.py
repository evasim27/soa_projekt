from fastapi import HTTPException
from src.services.merchant_location_service import add_location, update_location, delete_location

def add_location_controller(merchant_id: int, data):
    result, error = add_location(merchant_id, data)

    if error:
        raise HTTPException(status_code=400, detail=error)

    return result

def update_location_controller(merchant_id, location_id, data):
    updated = update_location(merchant_id, location_id, data)
        
    if not updated:
        raise HTTPException(status_code=404, detail="Location not found")
    
    if updated == "duplicate_location":
        raise HTTPException(status_code=400, detail="Location already exists for this merchant")
    
    return updated

def delete_location_controller(merchant_id: int, location_id: int):
    result = delete_location(merchant_id, location_id)

    if result is None:
        raise HTTPException(status_code=404, detail="Location not found")

    return {"detail": "Location deleted successfully"}