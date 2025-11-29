import os
import requests

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user-service:5001")

def get_user(user_id: int):
    """Validate that user exists in user-service"""
    url = f"{USER_SERVICE_URL}/users/{user_id}"
    try:
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            return response.json()
        return None
    except Exception:
        return None