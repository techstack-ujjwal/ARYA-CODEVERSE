from fastapi import APIRouter, Request
from loguru import logger
from backend.app.models.schemas.common import APIResponse

router = APIRouter()


@router.post("/n8n", response_model=APIResponse[dict])
async def n8n_webhook(request: Request):
    """Outbound / Inbound webhook integration with n8n workflow automation."""
    payload = await request.json()
    logger.info(f"Received n8n webhook payload: {payload}")
    return APIResponse(
        success=True,
        message="n8n webhook received",
        data={"received": True},
    )


@router.post("/github", response_model=APIResponse[dict])
async def github_webhook(request: Request):
    """GitHub webhook for automated commit-triggered feedback runs."""
    payload = await request.json()
    logger.info("Received GitHub push webhook")
    return APIResponse(
        success=True,
        message="GitHub webhook acknowledged",
        data={"received": True},
    )
