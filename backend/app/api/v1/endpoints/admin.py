from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.db.session import get_db
from backend.app.db.repositories.hackathon_repo import HackathonRepository
from backend.app.core.security import AuthenticatedUser, require_role, get_current_user
from backend.app.models.schemas.common import APIResponse
from backend.app.models.schemas.hackathon import (
    HackathonCreate,
    HackathonUpdate,
    HackathonResponse,
)

router = APIRouter()


@router.post("/hackathons", response_model=APIResponse[HackathonResponse], status_code=status.HTTP_201_CREATED)
async def create_hackathon(
    payload: HackathonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(require_role("admin")),
):
    """Creates a new hackathon event with custom rubric weights."""
    hackathon_repo = HackathonRepository(db)
    hackathon = await hackathon_repo.create(
        name=payload.name,
        description=payload.description,
        rubric_weights=payload.rubric_weights,
        status=payload.status,
        submission_deadline=payload.submission_deadline,
    )
    return APIResponse(
        success=True,
        message="Hackathon created successfully",
        data=HackathonResponse.model_validate(hackathon),
    )


@router.get("/hackathons", response_model=APIResponse[List[HackathonResponse]])
async def list_hackathons(
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Lists all hackathon events."""
    hackathon_repo = HackathonRepository(db)
    hackathons = await hackathon_repo.list_all()
    return APIResponse(
        success=True,
        message="Hackathons retrieved successfully",
        data=[HackathonResponse.model_validate(h) for h in hackathons],
    )


@router.get("/hackathons/{id}", response_model=APIResponse[HackathonResponse])
async def get_hackathon(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Retrieves single hackathon details."""
    hackathon_repo = HackathonRepository(db)
    hackathon = await hackathon_repo.get_by_id(id)
    if not hackathon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hackathon not found")
    return APIResponse(
        success=True,
        message="Hackathon retrieved successfully",
        data=HackathonResponse.model_validate(hackathon),
    )


@router.patch("/hackathons/{id}", response_model=APIResponse[HackathonResponse])
async def update_hackathon(
    id: str,
    payload: HackathonUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(require_role("admin")),
):
    """Updates hackathon settings or rubric weights."""
    hackathon_repo = HackathonRepository(db)
    hackathon = await hackathon_repo.get_by_id(id)
    if not hackathon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hackathon not found")

    updated = await hackathon_repo.update(
        id,
        name=payload.name,
        description=payload.description,
        rubric_weights=payload.rubric_weights,
        status=payload.status,
        submission_deadline=payload.submission_deadline,
    )
    return APIResponse(
        success=True,
        message="Hackathon updated successfully",
        data=HackathonResponse.model_validate(updated),
    )

@router.get("/analytics/plagiarism-flags", response_model=APIResponse[List[dict]])
async def get_plagiarism_flags(
    hackathon_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(require_role("admin")),
):
    """Returns submissions flagged by the Plagiarism/Similarity Agent."""
    from backend.app.models.db_models.models import PlagiarismFlag, Project

    stmt = (
        select(PlagiarismFlag, Project.name)
        .join(Project, PlagiarismFlag.project_id == Project.id)
        .order_by(PlagiarismFlag.similarity_score.desc())
    )
    if hackathon_id:
        stmt = stmt.where(Project.hackathon_id == hackathon_id)

    result = await db.execute(stmt)
    rows = result.all()

    return APIResponse(
        success=True,
        message="Plagiarism flags retrieved",
        data=[
            {
                "flag_id": flag.id,
                "project_id": flag.project_id,
                "project_name": project_name,
                "matched_source": flag.matched_source,
                "similarity_score": flag.similarity_score,
                "status": flag.status,
            }
            for flag, project_name in rows
        ],
    )


@router.post("/reset-database", response_model=APIResponse[dict])
async def reset_and_seed_database_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(require_role("admin")),
):
    """Admin-only: Purges stale test records and restores 5 pristine seed projects."""
    from backend.app.db.reset_and_seed import reset_and_seed
    try:
        await reset_and_seed()
        return APIResponse(
            success=True,
            message="Database successfully reset and re-seeded with 5 pristine hackathon projects.",
            data={"total_projects": 5, "hackathon_id": "hack_global_ai_2026"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset database: {str(e)}",
        )

