from typing import Generic, TypeVar, Optional, Any, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[T] = None
    error: Optional[str] = None


class HealthCheckResponse(BaseModel):
    status: str = "healthy"
    version: str = "2.0.0"
    environment: str
    database: str = "connected"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AgentHealthResponse(BaseModel):
    openai: str = "ready"
    gemini: str = "ready"
    tavily: str = "ready"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int
