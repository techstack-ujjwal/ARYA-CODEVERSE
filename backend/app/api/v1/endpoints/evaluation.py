from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.db.session import get_db
from backend.app.db.repositories.project_repo import ProjectRepository
from backend.app.core.security import get_current_user, AuthenticatedUser
from backend.app.models.schemas.common import APIResponse
from backend.app.models.db_models.models import Evaluation, Evidence, Claim
from backend.app.agents.shared.final_judge_agent import FinalJudgeAgent

router = APIRouter()


@router.get("/{id}/evaluation/summary", response_model=APIResponse[dict])
async def get_evaluation_summary(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Returns combined multi-agent evaluation report across Idea, PPT, and Product stages."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    result = await db.execute(
        select(Evaluation)
        .where(Evaluation.project_id == id)
        .options(selectinload(Evaluation.evidence_items))
    )
    evaluations = list(result.scalars().all())

    # Compute stage average score across all agents evaluated per stage
    stage_scores_map: Dict[str, List[float]] = {}
    for e in evaluations:
        stage_scores_map.setdefault(e.stage, []).append(e.score)

    idea_score = round(sum(stage_scores_map.get("idea", [0.0])) / len(stage_scores_map.get("idea", [1])), 2)
    ppt_score = round(sum(stage_scores_map.get("ppt", [0.0])) / len(stage_scores_map.get("ppt", [1])), 2)
    product_score = round(sum(stage_scores_map.get("product", [0.0])) / len(stage_scores_map.get("product", [1])), 2)

    weighted_ai_score = FinalJudgeAgent.calculate_weighted_ai_score(
        idea_score=idea_score,
        ppt_score=ppt_score,
        product_score=product_score,
    )

    return APIResponse(
        success=True,
        message="Evaluation summary retrieved",
        data={
            "project_id": id,
            "project_name": project.name,
            "weighted_ai_score": weighted_ai_score,
            "breakdown": {
                "idea_stage": {"weight": 0.20, "score": idea_score},
                "ppt_stage": {"weight": 0.25, "score": ppt_score},
                "product_stage": {"weight": 0.55, "score": product_score},
            },
            "total_evaluations": len(evaluations),
        },
    )


@router.get("/{id}/evaluation/evidence", response_model=APIResponse[List[dict]])
async def get_evaluation_evidence(
    id: str,
    stage: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Returns all evidence items filterable by stage."""
    stmt = select(Evidence).join(Evaluation).where(Evaluation.project_id == id)
    if stage:
        stmt = stmt.where(Evaluation.stage == stage)

    result = await db.execute(stmt)
    evidence_items = list(result.scalars().all())

    return APIResponse(
        success=True,
        message="Evidence items retrieved",
        data=[
            {
                "id": ev.id,
                "evidence_type": ev.evidence_type,
                "source": ev.source,
                "tool_used": ev.tool_used,
                "content": ev.content,
            }
            for ev in evidence_items
        ],
    )


@router.get("/{id}/evaluation/consistency", response_model=APIResponse[dict])
async def get_evaluation_consistency(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Returns cross-stage claim verification findings."""
    result = await db.execute(select(Claim).where(Claim.project_id == id))
    claims = list(result.scalars().all())

    verified_count = sum(1 for c in claims if c.verification_status == "verified")
    total_claims = len(claims)

    return APIResponse(
        success=True,
        message="Cross-stage consistency metrics",
        data={
            "project_id": id,
            "total_claims": total_claims,
            "verified_claims": verified_count,
            "verification_rate": round(verified_count / total_claims, 2) if total_claims > 0 else 1.0,
            "claims": [
                {
                    "claim_text": c.claim_text,
                    "claim_type": c.claim_type,
                    "origin_stage": c.origin_stage,
                    "status": c.verification_status,
                }
                for c in claims
            ],
        },
    )
