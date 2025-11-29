from fastapi import HTTPException
from src.models.notification import NotificationCreate
from src.services.notification_service import (
    create_notification,
    get_notifications_by_user,
    get_notification_by_id,
    mark_notification_as_read,
    mark_all_as_read,
    get_unread_count,
    delete_notification
)
from src.utils.user_client import get_user

def create_notification_controller(notification: NotificationCreate):
    try:
        result = create_notification(notification)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_notifications_controller(user_id: int, limit: int = 50, offset: int = 0):
    try:
        notifications = get_notifications_by_user(user_id, limit, offset)
        return notifications
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_notification_controller(notification_id: int):
    notification = get_notification_by_id(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

def mark_read_controller(notification_id: int):
    result = mark_notification_as_read(notification_id)
    if not result:
        raise HTTPException(status_code=404, detail="Notification not found")
    return result

def mark_all_read_controller(user_id: int):
    try:
        count = mark_all_as_read(user_id)
        return {"message": f"Marked {count} notifications as read"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_unread_count_controller(user_id: int):
    try:
        count = get_unread_count(user_id)
        return {"unread_count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def delete_notification_controller(notification_id: int):
    success = delete_notification(notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted successfully"}