from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.models.schemas.common import HealthCheckResponse, AgentHealthResponse, APIResponse
from backend.app.api.v1.endpoints import (
    auth,
    projects,
    idea,
    ppt,
    product,
    feedback,
    evaluation,
    judging,
    finalization,
    admin,
    webhooks,
)

api_router = APIRouter()


@api_router.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """Liveness & readiness health check endpoint."""
    return HealthCheckResponse(
        status="healthy",
        version="2.0.0",
        environment=settings.ENVIRONMENT,
        database="connected",
    )


@api_router.get("/health/agents", response_model=AgentHealthResponse, tags=["Health"])
async def agent_health_check():
    """Agent provider connectivity status check."""
    return AgentHealthResponse(
        openai="configured" if settings.OPENAI_API_KEY else "unconfigured",
        gemini="configured" if settings.GOOGLE_API_KEY else "unconfigured",
        tavily="configured" if settings.TAVILY_API_KEY else "unconfigured",
    )


# Register sub-routers
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(idea.router, prefix="/projects", tags=["Idea Stage"])
api_router.include_router(ppt.router, prefix="/projects", tags=["PPT Stage"])
api_router.include_router(product.router, prefix="/projects", tags=["Product Stage"])
api_router.include_router(feedback.router, prefix="/projects", tags=["Instant Feedback"])
api_router.include_router(evaluation.router, prefix="/projects", tags=["Evaluation"])
api_router.include_router(judging.router, prefix="/judging", tags=["Judging"])
api_router.include_router(finalization.router, prefix="/finalization", tags=["Finalization"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
