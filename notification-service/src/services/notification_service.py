from src.db.db import get_connection
from src.models.notification import NotificationCreate, NotificationResponse
from src.utils.user_client import get_user

def create_notification(notification: NotificationCreate) -> dict:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO notifications 
               (user_id, type, title, message, offer_id, order_id, status, channel)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
               RETURNING id, user_id, type, title, message, offer_id, order_id, 
                         status, channel, created_at, sent_at, read_at""",
            (notification.user_id, notification.type, notification.title,
             notification.message, notification.offer_id, notification.order_id,
             notification.status, notification.channel)
        )
        result = cursor.fetchone()
        conn.commit()
        return dict(result)
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def get_notifications_by_user(user_id: int, limit: int = 50, offset: int = 0) -> list:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """SELECT id, user_id, type, title, message, offer_id, order_id,
                      status, channel, created_at, sent_at, read_at
               FROM notifications
               WHERE user_id = %s
               ORDER BY created_at DESC
               LIMIT %s OFFSET %s""",
            (user_id, limit, offset)
        )
        results = cursor.fetchall()
        return [dict(row) for row in results]
    finally:
        conn.close()

def get_notification_by_id(notification_id: int) -> dict:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """SELECT id, user_id, type, title, message, offer_id, order_id,
                      status, channel, created_at, sent_at, read_at
               FROM notifications
               WHERE id = %s""",
            (notification_id,)
        )
        result = cursor.fetchone()
        return dict(result) if result else None
    finally:
        conn.close()

def mark_notification_as_read(notification_id: int) -> dict:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE notifications
               SET status = 'read', read_at = NOW()
               WHERE id = %s
               RETURNING id, user_id, type, title, message, offer_id, order_id,
                         status, channel, created_at, sent_at, read_at""",
            (notification_id,)
        )
        result = cursor.fetchone()
        conn.commit()
        return dict(result) if result else None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def mark_all_as_read(user_id: int) -> int:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE notifications
               SET status = 'read', read_at = NOW()
               WHERE user_id = %s AND status != 'read'
               RETURNING id""",
            (user_id,)
        )
        count = len(cursor.fetchall())
        conn.commit()
        return count
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def get_unread_count(user_id: int) -> int:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """SELECT COUNT(*) as count
               FROM notifications
               WHERE user_id = %s AND status != 'read'""",
            (user_id,)
        )
        result = cursor.fetchone()
        return result['count'] if result else 0
    finally:
        conn.close()

def delete_notification(notification_id: int) -> bool:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM notifications WHERE id = %s", (notification_id,))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def get_notification_stats(user_id: int) -> dict:
    """Get notification statistics for a user"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total FROM notifications WHERE user_id = %s", (user_id,))
        total = cursor.fetchone()['total']

        cursor.execute("SELECT COUNT(*) as unread FROM notifications WHERE user_id = %s AND status != 'read'", (user_id,))
        unread = cursor.fetchone()['unread']

        cursor.execute("""
            SELECT type, COUNT(*) as count
            FROM notifications
            WHERE user_id = %s
            GROUP BY type
        """, (user_id,))
        type_counts = dict(cursor.fetchall())

        return {
            "total_notifications": total,
            "unread_notifications": unread,
            "notifications_by_type": type_counts
        }
    finally:
        conn.close()

def bulk_delete_notifications(user_id: int, before_date: str = None) -> int:
    conn = get_connection()
    try:
        cursor = conn.cursor()

        if before_date:
            cursor.execute(
                "DELETE FROM notifications WHERE user_id = %s AND created_at < %s",
                (user_id, before_date)
            )
        else:
            cursor.execute("DELETE FROM notifications WHERE user_id = %s", (user_id,))

        deleted_count = cursor.rowcount
        conn.commit()
        return deleted_count
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def delete_read_notifications(user_id: int) -> int:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM notifications WHERE user_id = %s AND status = 'read'",
            (user_id,)
        )
        deleted_count = cursor.rowcount
        conn.commit()
        return deleted_count
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()