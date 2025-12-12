from src.db.db import get_connection
from src.utils.user_client import get_user, upgrade_user_role

def merchant_exists(merchant_id: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM merchants WHERE id = %s", (merchant_id,))
    exists = cursor.fetchone() is not None

    cursor.close()
    conn.close()
    return exists


def create_merchant(data, location_data, user_id):

    # 1) preveri user obstoj
    user = get_user(user_id)
    if not user:
        return None, "User does not exist"

    # 2) preveri, da ni že merchant
    if user.get("role") != "user":
        return None, "User is already merchant"

    # 3) poskusi nadgraditi role
    role_ok = upgrade_user_role(user_id)
    if not role_ok:
        return None, "Failed to upgrade user role. Merchant not created."

    # 4) šele zdaj odpremo transakcijo
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # INSERT merchant
        cursor.execute(
            """
            INSERT INTO merchants (user_id, business_name, description)
            VALUES (%s, %s, %s)
            RETURNING id, user_id, business_name, description
            """,
            (user_id, data.business_name, data.description)
        )
        merchant = cursor.fetchone()

        # INSERT location
        cursor.execute(
            """
            INSERT INTO merchant_locations (merchant_id, address, city, postal_code)
            VALUES (%s, %s, %s, %s)
            RETURNING id, merchant_id, address, city, postal_code
            """,
            (merchant["id"], location_data.address, location_data.city, location_data.postal_code)
        )

        location = cursor.fetchone()

        conn.commit()
        return {
            "merchant": merchant,
            "location": location
        }, None

    except Exception as e:
        conn.rollback()
        return None, str(e)

    finally:
        cursor.close()
        conn.close()



def get_all_merchants():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, user_id, business_name, description
        FROM merchants
        ORDER BY id ASC
    """)
    result = cursor.fetchall()

    cursor.close()
    conn.close()
    return result

def get_all_merchants_full():
    conn = get_connection()
    cursor = conn.cursor()

    # 1) get all merchants
    cursor.execute("""
        SELECT id, user_id, business_name, description
        FROM merchants
        ORDER BY id ASC
    """)
    merchants = cursor.fetchall()

    if not merchants:
        cursor.close()
        conn.close()
        return []

    # 2) for every merchant get locations
    for merchant in merchants:
        cursor.execute("""
            SELECT id, merchant_id, address, city, postal_code
            FROM merchant_locations
            WHERE merchant_id = %s
            ORDER BY id ASC
        """, (merchant["id"],))

        locations = cursor.fetchall()

        # 3) for every location get hours
        for loc in locations:
            cursor.execute("""
                SELECT id, location_id, day_of_week, open_time, close_time
                FROM merchant_hours
                WHERE location_id = %s
                ORDER BY day_of_week ASC
            """, (loc["id"],))

            loc["hours"] = cursor.fetchall()

        merchant["locations"] = locations

    cursor.close()
    conn.close()

    return merchants


def get_merchant_full(merchant_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    # 1) merchant basic info
    cursor.execute("""
        SELECT id, user_id, business_name, description
        FROM merchants
        WHERE id = %s
    """, (merchant_id,))
    merchant = cursor.fetchone()

    if not merchant:
        cursor.close()
        conn.close()
        return None

    # 2) locations
    cursor.execute("""
        SELECT id, merchant_id, address, city, postal_code
        FROM merchant_locations
        WHERE merchant_id = %s
        ORDER BY id ASC
    """, (merchant_id,))
    locations = cursor.fetchall()

    # 3) hours per location
    for loc in locations:
        cursor.execute("""
            SELECT id, location_id, day_of_week, open_time, close_time
            FROM merchant_hours
            WHERE location_id = %s
            ORDER BY day_of_week ASC
        """, (loc["id"],))

        hours = cursor.fetchall()
        loc["hours"] = hours

    cursor.close()
    conn.close()

    merchant["locations"] = locations

    return merchant

def update_merchant(merchant_id: int, data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM merchants WHERE id=%s", (merchant_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return None

    cursor.execute("""
        UPDATE merchants
        SET business_name = COALESCE(%s, business_name),
            description = COALESCE(%s, description)
        WHERE id = %s
        RETURNING id, user_id, business_name, description
    """, (data.business_name, data.description, merchant_id))

    updated = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()

    return updated

def delete_merchant(merchant_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    # preveri obstoj
    cursor.execute("SELECT id FROM merchants WHERE id=%s", (merchant_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return None

    # DELETE CASCADE bo pobrisal lokacije + ure
    cursor.execute("DELETE FROM merchants WHERE id=%s", (merchant_id,))

    conn.commit()
    cursor.close()
    conn.close()

    return True