from src.db.db import get_connection
from psycopg2 import errors

def add_hours(location_id: int, hours_data):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO merchant_hours (location_id, day_of_week, open_time, close_time)
            VALUES (%s, %s, %s, %s)
            RETURNING id, location_id, day_of_week, open_time, close_time
            """,
            (location_id, hours_data.day_of_week, hours_data.open_time, hours_data.close_time)
        )
        result = cursor.fetchone()
        conn.commit()
        return result, None

    except errors.UniqueViolation:
        conn.rollback()
        return None, "Hours for this day already exist for this location"

    except Exception as e:
        conn.rollback()
        return None, str(e)

    finally:
        cursor.close()
        conn.close()

def update_hours(merchant_id: int, location_id: int, hour_id: int, data):
    conn = get_connection()
    cursor = conn.cursor()

    # 1) preveri, da lokacija pripada merchantu
    cursor.execute("""
        SELECT id FROM merchant_locations 
        WHERE id = %s AND merchant_id = %s
    """, (location_id, merchant_id))

    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return None

    # 2) preveri, da hours pripada lokaciji
    cursor.execute("""
        SELECT id FROM merchant_hours
        WHERE id = %s AND location_id = %s
    """, (hour_id, location_id))

    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return "hours_not_found"

    # 3) update
    cursor.execute("""
        UPDATE merchant_hours
        SET 
            day_of_week = COALESCE(%s, day_of_week),
            open_time = COALESCE(%s, open_time),
            close_time = COALESCE(%s, close_time)
        WHERE id = %s
        RETURNING id, location_id, day_of_week, open_time, close_time
    """, (data.day_of_week, data.open_time, data.close_time, hour_id))

    updated = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()

    return updated

def delete_hour(merchant_id: int, location_id: int, hour_id: int):
        conn = get_connection()
        cursor = conn.cursor()

        # preveri lokacijo
        cursor.execute("""
            SELECT id FROM merchant_locations
            WHERE id=%s AND merchant_id=%s
        """, (location_id, merchant_id))

        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return None

        # preveri hour vezan na lokacijo
        cursor.execute("""
            SELECT id FROM merchant_hours
            WHERE id=%s AND location_id=%s
        """, (hour_id, location_id))

        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return "not_found"

        cursor.execute("DELETE FROM merchant_hours WHERE id=%s", (hour_id,))
        conn.commit()
        cursor.close()
        conn.close()

        return True