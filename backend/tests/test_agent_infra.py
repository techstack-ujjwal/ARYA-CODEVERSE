import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import AsyncSessionLocal, init_db
from backend.app.models.db_models.models import Hackathon, Project, Evaluation, Evidence
from backend.app.models.schemas.agent_schema import (
    BaseAgentOutput,
    EvidenceItem,
    IdeaEvaluationOutput,
    PPTEvaluationOutput,
    ProductEvaluationOutput,
    InstantFeedbackOutput,
    FinalSynthesisOutput,
)
from backend.app.agents.orchestrator.llm_client import StructuredLLMClient
from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.agents.orchestrator.runner import AgentRunner


class MockIdeaAgent(BaseAgent):
    name = "idea_evaluator"
    stage = "idea"
    output_schema = IdeaEvaluationOutput

    def build_prompt(self, context: AgentInputContext) -> str:
        return f"Evaluate idea for project {context.project_name}: {context.submission_data.get('problem')}"


class MockCodeQualityAgent(BaseAgent):
    name = "code_quality_agent"
    stage = "product"
    output_schema = ProductEvaluationOutput

    def build_prompt(self, context: AgentInputContext) -> str:
        return f"Evaluate code quality for {context.project_name} at {context.submission_data.get('github_url')}"


@pytest.fixture(autouse=True)
async def ensure_db():
    await init_db()


@pytest.mark.asyncio
async def test_agent_schemas_validation():
    # 1. BaseAgentOutput
    base_out = BaseAgentOutput(
        score=92.3456,
        confidence=0.954,
        summary="High performance modular engine",
        reasoning="All criteria satisfied with high rigor.",
        evidence=[
            EvidenceItem(
                evidence_type="static_analysis",
                source="backend/app/main.py",
                tool_used="radon",
                summary="Cyclomatic complexity is A (average 2.1)",
            )
        ],
        risks=["Ensure cloud timeouts are bounded"],
        questions=["What is the cache invalidation strategy?"],
    )
    assert base_out.score == 92.35  # Validated round
    assert base_out.confidence == 0.95
    assert len(base_out.evidence) == 1

    # 2. IdeaEvaluationOutput
    idea_out = IdeaEvaluationOutput(
        score=88.0,
        summary="Novel concept",
        reasoning="Solves verified user pain point",
        uniqueness_score=90.0,
        problem_clarity_score=85.0,
        feasibility_score=89.0,
        market_differentiation_score=88.0,
        identified_competitors=["Competitor X"],
    )
    assert idea_out.uniqueness_score == 90.0
    assert "Competitor X" in idea_out.identified_competitors


@pytest.mark.asyncio
async def test_llm_client_structured_generation():
    client = StructuredLLMClient(provider="mock")
    result = await client.generate_structured(
        prompt="Evaluate hackathon project XYZ",
        response_model=IdeaEvaluationOutput,
    )
    assert isinstance(result, IdeaEvaluationOutput)
    assert 0.0 <= result.score <= 100.0
    assert 0.0 <= result.confidence <= 1.0
    assert result.uniqueness_score > 0


@pytest.mark.asyncio
async def test_base_agent_execution_and_telemetry():
    agent = MockIdeaAgent(llm_client=StructuredLLMClient(provider="mock"))
    context = AgentInputContext(
        project_id="proj_test_001",
        project_name="SuperAgent AI",
        stage="idea",
        submission_data={"problem": "Slow manual PR reviews", "solution": "AI reviewer"},
        tools_evidence=[
            EvidenceItem(
                evidence_type="web_search",
                source="tavily",
                tool_used="tavily_search",
                summary="No direct competitor with multi-agent consensus found",
            )
        ],
    )

    output = await agent.evaluate(context)
    assert isinstance(output, IdeaEvaluationOutput)
    assert output.score > 0
    assert "execution_time_ms" in output.metrics
    assert output.metrics["agent_name"] == "idea_evaluator"
    # Verify tool evidence was merged
    assert any(e.source == "tavily" for e in output.evidence)


@pytest.mark.asyncio
async def test_agent_runner_pipeline_and_db_persistence():
    async with AsyncSessionLocal() as session:
        # Create Hackathon & Project in DB
        hackathon = Hackathon(
            name="Test Agents Hackathon",
            status="active",
        )
        session.add(hackathon)
        await session.commit()
        await session.refresh(hackathon)

        project = Project(
            hackathon_id=hackathon.id,
            name="Agentic Evaluator Team",
            owner_id="user_owner_01",
            status="idea",
        )
        session.add(project)
        await session.commit()
        await session.refresh(project)

        # Run multi-agent stage pipeline via AgentRunner
        runner = AgentRunner(session)
        agent1 = MockIdeaAgent(llm_client=StructuredLLMClient(provider="mock"))
        agent2 = MockCodeQualityAgent(llm_client=StructuredLLMClient(provider="mock"))

        context = AgentInputContext(
            project_id=project.id,
            project_name=project.name,
            stage="idea",
            submission_data={"problem": "Inefficient hackathon judging"},
        )

        saved_evals = await runner.run_stage_pipeline(
            project_id=project.id,
            stage="idea",
            agents=[agent1, agent2],
            context=context,
        )

        assert len(saved_evals) == 2
        assert all(isinstance(e, Evaluation) for e in saved_evals)
        assert saved_evals[0].project_id == project.id
        assert len(saved_evals[0].evidence_items) >= 1

        # Check project status updated to idea
        await session.refresh(project)
        assert project.status == "idea"
