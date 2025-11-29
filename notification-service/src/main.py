from fastapi import FastAPI
from src.routes.notification_routes import router as notification_router
from src.routes.preferences_routes import router as preferences_router

app = FastAPI()

app.include_router(notification_router)
app.include_router(preferences_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}