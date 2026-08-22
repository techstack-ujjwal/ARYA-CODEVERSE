from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.logging import setup_logging
from backend.app.api.v1.router import api_router
from backend.app.db.session import init_db

logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.PROJECT_NAME} in [{settings.ENVIRONMENT}] mode...")
    try:
        await init_db()
    except Exception as e:
        logger.warning(f"Database init warning (non-fatal for initial startup): {e}")
    yield
    # Shutdown
    logger.info(f"Shutting down {settings.PROJECT_NAME}...")


def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="2.0.0",
        description="AI-Powered Hackathon Evaluation Engine API — Backend Core",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
        lifespan=lifespan,
    )

    # CORS configuration
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc: Exception):
        logger.error(f"Unhandled server error on {request.url.path}: {exc}")
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal Server Error",
                "detail": str(exc) if settings.DEBUG else "An unexpected server error occurred",
                "data": None,
                "error": str(exc),
            },
        )

    # Mount v1 router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


app = create_application()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
