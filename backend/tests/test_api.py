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


@pytest.mark.asyncio
async def test_feedback_submit():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        auth_header = {"Authorization": "Bearer test_token_participant"}
        # Create project first
        proj_resp = await ac.post(
            "/api/v1/projects",
            json={"hackathon_id": "hack_fb_test", "name": "FB Test Project"},
            headers=auth_header,
        )
        proj_id = proj_resp.json()["data"]["id"]

        response = await ac.post(
            f"/api/v1/projects/{proj_id}/feedback/submit",
            json={"github_url": "https://github.com/test/repo", "live_url": "https://test.app"},
            headers=auth_header,
        )
    assert response.status_code == 202
    data = response.json()
    assert data["success"] is True
    assert data["data"]["project_id"] == proj_id
