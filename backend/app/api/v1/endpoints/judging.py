from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.db.session import get_db
from backend.app.db.repositories.project_repo import ProjectRepository
from backend.app.core.security import get_current_user, AuthenticatedUser, require_role
from backend.app.models.schemas.common import APIResponse
from backend.app.models.db_models.models import JudgeAssignment, Project

router = APIRouter()


class JudgeScoreInput(BaseModel):
    score: float = Field(..., ge=0.0, le=100.0, description="Human judge score between 0.0 and 100.0")
    feedback: Optional[str] = None
    override_reason: Optional[str] = None


@router.get("/assigned-projects", response_model=APIResponse[List[dict]])
async def get_assigned_projects(
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(require_role("judge")),
):
    """Returns list of projects assigned to the current judge."""
    result = await db.execute(
        select(JudgeAssignment).where(JudgeAssignment.judge_id == current_user.user_id)
    )
    assignments = list(result.scalars().all())

    return APIResponse(
        success=True,
        message="Assigned projects retrieved",
        data=[
            {
                "assignment_id": a.id,
                "project_id": a.project_id,
                "human_score": a.human_score,
                "status": a.status,
            }
            for a in assignments
        ],
    )


@router.post("/{project_id}/score", response_model=APIResponse[dict])
async def submit_judge_score(
    project_id: str,
    payload: JudgeScoreInput,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(require_role("judge")),
):
    """Submits or updates human judge evaluation score."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    result = await db.execute(
        select(JudgeAssignment).where(
            JudgeAssignment.judge_id == current_user.user_id,
            JudgeAssignment.project_id == project_id,
        )
    )
    assignment = result.scalars().first()

    if assignment:
        assignment.human_score = payload.score
        assignment.comments = payload.feedback
        assignment.status = "scored"
    else:
        assignment = JudgeAssignment(
            judge_id=current_user.user_id,
            project_id=project_id,
            human_score=payload.score,
            comments=payload.feedback,
            status="scored",
        )
        db.add(assignment)

    await db.commit()
    await db.refresh(assignment)

    return APIResponse(
        success=True,
        message="Judge score submitted successfully",
        data={
            "assignment_id": assignment.id,
            "project_id": project_id,
            "judge_id": current_user.user_id,
            "human_score": assignment.human_score,
            "status": assignment.status,
        },
    )
