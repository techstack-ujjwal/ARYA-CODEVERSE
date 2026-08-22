from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.db.session import get_db, AsyncSessionLocal
from backend.app.db.repositories.project_repo import ProjectRepository, SubmissionRepository
from backend.app.core.security import get_current_user, AuthenticatedUser
from backend.app.models.schemas.common import APIResponse
from backend.app.models.db_models.models import Evaluation, Submission
from backend.app.models.schemas.agent_schema import IdeaEvaluationOutput, EvidenceItem
from backend.app.agents.idea.idea_selection_agent import IdeaSelectionAgent
from backend.app.agents.idea.problem_impact_agent import ProblemImpactAgent
from backend.app.agents.idea.feasibility_agent import FeasibilityAgent
from backend.app.agents.idea.market_agent import MarketAgent
from backend.app.agents.orchestrator.base_agent import AgentInputContext
from backend.app.agents.orchestrator.runner import AgentRunner
from backend.app.tools.web_search import WebSearchTool

router = APIRouter()


def _count_words(data: Any) -> int:
    """Recursively computes total word count of all text fields in payload."""
    if isinstance(data, str):
        return len(data.split())
    elif isinstance(data, dict):
        return sum(_count_words(v) for v in data.values())
    elif isinstance(data, list):
        return sum(_count_words(item) for item in data)
    return 0


@router.post("/{id}/idea", response_model=APIResponse[dict], status_code=status.HTTP_201_CREATED)
async def submit_idea(
    id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Submits idea text for Stage 1 evaluation (max 500 words total)."""
    total_words = _count_words(payload)
    if total_words > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Idea submission exceeds maximum limit of 500 words",
        )

    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    submission_repo = SubmissionRepository(db)
    existing_sub = await submission_repo.get_by_project_and_stage(id, stage="idea")

    if existing_sub:
        await submission_repo.update(existing_sub.id, payload=payload, submitted_by=current_user.user_id)
        sub_id = existing_sub.id
    else:
        new_sub = await submission_repo.create(
            project_id=id,
            stage="idea",
            payload=payload,
            submitted_by=current_user.user_id,
        )
        sub_id = new_sub.id

    return APIResponse(
        success=True,
        message="Idea submitted successfully",
        data={"project_id": id, "submission_id": sub_id, "status": "submitted"},
    )


@router.get("/{id}/idea/submission", response_model=APIResponse[dict])
async def get_idea_submission(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Retrieves saved idea submission text fields for this project."""
    submission_repo = SubmissionRepository(db)
    submission = await submission_repo.get_by_project_and_stage(id, stage="idea")
    return APIResponse(
        success=True,
        message="Idea submission retrieved",
        data=submission.payload if submission else {},
    )


async def _run_idea_eval_background(project_id: str):
    """Background task to run Idea Stage 4-agent parallel evaluation and persist to DB."""
    async with AsyncSessionLocal() as session:
        project_repo = ProjectRepository(session)
        project = await project_repo.get_by_id(project_id)
        if not project:
            return

        submission_repo = SubmissionRepository(session)
        submission = await submission_repo.get_by_project_and_stage(project_id, stage="idea")
        sub_payload = submission.payload if submission else {}

        # Run live market web search
        query = sub_payload.get("problem_statement") or sub_payload.get("problem") or project.name
        search_results = await WebSearchTool.search_market(query=query)
        tools_evidence = [
            EvidenceItem(
                evidence_type="web_search",
                source=r.get("url", "web"),
                tool_used="tavily_search",
                content=r,
                summary=r.get("title") or r.get("content")[:100],
            )
            for r in search_results
        ]

        context = AgentInputContext(
            project_id=project.id,
            project_name=project.name,
            stage="idea",
            submission_data=sub_payload,
            tools_evidence=tools_evidence,
        )

        runner = AgentRunner(session)
        # Execute all 4 Stage-1 agents in parallel
        agents = [
            IdeaSelectionAgent(),
            ProblemImpactAgent(),
            FeasibilityAgent(),
            MarketAgent(),
        ]
        await runner.run_stage_pipeline(
            project_id=project.id,
            stage="idea",
            agents=agents,
            context=context,
        )


@router.post("/{id}/idea/evaluate", response_model=APIResponse[dict])
async def evaluate_idea(
    id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Enqueues Stage 1 (Idea Selection, Problem & Impact, Feasibility, Market) evaluation tasks."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    background_tasks.add_task(_run_idea_eval_background, id)

    return APIResponse(
        success=True,
        message="Idea evaluation task queued successfully (4-agent pipeline)",
        data={"project_id": id, "stage": "idea", "status": "processing"},
    )


@router.get("/{id}/idea/evaluation", response_model=APIResponse[dict])
async def get_idea_evaluation(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Retrieves idea stage evaluation scores and agent evidence from DB."""
    result = await db.execute(
        select(Evaluation)
        .where(Evaluation.project_id == id, Evaluation.stage == "idea")
        .options(selectinload(Evaluation.evidence_items))
    )
    evaluations = list(result.scalars().all())

    if not evaluations:
        return APIResponse(
            success=True,
            message="No idea evaluation found for this project",
            data={"project_id": id, "status": "pending", "evaluations": []},
        )

    # Average score across all Idea stage agents
    avg_score = round(sum(e.score for e in evaluations) / len(evaluations), 2)
    avg_confidence = round(sum(e.confidence for e in evaluations) / len(evaluations), 2)

    evidence_list = []
    agent_breakdown = {}
    for eval_item in evaluations:
        agent_breakdown[eval_item.agent_name] = {
            "score": eval_item.score,
            "confidence": eval_item.confidence,
            "reasoning": eval_item.reasoning,
        }
        for ev in eval_item.evidence_items:
            evidence_list.append({
                "type": ev.evidence_type,
                "source": ev.source,
                "summary": ev.content.get("summary") or str(ev.content)[:100],
            })

    return APIResponse(
        success=True,
        message="Idea evaluation retrieved",
        data={
            "project_id": id,
            "stage": "idea",
            "score": avg_score,
            "confidence": avg_confidence,
            "reasoning": evaluations[0].reasoning if evaluations else "",
            "agents": agent_breakdown,
            "evidence": evidence_list,
        },
    )
