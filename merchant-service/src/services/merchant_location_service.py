from src.db.db import get_connection
from psycopg2 import errors
from src.services.merchant_service import merchant_exists

def add_location(merchant_id: int, location_data):
    if not merchant_exists(merchant_id):
        return None, "Merchant does not exist"

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO merchant_locations (merchant_id, address, city, postal_code)
            VALUES (%s, %s, %s, %s)
            RETURNING id, merchant_id, address, city, postal_code
            """,
            (merchant_id, location_data.address, location_data.city, location_data.postal_code)
        )
        result = cursor.fetchone()
        conn.commit()
        return result, None

    except errors.UniqueViolation:
        conn.rollback()
        return None, "Location already exists for this merchant"

    except Exception as e:
        conn.rollback()
        return None, str(e)

    finally:
        cursor.close()
        conn.close()

def location_exists(location_id: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM merchant_locations WHERE id = %s", (location_id,))
    exists = cursor.fetchone() is not None
    cursor.close()
    conn.close()
    return exists

def duplicate_location_exists(cursor, merchant_id: int, address: str, city: str, postal_code: str, exclude_id: int = None):
    if exclude_id:
        cursor.execute("""
            SELECT id FROM merchant_locations
            WHERE merchant_id=%s AND address=%s AND city=%s AND postal_code=%s
            AND id != %s
        """, (merchant_id, address, city, postal_code, exclude_id))
    else:
        cursor.execute("""
            SELECT id FROM merchant_locations
            WHERE merchant_id=%s AND address=%s AND city=%s AND postal_code=%s
        """, (merchant_id, address, city, postal_code))

    return cursor.fetchone() is not None


def update_location(merchant_id: int, location_id: int, data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id FROM merchant_locations
        WHERE id = %s AND merchant_id = %s
    """, (location_id, merchant_id))

    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return None
    
    if duplicate_location_exists(cursor, merchant_id, data.address, data.city, data.postal_code):
        cursor.close()
        conn.close()
        return "duplicate_location"


    cursor.execute("""
        UPDATE merchant_locations
        SET 
            address = COALESCE(%s, address),
            city = COALESCE(%s, city),
            postal_code = COALESCE(%s, postal_code)
        WHERE id = %s
        RETURNING id, merchant_id, address, city, postal_code
    """, (data.address, data.city, data.postal_code, location_id))

    updated = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return updated

def delete_location(merchant_id: int, location_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    # preveri, ali lokacija pripada merchantu
    cursor.execute("""
        SELECT id FROM merchant_locations
        WHERE id=%s AND merchant_id=%s
    """, (location_id, merchant_id))

    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return None

    # ure se zbrišejo preko FOREIGN KEY cascade
    cursor.execute("DELETE FROM merchant_locations WHERE id=%s", (location_id,))

    conn.commit()
    cursor.close()
    conn.close()

    return True