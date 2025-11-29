from fastapi import APIRouter, Query
from src.models.user_preferences import UserPreferencesCreate, UserPreferencesUpdate
from src.controllers.preferences_controller import (
    get_preferences_controller,
    create_preferences_controller,
    update_preferences_controller
)

router = APIRouter(prefix="/notifications/preferences", tags=["preferences"])

@router.get("")
def get_preferences(user_id: int = Query(..., description="User ID")):
    return get_preferences_controller(user_id)

@router.post("")
def create_preferences(preferences: UserPreferencesCreate):
    return create_preferences_controller(preferences)

@router.put("")
def update_preferences(
    user_id: int = Query(..., description="User ID"),
    preferences: UserPreferencesUpdate = ...
):
    return update_preferences_controller(user_id, preferences)