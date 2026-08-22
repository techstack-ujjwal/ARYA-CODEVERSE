"""
Comprehensive API route tests covering every endpoint in the system.
Tests exercise the full request/response cycle including auth, validation, and DB persistence.
"""
import io
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.db.session import AsyncSessionLocal
from backend.app.models.db_models.models import (
    Evaluation, PlagiarismFlag, Claim, FeedbackReport,
)


async def create_test_project(ac: AsyncClient, admin_h: dict, name_prefix: str = "Test"):
    """Helper to create an isolated Hackathon and Project for each test."""
    uid = uuid.uuid4().hex[:6]
    hack = await ac.post(
        "/api/v1/admin/hackathons",
        json={"name": f"Hackathon_{name_prefix}_{uid}", "status": "active"},
        headers=admin_h
    )
    assert hack.status_code == 201, f"Failed to create test hackathon: {hack.text}"
    hid = hack.json()["data"]["id"]
    
    proj = await ac.post(
        "/api/v1/projects",
        json={
            "hackathon_id": hid,
            "name": f"Team_{name_prefix}_{uid}",
            "description": "Automated test project",
            "github_url": "https://github.com/techstack-ujjwal",
            "live_url": "https://example.com"
        },
        headers=admin_h
    )
    assert proj.status_code == 201, f"Failed to create test project: {proj.text}"
    return hid, proj.json()["data"]["id"]


# ── Auth Routes ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_auth_me_returns_user_profile():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/auth/me", headers={"Authorization": "Bearer test_token_participant"})
    assert resp.status_code == 200
    assert resp.json()["data"]["role"] == "participant"


@pytest.mark.asyncio
async def test_auth_me_admin_role():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/auth/me", headers={"Authorization": "Bearer test_token_admin"})
    assert resp.status_code == 200
    assert resp.json()["data"]["role"] == "admin"


# ── Health Routes ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


@pytest.mark.asyncio
async def test_agents_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/health/agents")
    assert resp.status_code == 200
    data = resp.json()
    assert "openai" in data
    assert "gemini" in data
    assert "tavily" in data



# ── Hackathon Admin Routes ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_hackathon_crud():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        h = {"Authorization": "Bearer test_token_admin"}
        uid = uuid.uuid4().hex[:6]

        # CREATE
        resp = await ac.post("/api/v1/admin/hackathons", json={
            "name": f"Route Test Hackathon {uid}",
            "description": "Integration test hackathon",
            "rubric_weights": {"idea": 0.20, "ppt": 0.25, "product": 0.55},
            "status": "active",
        }, headers=h)
        assert resp.status_code == 201
        hack_id = resp.json()["data"]["id"]

        # READ
        resp = await ac.get(f"/api/v1/admin/hackathons/{hack_id}", headers=h)
        assert resp.status_code == 200
        assert resp.json()["data"]["name"] == f"Route Test Hackathon {uid}"

        # LIST
        resp = await ac.get("/api/v1/admin/hackathons", headers=h)
        assert resp.status_code == 200
        assert any(x["id"] == hack_id for x in resp.json()["data"])

        # UPDATE
        resp = await ac.patch(f"/api/v1/admin/hackathons/{hack_id}", json={
            "name": f"Updated Hackathon Name {uid}",
        }, headers=h)
        assert resp.status_code == 200
        assert resp.json()["data"]["name"] == f"Updated Hackathon Name {uid}"


@pytest.mark.asyncio
async def test_hackathon_not_found():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/admin/hackathons/nonexistent_id_999", headers={"Authorization": "Bearer test_token_admin"})
    assert resp.status_code == 404


# ── Project Routes ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_project_full_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        admin_h = {"Authorization": "Bearer test_token_admin"}
        part_h = {"Authorization": "Bearer test_token_participant"}
        uid = uuid.uuid4().hex[:6]

        # Create hackathon
        hack = await ac.post("/api/v1/admin/hackathons", json={"name": f"Proj Lifecycle Hack {uid}", "status": "active"}, headers=admin_h)
        hack_id = hack.json()["data"]["id"]

        # CREATE project
        resp = await ac.post("/api/v1/projects", json={
            "hackathon_id": hack_id,
            "name": f"Lifecycle Team {uid}",
            "description": "Full lifecycle test",
            "github_url": "https://github.com/techstack-ujjwal",
            "live_url": "https://example.com",
        }, headers=part_h)
        assert resp.status_code == 201
        proj_id = resp.json()["data"]["id"]

        # GET project
        resp = await ac.get(f"/api/v1/projects/{proj_id}", headers=part_h)
        assert resp.status_code == 200
        assert resp.json()["data"]["name"] == f"Lifecycle Team {uid}"

        # LIST projects
        resp = await ac.get(f"/api/v1/projects?hackathon_id={hack_id}", headers=part_h)
        assert resp.status_code == 200

        # UPDATE project
        resp = await ac.patch(f"/api/v1/projects/{proj_id}", json={"name": f"Updated Team {uid}"}, headers=part_h)
        assert resp.status_code == 200

        # STATUS project
        resp = await ac.get(f"/api/v1/projects/{proj_id}/status", headers=part_h)
        assert resp.status_code == 200
        assert "stages" in resp.json()["data"]

        # DELETE project
        resp = await ac.delete(f"/api/v1/projects/{proj_id}", headers=part_h)
        assert resp.status_code == 200


@pytest.mark.asyncio
async def test_project_not_found():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/projects/nonexistent_999", headers={"Authorization": "Bearer test_token_admin"})
    assert resp.status_code == 404


# ── Idea Stage Routes ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_idea_submit_and_evaluate():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        h = {"Authorization": "Bearer test_token_admin"}
        _, pid = await create_test_project(ac, h, name_prefix="Idea")

        # Submit idea
        resp = await ac.post(f"/api/v1/projects/{pid}/idea", json={
            "problem_statement": "Manual code review is slow",
            "proposed_solution": "AI-powered multi-agent reviewer",
        }, headers=h)
        assert resp.status_code == 201

        # Trigger evaluation
        resp = await ac.post(f"/api/v1/projects/{pid}/idea/evaluate", headers=h)
        assert resp.status_code == 200
        assert resp.json()["data"]["status"] == "processing"

        # Get evaluation
        resp = await ac.get(f"/api/v1/projects/{pid}/idea/evaluation", headers=h)
        assert resp.status_code == 200

        # Test word limit validation (>500 words)
        large_text = " ".join(["innovative"] * 501)
        resp = await ac.post(f"/api/v1/projects/{pid}/idea", json={
            "problem_statement": large_text,
        }, headers=h)
        assert resp.status_code == 400
        assert "500 words" in resp.json()["detail"]


# ── PPT Stage Routes ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_ppt_upload_and_evaluate():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        h = {"Authorization": "Bearer test_token_admin"}
        _, pid = await create_test_project(ac, h, name_prefix="PPT")

        # Upload minimal PDF
        pdf_bytes = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF"
        resp = await ac.post(
            f"/api/v1/projects/{pid}/ppt/upload",
            files={"file": ("deck.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
            headers=h,
        )
        assert resp.status_code == 201

        # Test PDF file size limit (>10MB)
        oversized_pdf = b"%PDF-1.4 " + (b"0" * (10 * 1024 * 1024 + 50))
        resp = await ac.post(
            f"/api/v1/projects/{pid}/ppt/upload",
            files={"file": ("large_deck.pdf", io.BytesIO(oversized_pdf), "application/pdf")},
            headers=h,
        )
        assert resp.status_code == 400
        assert "10MB" in resp.json()["detail"]

        # Trigger evaluation
        resp = await ac.post(f"/api/v1/projects/{pid}/ppt/evaluate", headers=h)
        assert resp.status_code == 200

        # Get claims
        resp = await ac.get(f"/api/v1/projects/{pid}/ppt/claims", headers=h)
        assert resp.status_code == 200


# ── Product Stage Routes ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_product_register_and_evaluate():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        h = {"Authorization": "Bearer test_token_admin"}
        _, pid = await create_test_project(ac, h, name_prefix="Prod")

        # Register product
        resp = await ac.post(f"/api/v1/projects/{pid}/product/register", json={
            "github_url": "https://github.com/techstack-ujjwal",
            "live_url": "https://example.com",
        }, headers=h)
        assert resp.status_code == 200

        # Trigger evaluation
        resp = await ac.post(f"/api/v1/projects/{pid}/product/evaluate", headers=h)
        assert resp.status_code == 200

        # Get evaluation
        resp = await ac.get(f"/api/v1/projects/{pid}/product/evaluation", headers=h)
        assert resp.status_code == 200


# ── Feedback Routes ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_feedback_submit_and_retrieve():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        h = {"Authorization": "Bearer test_token_participant"}
        admin_h = {"Authorization": "Bearer test_token_admin"}
        _, pid = await create_test_project(ac, admin_h, name_prefix="FB")

        # Submit feedback
        resp = await ac.post(f"/api/v1/projects/{pid}/feedback/submit", json={
            "github_url": "https://github.com/techstack-ujjwal",
            "live_url": "https://example.com",
        }, headers=h)
        assert resp.status_code == 202
        assert resp.json()["data"]["overall_health"] in ("ok", "needs_attention", "at_risk")

        # Get latest feedback
        resp = await ac.get(f"/api/v1/projects/{pid}/feedback/latest", headers=h)
        assert resp.status_code == 200
        assert resp.json()["data"]["project_id"] == pid


# ── Evaluation Routes ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_evaluation_summary_and_evidence():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        h = {"Authorization": "Bearer test_token_admin"}
        _, pid = await create_test_project(ac, h, name_prefix="Summary")

        # Seed evaluations
        async with AsyncSessionLocal() as session:
            session.add(Evaluation(project_id=pid, stage="idea", agent_name="idea_agent", score=85.0, reasoning="Good"))
            session.add(Evaluation(project_id=pid, stage="ppt", agent_name="ppt_agent", score=75.0, reasoning="OK"))
            session.add(Evaluation(project_id=pid, stage="product", agent_name="product_agent", score=90.0, reasoning="Great"))
            await session.commit()

        # Summary
        resp = await ac.get(f"/api/v1/projects/{pid}/evaluation/summary", headers=h)
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["weighted_ai_score"] > 0
        assert "breakdown" in data

        # Evidence
        resp = await ac.get(f"/api/v1/projects/{pid}/evaluation/evidence", headers=h)
        assert resp.status_code == 200

        # Consistency
        resp = await ac.get(f"/api/v1/projects/{pid}/evaluation/consistency", headers=h)
        assert resp.status_code == 200


# ── Judging Routes ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_judge_score_submission():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        admin_h = {"Authorization": "Bearer test_token_admin"}
        judge_h = {"Authorization": "Bearer test_token_judge"}
        _, pid = await create_test_project(ac, admin_h, name_prefix="Judge")

        # Submit judge score
        resp = await ac.post(f"/api/v1/judging/{pid}/score", json={
            "score": 88.5,
            "feedback": "Strong technical demo",
        }, headers=judge_h)
        assert resp.status_code == 200
        assert resp.json()["data"]["human_score"] == 88.5
        assert resp.json()["data"]["status"] == "scored"

        # Get assigned projects
        resp = await ac.get("/api/v1/judging/assigned-projects", headers=judge_h)
        assert resp.status_code == 200


@pytest.mark.asyncio
async def test_judge_score_validation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        admin_h = {"Authorization": "Bearer test_token_admin"}
        judge_h = {"Authorization": "Bearer test_token_judge"}
        _, pid = await create_test_project(ac, admin_h, name_prefix="ScoreVal")

        # Score too high — should fail validation
        resp = await ac.post(f"/api/v1/judging/{pid}/score", json={"score": 150.0}, headers=judge_h)
        assert resp.status_code == 422


# ── Finalization Routes ──────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_finalization_compute_and_leaderboard():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        admin_h = {"Authorization": "Bearer test_token_admin"}
        judge_h = {"Authorization": "Bearer test_token_judge"}
        hid, pid = await create_test_project(ac, admin_h, name_prefix="Final")

        # Seed evaluations
        async with AsyncSessionLocal() as session:
            session.add(Evaluation(project_id=pid, stage="idea", agent_name="idea_agent", score=80.0, reasoning="Solid"))
            session.add(Evaluation(project_id=pid, stage="ppt", agent_name="ppt_agent", score=80.0, reasoning="Clear"))
            session.add(Evaluation(project_id=pid, stage="product", agent_name="prod_agent", score=80.0, reasoning="Working"))
            await session.commit()

        # Judge scores
        await ac.post(f"/api/v1/judging/{pid}/score", json={"score": 90.0}, headers=judge_h)

        # Compute final
        resp = await ac.post(f"/api/v1/finalization/{pid}/compute", headers=admin_h)
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["ai_score"] == 80.0
        assert data["human_score"] == 90.0
        # (80 * 0.7) + (90 * 0.3) = 56 + 27 = 83.0
        assert data["final_score"] == 83.0

        # Leaderboard
        resp = await ac.get(f"/api/v1/finalization/leaderboard?hackathon_id={hid}", headers=admin_h)
        assert resp.status_code == 200
        lb = resp.json()["data"]
        assert len(lb) >= 1
        assert lb[0]["rank"] == 1


# ── Webhook Routes ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_webhook_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # n8n webhook
        resp = await ac.post("/api/v1/webhooks/n8n", json={"event": "test"})
        assert resp.status_code == 200
        assert resp.json()["data"]["received"] is True

        # GitHub webhook
        resp = await ac.post("/api/v1/webhooks/github", json={"ref": "refs/heads/main"})
        assert resp.status_code == 200


# ── Admin Analytics: Plagiarism ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_plagiarism_flags_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        admin_h = {"Authorization": "Bearer test_token_admin"}
        _, pid = await create_test_project(ac, admin_h, name_prefix="Plag")

        # Seed a plagiarism flag
        async with AsyncSessionLocal() as session:
            session.add(PlagiarismFlag(
                project_id=pid,
                matched_source="https://github.com/public/template",
                similarity_score=0.85,
                status="flagged",
            ))
            await session.commit()

        resp = await ac.get("/api/v1/admin/analytics/plagiarism-flags", headers=admin_h)
        assert resp.status_code == 200
        flags = resp.json()["data"]
        assert len(flags) >= 1
        assert flags[0]["similarity_score"] >= 0.85


# ── Role-Based Access Control ────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_rbac_participant_cannot_compute_final():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            "/api/v1/finalization/some_project/compute",
            headers={"Authorization": "Bearer test_token_participant"},
        )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_rbac_participant_cannot_access_admin():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            "/api/v1/admin/hackathons",
            json={"name": "Unauthorized Hack"},
            headers={"Authorization": "Bearer test_token_participant"},
        )
    assert resp.status_code == 403
