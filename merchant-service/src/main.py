from fastapi import FastAPI
from src.routes.merchant_routes import router as merchant_router
from src.routes.merchant_location_routes import router as merchant_location_router
from src.routes.merchant_hours_routes import router as merchant_hours_router

app = FastAPI()

app.include_router(merchant_router)
app.include_router(merchant_location_router)
app.include_router(merchant_hours_router)
