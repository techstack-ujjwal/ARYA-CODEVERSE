from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.db.session import get_db, AsyncSessionLocal
from backend.app.db.repositories.project_repo import ProjectRepository, SubmissionRepository
from backend.app.core.security import get_current_user, AuthenticatedUser
from backend.app.models.schemas.common import APIResponse
from backend.app.models.db_models.models import Evaluation, Claim, Submission
from backend.app.agents.ppt.presentation_agent import PresentationAgent
from backend.app.agents.ppt.technical_architecture_agent import TechnicalArchitectureAgent
from backend.app.agents.ppt.business_impact_agent import BusinessImpactAgent
from backend.app.agents.orchestrator.base_agent import AgentInputContext
from backend.app.agents.orchestrator.runner import AgentRunner
from backend.app.tools.pdf_parser import PDFParser

router = APIRouter()
MAX_PPT_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/{id}/ppt/upload", response_model=APIResponse[dict], status_code=status.HTTP_201_CREATED)
async def upload_ppt(
    id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Uploads and parses presentation PDF for Stage 2 evaluation (max 10MB)."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_PPT_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PDF file size exceeds maximum limit of 10MB",
        )

    parsed_pdf = PDFParser.extract_text_from_bytes(file_bytes)

    submission_repo = SubmissionRepository(db)
    existing_sub = await submission_repo.get_by_project_and_stage(id, stage="ppt")

    payload = {
        "filename": file.filename,
        "total_pages": parsed_pdf["total_pages"],
        "deck_text": parsed_pdf["full_text"],
        "metadata": parsed_pdf["metadata"],
    }

    if existing_sub:
        await submission_repo.update(existing_sub.id, payload=payload, submitted_by=current_user.user_id)
        sub_id = existing_sub.id
    else:
        new_sub = await submission_repo.create(
            project_id=id,
            stage="ppt",
            payload=payload,
            submitted_by=current_user.user_id,
        )
        sub_id = new_sub.id

    return APIResponse(
        success=True,
        message=f"Presentation {file.filename} uploaded and parsed successfully ({parsed_pdf['total_pages']} slides)",
        data={"project_id": id, "submission_id": sub_id, "total_pages": parsed_pdf["total_pages"]},
    )


async def _run_ppt_eval_background(project_id: str):
    """Background task running 3 PPT agents in parallel, extracting claims, and saving to DB."""
    async with AsyncSessionLocal() as session:
        project_repo = ProjectRepository(session)
        project = await project_repo.get_by_id(project_id)
        if not project:
            return

        submission_repo = SubmissionRepository(session)
        submission = await submission_repo.get_by_project_and_stage(project_id, stage="ppt")
        sub_payload = submission.payload if submission else {}

        context = AgentInputContext(
            project_id=project.id,
            project_name=project.name,
            stage="ppt",
            submission_data=sub_payload,
        )

        # 1. Execute Technical Architecture Agent to extract claims
        tech_agent = TechnicalArchitectureAgent()
        tech_output = await tech_agent.evaluate(context)

        # Save extracted claims to DB (purging prior unverified claims for cleanliness)
        if hasattr(tech_output, "extracted_claims") and tech_output.extracted_claims:
            from sqlalchemy import delete
            await session.execute(delete(Claim).where(Claim.project_id == project.id, Claim.verification_status == "unverified"))
            for c in tech_output.extracted_claims:
                claim = Claim(
                    project_id=project.id,
                    origin_stage="ppt",
                    claim_type=c.claim_type,
                    claim_text=c.claim_text,
                    verification_status="unverified",
                )
                session.add(claim)
            await session.commit()

        # 2. Run all 3 PPT agents concurrently
        runner = AgentRunner(session)
        presentation_agent = PresentationAgent()
        business_agent = BusinessImpactAgent()

        await runner.run_stage_pipeline(
            project_id=project.id,
            stage="ppt",
            agents=[presentation_agent, tech_agent, business_agent],
            context=context,
        )


@router.post("/{id}/ppt/evaluate", response_model=APIResponse[dict])
async def evaluate_ppt(
    id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Enqueues Stage 2 (Presentation, Technical Architecture, Business Impact) evaluation tasks."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    background_tasks.add_task(_run_ppt_eval_background, id)

    return APIResponse(
        success=True,
        message="PPT evaluation task queued successfully (3-agent pipeline)",
        data={"project_id": id, "stage": "ppt", "status": "processing"},
    )


@router.get("/{id}/ppt/claims", response_model=APIResponse[List[dict]])
async def get_ppt_claims(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Returns claims extracted from the presentation PDF stored in DB."""
    result = await db.execute(select(Claim).where(Claim.project_id == id))
    claims = list(result.scalars().all())

    return APIResponse(
        success=True,
        message="Claims retrieved",
        data=[
            {
                "id": c.id,
                "claim_type": c.claim_type,
                "claim_text": c.claim_text,
                "verification_status": c.verification_status,
                "origin_stage": c.origin_stage,
            }
            for c in claims
        ],
    )


@router.get("/{id}/ppt/evaluation", response_model=APIResponse[dict])
async def get_ppt_evaluation(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Retrieves PPT stage evaluation breakdown across all 3 agents."""
    result = await db.execute(
        select(Evaluation)
        .where(Evaluation.project_id == id, Evaluation.stage == "ppt")
        .options(selectinload(Evaluation.evidence_items))
    )
    evaluations = list(result.scalars().all())

    if not evaluations:
        return APIResponse(
            success=True,
            message="No PPT evaluation found for this project",
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

    return APIResponse(
        success=True,
        message="PPT evaluation retrieved",
        data={
            "project_id": id,
            "stage": "ppt",
            "score": avg_score,
            "confidence": avg_confidence,
            "agents": agent_breakdown,
        },
    )
