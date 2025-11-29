from src.db.db import get_connection
from src.models.user_preferences import UserPreferencesCreate, UserPreferencesUpdate

def get_user_preferences(user_id: int) -> dict:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """SELECT id, user_id, new_offers_enabled, reservation_confirmations_enabled,
                      expiration_reminders_enabled, pickup_reminders_enabled,
                      preferred_channel, created_at, updated_at
               FROM user_notification_preferences
               WHERE user_id = %s""",
            (user_id,)
        )
        result = cursor.fetchone()
        return dict(result) if result else None
    finally:
        conn.close()

def create_user_preferences(preferences: UserPreferencesCreate) -> dict:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO user_notification_preferences
               (user_id, new_offers_enabled, reservation_confirmations_enabled,
                expiration_reminders_enabled, pickup_reminders_enabled, preferred_channel)
               VALUES (%s, %s, %s, %s, %s, %s)
               RETURNING id, user_id, new_offers_enabled, reservation_confirmations_enabled,
                         expiration_reminders_enabled, pickup_reminders_enabled,
                         preferred_channel, created_at, updated_at""",
            (preferences.user_id, preferences.new_offers_enabled,
             preferences.reservation_confirmations_enabled,
             preferences.expiration_reminders_enabled,
             preferences.pickup_reminders_enabled,
             preferences.preferred_channel)
        )
        result = cursor.fetchone()
        conn.commit()
        return dict(result)
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def update_user_preferences(user_id: int, preferences: UserPreferencesUpdate) -> dict:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        updates = []
        values = []
        
        if preferences.new_offers_enabled is not None:
            updates.append("new_offers_enabled = %s")
            values.append(preferences.new_offers_enabled)
        
        if preferences.reservation_confirmations_enabled is not None:
            updates.append("reservation_confirmations_enabled = %s")
            values.append(preferences.reservation_confirmations_enabled)
        
        if preferences.expiration_reminders_enabled is not None:
            updates.append("expiration_reminders_enabled = %s")
            values.append(preferences.expiration_reminders_enabled)
        
        if preferences.pickup_reminders_enabled is not None:
            updates.append("pickup_reminders_enabled = %s")
            values.append(preferences.pickup_reminders_enabled)
        
        if preferences.preferred_channel is not None:
            updates.append("preferred_channel = %s")
            values.append(preferences.preferred_channel)
        
        if not updates:
            return get_user_preferences(user_id)
        
        updates.append("updated_at = NOW()")
        values.append(user_id)
        
        query = f"""UPDATE user_notification_preferences
                    SET {', '.join(updates)}
                    WHERE user_id = %s
                    RETURNING id, user_id, new_offers_enabled, reservation_confirmations_enabled,
                              expiration_reminders_enabled, pickup_reminders_enabled,
                              preferred_channel, created_at, updated_at"""
        
        cursor.execute(query, values)
        result = cursor.fetchone()
        conn.commit()
        return dict(result) if result else None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()