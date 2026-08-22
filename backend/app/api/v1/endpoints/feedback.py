from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.db.session import get_db
from backend.app.db.repositories.project_repo import ProjectRepository
from backend.app.core.security import get_current_user, AuthenticatedUser
from backend.app.models.schemas.common import APIResponse
from backend.app.models.db_models.models import FeedbackReport
from backend.app.agents.shared.instant_feedback_agent import InstantFeedbackEngine

router = APIRouter()


class FeedbackSubmissionPayload(Dict[str, Any]):
    pass


@router.post("/{id}/feedback/submit", response_model=APIResponse[dict], status_code=status.HTTP_202_ACCEPTED)
async def submit_instant_feedback(
    id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Executes instant pre-judging diagnostic feedback (<90s).
    Runs live URL check, static repo check, and security scan, then saves to FeedbackReport table.
    """
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    github_url = payload.get("github_url") or project.github_url or "https://github.com/team/repo"
    live_url = payload.get("live_url") or project.live_url
    sample_files = payload.get("sample_files") or {"README.md": "# Project\nSetup guide", "main.py": "import os\nprint('running')"}

    diagnostic_result = await InstantFeedbackEngine.run_diagnostic(
        github_url=github_url,
        live_url=live_url,
        sample_files=sample_files,
    )

    feedback_report = FeedbackReport(
        project_id=id,
        github_url=github_url,
        live_url=live_url,
        overall_health=diagnostic_result.overall_health,
        dimensions=diagnostic_result.dimensions,
        top_fixes=diagnostic_result.top_fixes,
    )
    db.add(feedback_report)
    await db.commit()
    await db.refresh(feedback_report)

    return APIResponse(
        success=True,
        message="Instant feedback report generated successfully",
        data={
            "feedback_id": feedback_report.id,
            "project_id": id,
            "overall_health": feedback_report.overall_health,
            "dimensions": feedback_report.dimensions,
            "top_fixes": feedback_report.top_fixes,
        },
    )


@router.get("/{id}/feedback/latest", response_model=APIResponse[dict])
async def get_latest_feedback(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Retrieves latest instant feedback diagnostic report from DB."""
    result = await db.execute(
        select(FeedbackReport)
        .where(FeedbackReport.project_id == id)
        .order_by(FeedbackReport.created_at.desc())
    )
    report = result.scalars().first()

    if not report:
        return APIResponse(
            success=True,
            message="No feedback reports generated yet for this project",
            data={"project_id": id, "status": "none"},
        )

    return APIResponse(
        success=True,
        message="Latest feedback report retrieved",
        data={
            "feedback_id": report.id,
            "project_id": id,
            "overall_health": report.overall_health,
            "dimensions": report.dimensions,
            "top_fixes": report.top_fixes,
            "created_at": str(report.created_at),
        },
    )
