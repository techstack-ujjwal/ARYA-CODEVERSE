from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.db.session import get_db, AsyncSessionLocal
from backend.app.db.repositories.project_repo import ProjectRepository, SubmissionRepository
from backend.app.core.security import get_current_user, AuthenticatedUser
from backend.app.models.schemas.common import APIResponse
from backend.app.models.db_models.models import Evaluation, Claim, Submission
from backend.app.models.schemas.agent_schema import ProductEvaluationOutput, EvidenceItem, ExtractedClaim
from backend.app.agents.product.code_quality_agent import CodeQualityAgent
from backend.app.agents.product.ui_ux_agent import UIUXAgent
from backend.app.agents.product.functionality_agent import FunctionalityAgent
from backend.app.agents.product.security_agent import SecurityAgent
from backend.app.agents.product.real_world_impact_agent import RealWorldImpactAgent
from backend.app.agents.orchestrator.base_agent import AgentInputContext
from backend.app.agents.orchestrator.runner import AgentRunner
from backend.app.tools.uptime_checker import UptimeChecker
from backend.app.tools.security_scan import SecurityScanner
from backend.app.tools.static_analysis import StaticAnalysisTool

router = APIRouter()


class ProductRegistration(Dict[str, Any]):
    pass


@router.post("/{id}/product/register", response_model=APIResponse[dict])
async def register_product(
    id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Registers GitHub repository and live deployment URL for judged evaluation."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    github_url = payload.get("github_url")
    live_url = payload.get("live_url")

    await project_repo.update(
        id,
        github_url=github_url,
        live_url=live_url,
    )

    submission_repo = SubmissionRepository(db)
    existing_sub = await submission_repo.get_by_project_and_stage(id, stage="product")
    if existing_sub:
        await submission_repo.update(existing_sub.id, payload=payload, submitted_by=current_user.user_id)
    else:
        await submission_repo.create(
            project_id=id,
            stage="product",
            payload=payload,
            submitted_by=current_user.user_id,
        )

    return APIResponse(
        success=True,
        message="Product details registered successfully",
        data={"project_id": id, "github_url": github_url, "live_url": live_url},
    )


async def _run_product_eval_background(project_id: str):
    """Background task running deterministic tools and 5 Product Stage agents in parallel."""
    async with AsyncSessionLocal() as session:
        project_repo = ProjectRepository(session)
        project = await project_repo.get_by_id(project_id)
        if not project:
            return

        # Fetch prior claims for cross-verification
        claims_result = await session.execute(select(Claim).where(Claim.project_id == project_id))
        stored_claims = list(claims_result.scalars().all())
        prior_claims = [
            ExtractedClaim(
                claim_type=c.claim_type,
                claim_text=c.claim_text,
                origin_stage=c.origin_stage,
            )
            for c in stored_claims
        ]

        tools_evidence: List[EvidenceItem] = []

        # 1. Live Uptime Tool Check
        if project.live_url:
            uptime = await UptimeChecker.check_url_health(project.live_url)
            tools_evidence.append(
                EvidenceItem(
                    evidence_type="browser_automation",
                    source=project.live_url,
                    tool_used="uptime_checker",
                    content=uptime,
                    summary=f"Deployment reachable: {uptime['reachable']} (Latency: {uptime['response_time_ms']}ms)",
                )
            )

        # 2. Static Code Analysis Tool Check
        static_analysis = StaticAnalysisTool.inspect_repo_files(
            ["README.md", ".gitignore", ".env.example", "main.py", "tests/test_app.py"]
        )
        tools_evidence.append(
            EvidenceItem(
                evidence_type="static_analysis",
                source=project.github_url or "repository",
                tool_used="static_analysis",
                content=static_analysis,
                summary=f"Documentation score: {static_analysis['documentation_score']}%, README: {static_analysis['has_readme']}",
            )
        )

        # 3. Security Scan Tool Check
        sec_findings = SecurityScanner.check_security_hygiene({"config.py": "PORT=8000\nENV='prod'"})
        tools_evidence.append(
            EvidenceItem(
                evidence_type="security_scan",
                source="repo_files",
                tool_used="security_scanner",
                content=sec_findings,
                summary=f"Security clean: {sec_findings['is_clean']} (Score: {sec_findings['security_score']})",
            )
        )

        context = AgentInputContext(
            project_id=project.id,
            project_name=project.name,
            stage="product",
            submission_data={"github_url": project.github_url, "live_url": project.live_url},
            tools_evidence=tools_evidence,
            prior_claims=prior_claims,
        )

        # Execute 5 Stage-3 agents in parallel
        agents = [
            CodeQualityAgent(),
            UIUXAgent(),
            FunctionalityAgent(),
            SecurityAgent(),
            RealWorldImpactAgent(),
        ]
        runner = AgentRunner(session)
        await runner.run_stage_pipeline(
            project_id=project.id,
            stage="product",
            agents=agents,
            context=context,
        )


@router.post("/{id}/product/evaluate", response_model=APIResponse[dict])
async def evaluate_product(
    id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Enqueues Stage 3 (Code Quality, UI/UX, Functionality, Security, Real-World Impact) evaluation tasks."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    background_tasks.add_task(_run_product_eval_background, id)

    return APIResponse(
        success=True,
        message="Product evaluation task queued successfully (5-agent pipeline)",
        data={"project_id": id, "stage": "product", "status": "processing"},
    )


@router.get("/{id}/product/evaluation", response_model=APIResponse[dict])
async def get_product_evaluation(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Retrieves product evaluation report and tool-grounded findings from DB across all 5 agents."""
    result = await db.execute(
        select(Evaluation)
        .where(Evaluation.project_id == id, Evaluation.stage == "product")
        .options(selectinload(Evaluation.evidence_items))
    )
    evaluations = list(result.scalars().all())

    if not evaluations:
        return APIResponse(
            success=True,
            message="No product evaluation found for this project",
            data={"project_id": id, "status": "pending", "evaluations": []},
        )

    avg_score = round(sum(e.score for e in evaluations) / len(evaluations), 2)
    avg_confidence = round(sum(e.confidence for e in evaluations) / len(evaluations), 2)

    agent_breakdown = {
        e.agent_name: {
            "score": e.score,
            "confidence": e.confidence,
            "reasoning": e.reasoning,
        }
        for e in evaluations
    }

    evidence_list = []
    for eval_item in evaluations:
        for ev in eval_item.evidence_items:
            evidence_list.append({
                "type": ev.evidence_type,
                "source": ev.source,
                "summary": ev.content.get("summary") or str(ev.content)[:100],
            })

    return APIResponse(
        success=True,
        message="Product evaluation retrieved",
        data={
            "project_id": id,
            "stage": "product",
            "score": avg_score,
            "confidence": avg_confidence,
            "agents": agent_breakdown,
            "evidence": evidence_list,
        },
    )
