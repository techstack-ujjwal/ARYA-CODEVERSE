import pytest
from backend.app.db.session import init_db, AsyncSessionLocal
from backend.app.models.db_models.models import Hackathon, Project
from backend.app.agents.orchestrator.base_agent import AgentInputContext
from backend.app.agents.orchestrator.runner import AgentRunner
from backend.app.agents.orchestrator.llm_client import StructuredLLMClient
from backend.app.models.schemas.agent_schema import EvidenceItem, ExtractedClaim

# Stage 1 (4 agents)
from backend.app.agents.idea.idea_selection_agent import IdeaSelectionAgent
from backend.app.agents.idea.problem_impact_agent import ProblemImpactAgent
from backend.app.agents.idea.feasibility_agent import FeasibilityAgent
from backend.app.agents.idea.market_agent import MarketAgent

# Stage 2 (3 agents)
from backend.app.agents.ppt.presentation_agent import PresentationAgent
from backend.app.agents.ppt.technical_architecture_agent import TechnicalArchitectureAgent
from backend.app.agents.ppt.business_impact_agent import BusinessImpactAgent

# Stage 3 (5 agents)
from backend.app.agents.product.code_quality_agent import CodeQualityAgent
from backend.app.agents.product.ui_ux_agent import UIUXAgent
from backend.app.agents.product.functionality_agent import FunctionalityAgent
from backend.app.agents.product.security_agent import SecurityAgent
from backend.app.agents.product.real_world_impact_agent import RealWorldImpactAgent

# Shared / Cross-Cutting (5 agents)
from backend.app.agents.shared.instant_feedback_agent import InstantFeedbackEngine, InstantFeedbackAgent
from backend.app.agents.shared.plagiarism_agent import PlagiarismAgent
from backend.app.agents.shared.cross_stage_consistency_agent import CrossStageConsistencyAgent
from backend.app.agents.shared.confidence_calibration_agent import ConfidenceCalibrationAgent
from backend.app.agents.shared.final_judge_agent import FinalJudgeAgent


@pytest.fixture(autouse=True)
async def ensure_db():
    await init_db()


@pytest.mark.asyncio
async def test_all_17_agents_instantiation_and_execution():
    """Verifies that all 17 agents can be instantiated and executed with structured outputs."""
    context = AgentInputContext(
        project_id="proj_17_test",
        project_name="AI Multi-Agent Auditor",
        stage="evaluation",
        submission_data={
            "problem_statement": "Judging hackathons manually is error-prone.",
            "proposed_solution": "Multi-agent evaluation platform with 17 agents.",
            "differentiation": "Ground truth tool evidence verification.",
            "deck_text": "Slide 1: Problem. Slide 2: 17 Agents Architecture. Slide 3: GTM SaaS.",
            "total_pages": 3,
            "github_url": "https://github.com/team/eval-engine",
            "live_url": "https://eval-engine.vercel.app",
            "agent_scores": [85.0, 90.0, 88.0, 86.0],
        },
        tools_evidence=[
            EvidenceItem(
                evidence_type="static_analysis",
                source="backend/app",
                tool_used="static_analysis",
                summary="High quality modular layout with tests",
            ),
            EvidenceItem(
                evidence_type="browser_automation",
                source="https://eval-engine.vercel.app",
                tool_used="uptime_checker",
                summary="Deployment reachable, latency 120ms",
            ),
            EvidenceItem(
                evidence_type="security_scan",
                source="repo",
                tool_used="security_scanner",
                summary="Clean security scan",
            ),
        ],
        prior_claims=[
            ExtractedClaim(claim_type="architecture", claim_text="17 agents orchestration", origin_stage="ppt"),
        ],
    )

    mock_client = StructuredLLMClient(provider="mock")

    # 1. Idea Stage (4 agents)
    idea_selection = await IdeaSelectionAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= idea_selection.score <= 100.0

    problem_impact = await ProblemImpactAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= problem_impact.score <= 100.0

    feasibility = await FeasibilityAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= feasibility.score <= 100.0

    market = await MarketAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= market.score <= 100.0

    # 2. PPT Stage (3 agents)
    presentation = await PresentationAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= presentation.score <= 100.0

    tech_arch = await TechnicalArchitectureAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= tech_arch.score <= 100.0

    biz_impact = await BusinessImpactAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= biz_impact.score <= 100.0

    # 3. Product Stage (5 agents)
    code_qual = await CodeQualityAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= code_qual.score <= 100.0

    ui_ux = await UIUXAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= ui_ux.score <= 100.0

    func = await FunctionalityAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= func.score <= 100.0

    sec = await SecurityAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= sec.score <= 100.0

    real_impact = await RealWorldImpactAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= real_impact.score <= 100.0

    # 4. Cross-Cutting (5 agents)
    instant_fb = await InstantFeedbackAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= instant_fb.score <= 100.0

    plag = await PlagiarismAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= plag.score <= 100.0

    consistency = await CrossStageConsistencyAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= consistency.score <= 100.0

    calib_agent = await ConfidenceCalibrationAgent(llm_client=mock_client).evaluate(context)
    assert 0.0 <= calib_agent.score <= 100.0

    # Calibration statistical helper
    stats = ConfidenceCalibrationAgent.calibrate_scores([85.0, 90.0, 88.0, 86.0])
    assert stats["mean_score"] == 87.25
    assert stats["calibrated_confidence"] >= 0.8
    assert stats["requires_human_review"] is False

    # Final Judge Synthesis
    final_output = await FinalJudgeAgent(llm_client=mock_client).synthesize_final_evaluation(
        project_name="AI Multi-Agent Auditor",
        idea_score=88.0,
        ppt_score=85.0,
        product_score=92.0,
    )
    assert final_output.weighted_ai_score > 0
    assert len(final_output.suggested_judge_questions) > 0


@pytest.mark.asyncio
async def test_multi_agent_concurrent_runner():
    """Verifies that AgentRunner executes multiple agents in parallel and saves records."""
    async with AsyncSessionLocal() as session:
        hackathon = Hackathon(name="17 Agents Challenge", status="active")
        session.add(hackathon)
        await session.commit()
        await session.refresh(hackathon)

        project = Project(
            hackathon_id=hackathon.id,
            name="Swarm Intelligence Team",
            owner_id="usr_swarm_01",
            status="idea",
        )
        session.add(project)
        await session.commit()
        await session.refresh(project)

        context = AgentInputContext(
            project_id=project.id,
            project_name=project.name,
            stage="idea",
            submission_data={"problem": "Testing 4 idea agents simultaneously"},
        )

        runner = AgentRunner(session)
        mock_client = StructuredLLMClient(provider="mock")
        idea_agents = [
            IdeaSelectionAgent(llm_client=mock_client),
            ProblemImpactAgent(llm_client=mock_client),
            FeasibilityAgent(llm_client=mock_client),
            MarketAgent(llm_client=mock_client),
        ]

        saved_evals = await runner.run_stage_pipeline(
            project_id=project.id,
            stage="idea",
            agents=idea_agents,
            context=context,
        )

        assert len(saved_evals) == 4
        agent_names = {e.agent_name for e in saved_evals}
        assert "idea_selection_agent" in agent_names
        assert "problem_impact_agent" in agent_names
        assert "feasibility_agent" in agent_names
        assert "market_agent" in agent_names
