import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


@pytest.mark.asyncio
async def test_agents_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/health/agents")
    assert response.status_code == 200
    data = response.json()
    assert "openai" in data
    assert "gemini" in data


@pytest.mark.asyncio
async def test_auth_me_dev_mode():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer test_token_admin"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["role"] == "admin"


@pytest.mark.asyncio
async def test_projects_list():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(
            "/api/v1/projects",
            headers={"Authorization": "Bearer test_token_participant"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


import uuid


@pytest.mark.asyncio
async def test_feedback_submit():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        admin_header = {"Authorization": "Bearer test_token_admin"}
        part_header = {"Authorization": "Bearer test_token_participant"}
        uid = uuid.uuid4().hex[:6]

        # 1. Create hackathon
        hack = await ac.post(
            "/api/v1/admin/hackathons",
            json={"name": f"FB Hack {uid}", "status": "active"},
            headers=admin_header,
        )
        assert hack.status_code == 201
        hid = hack.json()["data"]["id"]

        # 2. Create project
        proj_resp = await ac.post(
            "/api/v1/projects",
            json={"hackathon_id": hid, "name": f"FB Test Project {uid}"},
            headers=part_header,
        )
        assert proj_resp.status_code == 201
        proj_id = proj_resp.json()["data"]["id"]

        response = await ac.post(
            f"/api/v1/projects/{proj_id}/feedback/submit",
            json={"github_url": "https://github.com/techstack-ujjwal", "live_url": "https://example.com"},
            headers=part_header,
        )
    assert response.status_code == 202
    data = response.json()
    assert data["success"] is True
    assert data["data"]["project_id"] == proj_id

