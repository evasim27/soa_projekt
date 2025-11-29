from fastapi import HTTPException
from src.models.user_preferences import UserPreferencesCreate, UserPreferencesUpdate
from src.services.preferences_service import (
    get_user_preferences,
    create_user_preferences,
    update_user_preferences
)

def get_preferences_controller(user_id: int):
    preferences = get_user_preferences(user_id)
    if not preferences:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return preferences

def create_preferences_controller(preferences: UserPreferencesCreate):
    try:
        result = create_user_preferences(preferences)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def update_preferences_controller(user_id: int, preferences: UserPreferencesUpdate):
    result = update_user_preferences(user_id, preferences)
    if not result:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return result