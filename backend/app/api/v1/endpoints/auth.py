from fastapi import APIRouter, Depends, Request, HTTPException, status
from backend.app.core.security import get_current_user, AuthenticatedUser
from backend.app.models.schemas.common import APIResponse
from backend.app.core.config import settings
from loguru import logger
from svix.webhooks import Webhook, WebhookVerificationError

router = APIRouter()


@router.get("/me", response_model=APIResponse[AuthenticatedUser])
async def get_me(current_user: AuthenticatedUser = Depends(get_current_user)):
    """Returns information about the current authenticated user."""
    return APIResponse(
        success=True,
        message="User profile retrieved",
        data=current_user,
    )


@router.post("/webhook")
async def clerk_webhook(request: Request):
    """
    Webhook handler for Clerk user synchronization events.
    Verifies Svix signature and processes user.created, user.updated, user.deleted events.
    """
    payload = await request.body()
    headers = request.headers

    svix_id = headers.get("svix-id")
    svix_timestamp = headers.get("svix-timestamp")
    svix_signature = headers.get("svix-signature")

    if settings.CLERK_WEBHOOK_SECRET:
        if not (svix_id and svix_timestamp and svix_signature):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Svix verification headers",
            )
        try:
            wh = Webhook(settings.CLERK_WEBHOOK_SECRET)
            event = wh.verify(payload, dict(headers))
        except WebhookVerificationError as e:
            logger.error(f"Webhook verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature",
            )
    else:
        # Development fallback when no secret is configured
        import json
        try:
            event = json.loads(payload.decode("utf-8")) if payload else {}
        except Exception:
            event = {}

    event_type = event.get("type", "unknown")
    logger.info(f"Received Clerk webhook event: {event_type}")

    # Process event payload (sync to user db repository)
    return {"status": "success", "event": event_type}
