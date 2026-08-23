from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.session import get_db
from backend.app.db.repositories.project_repo import ProjectRepository
from backend.app.db.repositories.hackathon_repo import HackathonRepository
from backend.app.core.security import get_current_user, AuthenticatedUser
from backend.app.models.schemas.common import APIResponse
from backend.app.models.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    TeamMemberAdd,
    ProjectStatusResponse,
)

router = APIRouter()


@router.post("", response_model=APIResponse[ProjectResponse], status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Creates a new team project under a hackathon."""
    hackathon_repo = HackathonRepository(db)
    hackathon = await hackathon_repo.get_by_id(payload.hackathon_id)
    if not hackathon:
        # For dev convenience, auto-create hackathon if missing
        hackathon = await hackathon_repo.create(
            id=payload.hackathon_id,
            name=f"Hackathon {payload.hackathon_id}",
            description="Auto-generated Hackathon event",
            status="active",
        )

    project_repo = ProjectRepository(db)
    new_project = await project_repo.create(
        hackathon_id=payload.hackathon_id,
        name=payload.name,
        description=payload.description,
        owner_id=current_user.user_id,
        members=[current_user.user_id],
        status="idea",
        github_url=payload.github_url,
        live_url=payload.live_url,
    )

    return APIResponse(
        success=True,
        message="Project created successfully",
        data=ProjectResponse.model_validate(new_project),
    )


@router.get("", response_model=APIResponse[List[ProjectResponse]])
async def list_projects(
    hackathon_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Lists projects. Filterable by hackathon_id."""
    project_repo = ProjectRepository(db)
    projects = await project_repo.list_by_hackathon(hackathon_id=hackathon_id)
    return APIResponse(
        success=True,
        message="Projects retrieved successfully",
        data=[ProjectResponse.model_validate(p) for p in projects],
    )


@router.get("/hackathons", response_model=APIResponse[List[dict]])
async def list_available_hackathons(
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Lists all available Hackathon events with participation metadata for students and participants."""
    hackathon_repo = HackathonRepository(db)
    hackathons = await hackathon_repo.list_all()

    project_repo = ProjectRepository(db)
    all_projects = await project_repo.list_all()

    hackathon_stats: dict = {}
    for p in all_projects:
        stats = hackathon_stats.setdefault(p.hackathon_id, {"total_projects": 0, "my_projects": 0})
        stats["total_projects"] += 1
        if p.owner_id == current_user.user_id or current_user.user_id in (p.members or []):
            stats["my_projects"] += 1

    return APIResponse(
        success=True,
        message="Available hackathons retrieved successfully",
        data=[
            {
                "id": h.id,
                "name": h.name,
                "description": h.description,
                "rubric_weights": h.rubric_weights or {"idea": 0.20, "ppt": 0.25, "product": 0.55},
                "status": h.status,
                "submission_deadline": str(h.submission_deadline) if h.submission_deadline else None,
                "total_projects": hackathon_stats.get(h.id, {}).get("total_projects", 0),
                "my_projects": hackathon_stats.get(h.id, {}).get("my_projects", 0),
                "is_enrolled": hackathon_stats.get(h.id, {}).get("my_projects", 0) > 0,
                "created_at": str(h.created_at) if h.created_at else None,
                "updated_at": str(h.updated_at) if h.updated_at else None,
            }
            for h in hackathons
        ],
    )


@router.get("/{id}", response_model=APIResponse[ProjectResponse])
async def get_project(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Retrieves project details by ID."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Authorization check
    if current_user.role not in ["admin", "judge"] and current_user.user_id != project.owner_id and current_user.user_id not in (project.members or []):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this project")

    return APIResponse(
        success=True,
        message="Project retrieved successfully",
        data=ProjectResponse.model_validate(project),
    )


@router.patch("/{id}", response_model=APIResponse[ProjectResponse])
async def update_project(
    id: str,
    payload: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Updates project metadata (name, description, URLs, status)."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if current_user.role != "admin" and current_user.user_id != project.owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only project owner or admin can update")

    updated_project = await project_repo.update(
        id,
        name=payload.name,
        description=payload.description,
        github_url=payload.github_url,
        live_url=payload.live_url,
        status=payload.status,
    )

    return APIResponse(
        success=True,
        message="Project updated successfully",
        data=ProjectResponse.model_validate(updated_project),
    )


@router.delete("/{id}", response_model=APIResponse[dict])
async def delete_project(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Deletes a project."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if current_user.role != "admin" and current_user.user_id != project.owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only project owner or admin can delete")

    await project_repo.delete(id)
    return APIResponse(
        success=True,
        message="Project deleted successfully",
        data={"project_id": id},
    )


@router.post("/{id}/team-members", response_model=APIResponse[ProjectResponse])
async def add_team_member(
    id: str,
    payload: TeamMemberAdd,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Adds a team member to the project."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if current_user.role != "admin" and current_user.user_id != project.owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner or admin can add team members")

    updated = await project_repo.add_member(id, payload.user_id)
    return APIResponse(
        success=True,
        message=f"Member {payload.user_id} added to project",
        data=ProjectResponse.model_validate(updated),
    )


@router.get("/{id}/status", response_model=APIResponse[dict])
async def get_project_status(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Returns pipeline progression status across all stages."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_with_details(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Calculate status per stage from submissions/evaluations
    submission_stages = {s.stage for s in project.submissions}
    evaluation_stages = {e.stage for e in project.evaluations}

    return APIResponse(
        success=True,
        message="Project status retrieved",
        data={
            "project_id": id,
            "overall_status": project.status,
            "stages": {
                "idea": "completed" if "idea" in evaluation_stages else ("submitted" if "idea" in submission_stages else "pending"),
                "ppt": "completed" if "ppt" in evaluation_stages else ("submitted" if "ppt" in submission_stages else "pending"),
                "product": "completed" if "product" in evaluation_stages else ("registered" if project.github_url else "pending"),
                "feedback": "generated" if len(project.feedback_reports) > 0 else "none",
                "finalized": "completed" if project.final_result else "pending",
            },
        },
    )
