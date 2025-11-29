from fastapi import APIRouter, Query
from src.models.notification import NotificationCreate
from src.controllers.notification_controller import (
    create_notification_controller,
    get_notifications_controller,
    get_notification_controller,
    mark_read_controller,
    mark_all_read_controller,
    get_unread_count_controller,
    delete_notification_controller
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