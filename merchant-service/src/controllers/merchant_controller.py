from fastapi import HTTPException
from src.services.merchant_service import (
    create_merchant,
    get_all_merchants,
    get_merchant_full,
    get_all_merchants_full,
    update_merchant,
    delete_merchant
)

def create_merchant_controller(data, location_data):
    result, error = create_merchant(data, location_data)

    if error:
        raise HTTPException(status_code=400, detail=error)

    return result


def get_all_merchants_controller():
    merchants = get_all_merchants()
    return merchants


def get_merchant_full_controller(merchant_id: int):
    merchant = get_merchant_full(merchant_id)

    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")

    return merchant

def get_all_merchants_full_controller():
    full_merchants = get_all_merchants_full()
    return full_merchants

def update_merchant_controller(merchant_id, data):
    updated = update_merchant(merchant_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return updated

def delete_merchant_controller(merchant_id: int):
    result = delete_merchant(merchant_id)

    if result is None:
        raise HTTPException(status_code=404, detail="Merchant not found")

    return {"detail": "Merchant deleted successfully"}