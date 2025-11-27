import os
import requests

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user-service:5001")

def get_user(user_id: int):
    url = f"{USER_SERVICE_URL}/users/{user_id}"
    response = requests.get(url, timeout=3)

    if response.status_code != 200:
        return None
    
    return response.json()


def upgrade_user_role(user_id: int):
    url = f"{USER_SERVICE_URL}/users/{user_id}/role"
    response = requests.put(
        url, 
        json={"role": "merchant"},
        timeout=3
    )

    # uspešni statusi v Express-u:
    return response.status_code in [200, 201, 204]