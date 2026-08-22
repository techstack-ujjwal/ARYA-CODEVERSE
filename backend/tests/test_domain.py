import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.db.session import init_db


@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()


@pytest.mark.asyncio
async def test_hackathon_and_project_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Admin creates a Hackathon
        hack_resp = await ac.post(
            "/api/v1/admin/hackathons",
            json={
                "name": "Global AI Hackathon 2026",
                "description": "Evaluate multi-agent innovations",
                "rubric_weights": {"idea": 0.20, "ppt": 0.25, "product": 0.55},
                "status": "active",
            },
            headers={"Authorization": "Bearer test_token_admin"},
        )
        assert hack_resp.status_code == 201
        hack_data = hack_resp.json()["data"]
        hack_id = hack_data["id"]
        assert hack_data["name"] == "Global AI Hackathon 2026"

        # 2. Participant creates a Project under Hackathon
        proj_resp = await ac.post(
            "/api/v1/projects",
            json={
                "hackathon_id": hack_id,
                "name": "Team SuperAgents",
                "description": "Autonomous Code Review Engine",
                "github_url": "https://github.com/super/repo",
                "live_url": "https://super.vercel.app",
            },
            headers={"Authorization": "Bearer test_token_participant"},
        )
        assert proj_resp.status_code == 201
        proj_data = proj_resp.json()["data"]
        proj_id = proj_data["id"]
        assert proj_data["name"] == "Team SuperAgents"
        assert proj_data["status"] == "idea"

        # 3. Add team member
        member_resp = await ac.post(
            f"/api/v1/projects/{proj_id}/team-members",
            json={"user_id": "teammate_user_02"},
            headers={"Authorization": "Bearer test_token_participant"},
        )
        assert member_resp.status_code == 200
        assert "teammate_user_02" in member_resp.json()["data"]["members"]

        # 4. Check project status
        status_resp = await ac.get(
            f"/api/v1/projects/{proj_id}/status",
            headers={"Authorization": "Bearer test_token_participant"},
        )
        assert status_resp.status_code == 200
        assert status_resp.json()["data"]["overall_status"] == "idea"

        # 5. Update project metadata
        update_resp = await ac.patch(
            f"/api/v1/projects/{proj_id}",
            json={"name": "Team SuperAgents 2.0", "status": "ppt"},
            headers={"Authorization": "Bearer test_token_participant"},
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["data"]["name"] == "Team SuperAgents 2.0"
        assert update_resp.json()["data"]["status"] == "ppt"

        # 6. List projects
        list_resp = await ac.get(
            f"/api/v1/projects?hackathon_id={hack_id}",
            headers={"Authorization": "Bearer test_token_participant"},
        )
        assert list_resp.status_code == 200
        assert len(list_resp.json()["data"]) >= 1
