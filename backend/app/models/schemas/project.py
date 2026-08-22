from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None


class ProjectCreate(ProjectBase):
    hackathon_id: str


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    status: Optional[str] = None


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    hackathon_id: str
    owner_id: str
    members: List[str] = []
    status: str
    created_at: datetime
    updated_at: datetime


class TeamMemberAdd(BaseModel):
    user_id: str


class ProjectStatusResponse(BaseModel):
    project_id: str
    overall_status: str
    stages: Dict[str, str]
    last_updated: datetime = Field(default_factory=datetime.utcnow)
