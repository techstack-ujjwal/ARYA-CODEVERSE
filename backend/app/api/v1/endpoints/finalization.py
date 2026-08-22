from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.db.session import get_db
from backend.app.db.repositories.project_repo import ProjectRepository
from backend.app.core.security import get_current_user, AuthenticatedUser, require_role
from backend.app.models.schemas.common import APIResponse
from backend.app.models.db_models.models import FinalResult, Evaluation, JudgeAssignment, Project
from backend.app.agents.shared.final_judge_agent import FinalJudgeAgent

router = APIRouter()


@router.post("/{project_id}/compute", response_model=APIResponse[dict])
async def compute_final_score(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(require_role("admin")),
):
    """
    Computes combined 70% AI + 30% Human final score and saves to FinalResult.
    Formula: Final = (AI_Score * 0.70) + (Human_Score * 0.30)
    """
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Fetch stage evaluations
    eval_result = await db.execute(
        select(Evaluation).where(Evaluation.project_id == project_id)
    )
    evaluations = list(eval_result.scalars().all())
    # Compute stage average score across all agents evaluated per stage
    stage_scores_map = {}
    for e in evaluations:
        stage_scores_map.setdefault(e.stage, []).append(e.score)

    idea_score = round(sum(stage_scores_map.get("idea", [0.0])) / len(stage_scores_map.get("idea", [1])), 2)
    ppt_score = round(sum(stage_scores_map.get("ppt", [0.0])) / len(stage_scores_map.get("ppt", [1])), 2)
    product_score = round(sum(stage_scores_map.get("product", [0.0])) / len(stage_scores_map.get("product", [1])), 2)

    ai_score = FinalJudgeAgent.calculate_weighted_ai_score(
        idea_score=idea_score,
        ppt_score=ppt_score,
        product_score=product_score,
    )

    # Fetch human judge score (average if multiple judges)
    judge_result = await db.execute(
        select(JudgeAssignment).where(
            JudgeAssignment.project_id == project_id,
            JudgeAssignment.human_score.isnot(None),
        )
    )
    judge_scores = [j.human_score for j in judge_result.scalars().all()]
    human_score = sum(judge_scores) / len(judge_scores) if judge_scores else ai_score  # fallback to AI score if unjudged

    # 70% AI + 30% Human formula
    final_score = round((ai_score * 0.70) + (human_score * 0.30), 2)

    # Persist or update FinalResult
    final_res_query = await db.execute(
        select(FinalResult).where(FinalResult.project_id == project_id)
    )
    final_record = final_res_query.scalars().first()

    if final_record:
        final_record.ai_score = ai_score
        final_record.human_score = human_score
        final_record.final_score = final_score
    else:
        final_record = FinalResult(
            project_id=project_id,
            hackathon_id=project.hackathon_id,
            ai_score=ai_score,
            human_score=human_score,
            final_score=final_score,
        )
        db.add(final_record)

    # Update project status to finalized
    await project_repo.update_stage_status(project_id, new_status="finalized")
    await db.commit()
    await db.refresh(final_record)

    return APIResponse(
        success=True,
        message="Final score computed successfully",
        data={
            "project_id": project_id,
            "ai_score": ai_score,
            "human_score": human_score,
            "final_score": final_score,
            "formula": "70% AI + 30% Human",
        },
    )


@router.get("/leaderboard", response_model=APIResponse[List[dict]])
async def get_leaderboard(
    hackathon_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Returns hackathon ranked leaderboard sorted by final_score descending."""
    stmt = (
        select(FinalResult, Project.name)
        .join(Project, FinalResult.project_id == Project.id)
        .order_by(FinalResult.final_score.desc())
    )
    if hackathon_id:
        stmt = stmt.where(FinalResult.hackathon_id == hackathon_id)

    result = await db.execute(stmt)
    rows = result.all()

    leaderboard = []
    for rank, (final_res, project_name) in enumerate(rows, start=1):
        leaderboard.append({
            "rank": rank,
            "project_id": final_res.project_id,
            "project_name": project_name,
            "ai_score": final_res.ai_score,
            "human_score": final_res.human_score,
            "final_score": final_res.final_score,
        })

    return APIResponse(
        success=True,
        message="Leaderboard retrieved",
        data=leaderboard,
    )
