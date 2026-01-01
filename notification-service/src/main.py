from fastapi import FastAPI, Request
from src.routes.notification_routes import router as notification_router
from src.routes.preferences_routes import router as preferences_router
from src.utils.rabbitmq_logger import rabbitmq_logger
import uuid

app = FastAPI()

@app.middleware("http")
async def correlation_id_middleware(request: Request, call_next):
    correlation_id = request.headers.get('X-Correlation-ID')
    if not correlation_id:
        correlation_id = str(uuid.uuid4())
    
    request.state.correlation_id = correlation_id
    
    rabbitmq_logger.log_info(
        url=f"http://{request.url.hostname}:{request.url.port}{request.url.path}",
        correlation_id=correlation_id,
        message=f"Klic storitve {request.method} {request.url.path}"
    )
    
    response = await call_next(request)
    
    response.headers['X-Correlation-ID'] = correlation_id
    
    return response

app.include_router(notification_router)
app.include_router(preferences_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}