from fastapi import APIRouter, Query, Depends
from pydantic import BaseModel
from typing import Optional
from src.models.notification import NotificationCreate

class BulkDeleteParams(BaseModel):
    user_id: int
    before_date: Optional[str] = None

    class Config:
        schema_extra = {
            "example": {
                "user_id": 1,
                "before_date": "2024-01-01T00:00:00Z"
            }
        }
from src.controllers.notification_controller import (
    create_notification_controller,
    get_notifications_controller,
    get_notification_controller,
    mark_read_controller,
    mark_all_read_controller,
    get_unread_count_controller,
    delete_notification_controller,
    get_notification_stats_controller,
    bulk_delete_notifications_controller,
    delete_read_notifications_controller
)

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.post("/new-offer")
def create_new_offer_notification(notification: NotificationCreate):
    return create_notification_controller(notification)

@router.post("/reservation-confirmation")
def create_reservation_confirmation(notification: NotificationCreate):
    return create_notification_controller(notification)

@router.post("/expiration-reminder")
def create_expiration_reminder(notification: NotificationCreate):
    return create_notification_controller(notification)

@router.post("/pickup-reminder")
def create_pickup_reminder(notification: NotificationCreate):
    return create_notification_controller(notification)

@router.get("")
def get_notifications(
    user_id: int = Query(..., description="User ID"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    return get_notifications_controller(user_id, limit, offset)

@router.get("/unread")
def get_unread_notifications_count(
    user_id: int = Query(..., description="User ID")
):
    return get_unread_count_controller(user_id)

@router.get("/{notification_id}")
def get_notification(notification_id: int):
    return get_notification_controller(notification_id)

@router.put("/{notification_id}/read")
def mark_notification_read(notification_id: int):
    return mark_read_controller(notification_id)

@router.put("/read-all")
def mark_all_read(
    user_id: int = Query(..., description="User ID")
):
    return mark_all_read_controller(user_id)

@router.delete("/{notification_id}")
def delete_notification(notification_id: int):
    return delete_notification_controller(notification_id)

@router.get("/stats")
def get_notification_stats(user_id: int = Query(..., description="User ID")):
    return get_notification_stats_controller(user_id)

@router.delete("/bulk")
def bulk_delete_notifications(params: BulkDeleteParams = Depends()):
    return bulk_delete_notifications_controller(params.user_id, params.before_date)

@router.delete("/read/{user_id}")
def delete_read_notifications(user_id: int):
    return delete_read_notifications_controller(user_id)