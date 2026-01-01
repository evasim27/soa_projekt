from db.db import get_db_connection, get_db_cursor
from datetime import datetime

class LogService:
    @staticmethod
    def save_logs(logs):
        conn = get_db_connection()
        cursor = get_db_cursor(conn)
        
        saved_count = 0
        try:
            for log in logs:
                timestamp = log.get('timestamp')
                if isinstance(timestamp, str):
                    try:
                        timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    except:
                        timestamp = datetime.now()
                elif timestamp is None:
                    timestamp = datetime.now()
                
                cursor.execute(
                    """
                    INSERT INTO logs (timestamp, log_type, url, correlation_id, service_name, message)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        timestamp,
                        log.get('log_type'),
                        log.get('url'),
                        log.get('correlation_id'),
                        log.get('service_name'),
                        log.get('message')
                    )
                )
                saved_count += 1
            
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
        
        return saved_count

    @staticmethod
    def get_logs_by_date_range(date_from, date_to):
        conn = get_db_connection()
        cursor = get_db_cursor(conn)
        
        try:
            cursor.execute(
                """
                SELECT * FROM logs
                WHERE DATE(timestamp) >= %s AND DATE(timestamp) <= %s
                ORDER BY timestamp DESC
                """,
                (date_from, date_to)
            )
            logs = cursor.fetchall()
            return logs
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def delete_all_logs():
        conn = get_db_connection()
        cursor = get_db_cursor(conn)
        
        try:
            cursor.execute("DELETE FROM logs")
            deleted_count = cursor.rowcount
            conn.commit()
            return deleted_count
        finally:
            cursor.close()
            conn.close()