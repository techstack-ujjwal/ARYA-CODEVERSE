import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.db.session import init_db, AsyncSessionLocal
from backend.app.models.db_models.models import Evaluation, Hackathon, Project
from backend.app.agents.shared.cross_stage_consistency_agent import CrossStageConsistencyAgent
from backend.app.agents.shared.plagiarism_agent import PlagiarismAgent
from backend.app.agents.shared.final_judge_agent import FinalJudgeAgent
from backend.app.agents.orchestrator.base_agent import AgentInputContext
from backend.app.models.schemas.agent_schema import ExtractedClaim, EvidenceItem


@pytest.fixture(autouse=True)
async def ensure_db():
    await init_db()


@pytest.mark.asyncio
async def test_cross_cutting_agents():
    # 1. Test CrossStageConsistencyAgent
    consistency_agent = CrossStageConsistencyAgent()
    context = AgentInputContext(
        project_id="proj_consist_01",
        project_name="Autonomous Auditor",
        stage="evaluation",
        prior_claims=[
            ExtractedClaim(claim_type="architecture", claim_text="Async event queue with Celery", origin_stage="ppt"),
            ExtractedClaim(claim_type="feature", claim_text="Real-time WebSocket dashboard", origin_stage="idea"),
        ],
        tools_evidence=[
            EvidenceItem(evidence_type="static_analysis", source="backend/workers", tool_used="static_analysis", summary="Celery worker files found"),
        ],
    )
    consist_output = await consistency_agent.evaluate(context)
    assert consist_output.score >= 0.0
    assert consist_output.confidence >= 0.0

    # 2. Test PlagiarismAgent
    plag_agent = PlagiarismAgent()
    plag_output = await plag_agent.evaluate(context)
    assert plag_output.score >= 0.0

    # 3. Test FinalJudgeAgent weighted calculation
    weighted_ai = FinalJudgeAgent.calculate_weighted_ai_score(
        idea_score=90.0,
        ppt_score=80.0,
        product_score=100.0,
        rubric_weights={"idea": 0.20, "ppt": 0.25, "product": 0.55},
    )
    # Expected: (90*0.2) + (80*0.25) + (100*0.55) = 18 + 20 + 55 = 93.0
    assert weighted_ai == 93.0


@pytest.mark.asyncio
async def test_judging_and_finalization_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        admin_header = {"Authorization": "Bearer test_token_admin"}
        judge_header = {"Authorization": "Bearer test_token_judge"}

        # 1. Create Hackathon
        hack_resp = await ac.post(
            "/api/v1/admin/hackathons",
            json={"name": "Finals AI Hackathon", "status": "active"},
            headers=admin_header,
        )
        hack_id = hack_resp.json()["data"]["id"]

        # 2. Create Project
        proj_resp = await ac.post(
            "/api/v1/projects",
            json={"hackathon_id": hack_id, "name": "Team Champion"},
            headers=admin_header,
        )
        proj_id = proj_resp.json()["data"]["id"]

        # Seed Stage Evaluations into DB
        async with AsyncSessionLocal() as session:
            session.add(Evaluation(project_id=proj_id, stage="idea", agent_name="idea_agent", score=90.0, reasoning="Strong idea"))
            session.add(Evaluation(project_id=proj_id, stage="ppt", agent_name="ppt_agent", score=80.0, reasoning="Clear architecture"))
            session.add(Evaluation(project_id=proj_id, stage="product", agent_name="product_agent", score=100.0, reasoning="Flawless build"))
            await session.commit()

        # 3. Submit Judge Score
        judge_score_resp = await ac.post(
            f"/api/v1/judging/{proj_id}/score",
            json={"score": 95.0, "feedback": "Exceptional live demo and engineering maturity."},
            headers=judge_header,
        )
        assert judge_score_resp.status_code == 200
        assert judge_score_resp.json()["data"]["human_score"] == 95.0

        # 4. Compute Final Score (70% AI + 30% Human)
        # AI score = 93.0, Human score = 95.0
        # Expected: (93.0 * 0.70) + (95.0 * 0.30) = 65.1 + 28.5 = 93.6
        compute_resp = await ac.post(
            f"/api/v1/finalization/{proj_id}/compute",
            headers=admin_header,
        )
        assert compute_resp.status_code == 200
        compute_data = compute_resp.json()["data"]
        assert compute_data["ai_score"] == 93.0
        assert compute_data["human_score"] == 95.0
        assert compute_data["final_score"] == 93.6

        # 5. Fetch Leaderboard
        leaderboard_resp = await ac.get(
            f"/api/v1/finalization/leaderboard?hackathon_id={hack_id}",
            headers=admin_header,
        )
        assert leaderboard_resp.status_code == 200
        leaderboard = leaderboard_resp.json()["data"]
        assert len(leaderboard) >= 1
        assert leaderboard[0]["project_id"] == proj_id
        assert leaderboard[0]["final_score"] == 93.6
        assert leaderboard[0]["rank"] == 1
