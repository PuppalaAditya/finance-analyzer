from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routes import (
    upload_routes,
    analysis_routes,
    chat_routes,
    compare_routes,
    dashboard_routes,
)
from .utils.logger import get_logger


logger = get_logger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title="Financial Decoder AI",
        description="AI-powered financial intelligence platform for Indian markets.",
        version="0.1.0",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(upload_routes.router, prefix="/api", tags=["upload"])
    app.include_router(analysis_routes.router, prefix="/api", tags=["analysis"])
    app.include_router(chat_routes.router, prefix="/api", tags=["chat"])
    app.include_router(compare_routes.router, prefix="/api", tags=["compare"])
    app.include_router(dashboard_routes.router, prefix="/api", tags=["dashboard"])

    @app.get("/health")
    async def health_check():
        return {"status": "ok"}

    logger.info("Financial Decoder AI application created.")
    return app


app = create_app()

