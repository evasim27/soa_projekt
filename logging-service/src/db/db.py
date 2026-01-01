import psycopg2
import os
from psycopg2.extras import RealDictCursor

def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'loggingdb'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASS', 'postgres'),
        port=5432
    )
    return conn

def get_db_cursor(conn):
    return conn.cursor(cursor_factory=RealDictCursor)