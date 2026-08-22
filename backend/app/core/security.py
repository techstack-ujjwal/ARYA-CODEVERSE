from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from loguru import logger
from backend.app.core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)


class AuthenticatedUser(BaseModel):
    user_id: str
    email: Optional[str] = None
    role: str = "participant"  # participant, judge, admin
    metadata: Dict[str, Any] = {}


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> AuthenticatedUser:
    """
    Verifies Clerk JWT token and returns AuthenticatedUser.
    In development mode without configured Clerk keys, allows dummy auth tokens for local testing.
    """
    clerk_secret = settings.get_clerk_secret_key
    if not credentials:
        if settings.ENVIRONMENT in ["development", "test"] and not clerk_secret:
            # Dev/Test fallback when Clerk is not configured
            return AuthenticatedUser(
                user_id="dev_user_001",
                email="dev@example.com",
                role="admin",
                metadata={"dev_mode": True},
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization credentials required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Support mock test token in non-production environments
    if settings.ENVIRONMENT in ["development", "test"] and token.startswith("test_token_"):
        role = token.split("test_token_")[1] if len(token.split("test_token_")) > 1 else "participant"
        return AuthenticatedUser(
            user_id=f"user_{role}",
            email=f"{role}@example.com",
            role=role if role in ["admin", "judge", "participant"] else "participant",
            metadata={"mock": True},
        )


    try:
        # Decode without verification if keys not provided, or verify with JWKS/secret
        if clerk_secret:
            payload = jwt.decode(
                token,
                clerk_secret,
                algorithms=["HS256", "RS256"],
                options={"verify_aud": False},
            )
        else:
            payload = jwt.get_unverified_claims(token)

        user_id: str = payload.get("sub") or payload.get("id") or "unknown_user"
        email: Optional[str] = payload.get("email")
        role: str = payload.get("role", "participant")
        metadata: Dict[str, Any] = payload.get("metadata", {})

        return AuthenticatedUser(
            user_id=user_id,
            email=email,
            role=role,
            metadata=metadata,
        )
    except JWTError as e:
        logger.error(f"JWT verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(required_role: str):
    async def role_checker(
        current_user: AuthenticatedUser = Depends(get_current_user),
    ) -> AuthenticatedUser:
        if current_user.role != required_role and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: '{required_role}' role required",
            )
        return current_user

    return role_checker
