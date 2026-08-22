from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class HackathonBase(BaseModel):
    name: str
    description: Optional[str] = None
    rubric_weights: Dict[str, float] = Field(
        default_factory=lambda: {"idea": 0.20, "ppt": 0.25, "product": 0.55}
    )
    status: str = "active"
    submission_deadline: Optional[datetime] = None


class HackathonCreate(HackathonBase):
    pass


class HackathonUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    rubric_weights: Optional[Dict[str, float]] = None
    status: Optional[str] = None
    submission_deadline: Optional[datetime] = None


class HackathonResponse(HackathonBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime
