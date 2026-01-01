from fastapi import HTTPException, Request
from src.models.notification import NotificationCreate
from src.services.notification_service import (
    create_notification,
    get_notifications_by_user,
    get_notification_by_id,
    mark_notification_as_read,
    mark_all_as_read,
    get_unread_count,
    delete_notification,
    get_notification_stats,
    bulk_delete_notifications,
    delete_read_notifications
)
from src.utils.user_client import get_user
from src.utils.rabbitmq_logger import rabbitmq_logger

def create_notification_controller(notification: NotificationCreate, request: Request = None):
    try:
        result = create_notification(notification)
        return result
    except Exception as e:
        if request:
            correlation_id = getattr(request.state, 'correlation_id', 'N/A')
            rabbitmq_logger.log_error(
                url=str(request.url),
                correlation_id=correlation_id,
                message=f"Error creating notification: {str(e)}"
            )
        raise HTTPException(status_code=500, detail=str(e))

def get_notifications_controller(user_id: int, limit: int = 50, offset: int = 0, request: Request = None):
    try:
        notifications = get_notifications_by_user(user_id, limit, offset)
        return notifications
    except Exception as e:
        if request:
            correlation_id = getattr(request.state, 'correlation_id', 'N/A')
            rabbitmq_logger.log_error(
                url=str(request.url),
                correlation_id=correlation_id,
                message=f"Error getting notifications for user {user_id}: {str(e)}"
            )
        raise HTTPException(status_code=500, detail=str(e))

def get_notification_controller(notification_id: int, request: Request = None):
    notification = get_notification_by_id(notification_id)
    if not notification:
        if request:
            correlation_id = getattr(request.state, 'correlation_id', 'N/A')
            rabbitmq_logger.log_warn(
                url=str(request.url),
                correlation_id=correlation_id,
                message=f"Notification not found: {notification_id}"
            )
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

def mark_read_controller(notification_id: int, request: Request = None):
    result = mark_notification_as_read(notification_id)
    if not result:
        if request:
            correlation_id = getattr(request.state, 'correlation_id', 'N/A')
            rabbitmq_logger.log_warn(
                url=str(request.url),
                correlation_id=correlation_id,
                message=f"Notification not found for marking as read: {notification_id}"
            )
        raise HTTPException(status_code=404, detail="Notification not found")
    return result

def mark_all_read_controller(user_id: int, request: Request = None):
    try:
        count = mark_all_as_read(user_id)
        return {"message": f"Marked {count} notifications as read"}
    except Exception as e:
        if request:
            correlation_id = getattr(request.state, 'correlation_id', 'N/A')
            rabbitmq_logger.log_error(
                url=str(request.url),
                correlation_id=correlation_id,
                message=f"Error marking all as read for user {user_id}: {str(e)}"
            )
        raise HTTPException(status_code=500, detail=str(e))

def get_unread_count_controller(user_id: int, request: Request = None):
    try:
        count = get_unread_count(user_id)
        return {"unread_count": count}
    except Exception as e:
        if request:
            correlation_id = getattr(request.state, 'correlation_id', 'N/A')
            rabbitmq_logger.log_error(
                url=str(request.url),
                correlation_id=correlation_id,
                message=f"Error getting unread count for user {user_id}: {str(e)}"
            )
        raise HTTPException(status_code=500, detail=str(e))

def delete_notification_controller(notification_id: int, request: Request = None):
    success = delete_notification(notification_id)
    if not success:
        if request:
            correlation_id = getattr(request.state, 'correlation_id', 'N/A')
            rabbitmq_logger.log_warn(
                url=str(request.url),
                correlation_id=correlation_id,
                message=f"Notification not found for deletion: {notification_id}"
            )
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted successfully"}

def get_notification_stats_controller(user_id: int, request: Request = None):
    try:
        stats = get_notification_stats(user_id)
        return stats
    except Exception as e:
        if request:
            correlation_id = getattr(request.state, 'correlation_id', 'N/A')
            rabbitmq_logger.log_error(
                url=str(request.url),
                correlation_id=correlation_id,
                message=f"Error getting notification stats for user {user_id}: {str(e)}"
            )
        raise HTTPException(status_code=500, detail=str(e))

def bulk_delete_notifications_controller(user_id: int, before_date: str = None, request: Request = None):
    try:
        count = bulk_delete_notifications(user_id, before_date)
        return {"message": f"Deleted {count} notifications successfully"}
    except Exception as e:
        if request:
            correlation_id = getattr(request.state, 'correlation_id', 'N/A')
            rabbitmq_logger.log_error(
                url=str(request.url),
                correlation_id=correlation_id,
                message=f"Error bulk deleting notifications for user {user_id}: {str(e)}"
            )
        raise HTTPException(status_code=500, detail=str(e))

def delete_read_notifications_controller(user_id: int, request: Request = None):
    try:
        count = delete_read_notifications(user_id)
        return {"message": f"Deleted {count} read notifications successfully"}
    except Exception as e:
        if request:
            correlation_id = getattr(request.state, 'correlation_id', 'N/A')
            rabbitmq_logger.log_error(
                url=str(request.url),
                correlation_id=correlation_id,
                message=f"Error deleting read notifications for user {user_id}: {str(e)}"
            )
        raise HTTPException(status_code=500, detail=str(e))