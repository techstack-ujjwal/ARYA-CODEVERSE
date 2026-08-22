import io
import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.db.session import init_db


@pytest.mark.asyncio
async def test_full_evaluation_pipeline_e2e():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        auth_header = {"Authorization": "Bearer test_token_admin"}

        # 1. Create Hackathon
        hack_resp = await ac.post(
            "/api/v1/admin/hackathons",
            json={"name": "End-to-End AI Challenge 2026", "status": "active"},
            headers=auth_header,
        )
        assert hack_resp.status_code == 201
        hack_id = hack_resp.json()["data"]["id"]

        # 2. Create Project
        proj_resp = await ac.post(
            "/api/v1/projects",
            json={
                "hackathon_id": hack_id,
                "name": "Autonomous Agent Engine",
                "description": "Multi-agent evaluation platform",
            },
            headers=auth_header,
        )
        assert proj_resp.status_code == 201
        proj_id = proj_resp.json()["data"]["id"]

        # 3. Stage 1: Submit Idea & Evaluate
        idea_sub_resp = await ac.post(
            f"/api/v1/projects/{proj_id}/idea",
            json={
                "problem_statement": "Manual hackathon judging takes hours and is subjective.",
                "proposed_solution": "Multi-agent evaluation engine with deterministic tool evidence.",
                "target_audience": "Hackathon organizers and participants",
                "differentiation": "Claim verification against real code and live URLs",
            },
            headers=auth_header,
        )
        assert idea_sub_resp.status_code == 201

        idea_eval_resp = await ac.post(
            f"/api/v1/projects/{proj_id}/idea/evaluate",
            headers=auth_header,
        )
        assert idea_eval_resp.status_code == 200

        # 4. Stage 2: Upload PPT & Evaluate
        sample_pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n190\n%%EOF"
        
        ppt_upload_resp = await ac.post(
            f"/api/v1/projects/{proj_id}/ppt/upload",
            files={"file": ("presentation.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")},
            headers=auth_header,
        )
        assert ppt_upload_resp.status_code == 201

        ppt_eval_resp = await ac.post(
            f"/api/v1/projects/{proj_id}/ppt/evaluate",
            headers=auth_header,
        )
        assert ppt_eval_resp.status_code == 200

        # 5. Stage 3: Register Product & Evaluate
        prod_reg_resp = await ac.post(
            f"/api/v1/projects/{proj_id}/product/register",
            json={
                "github_url": "https://github.com/team/eval-engine",
                "live_url": "https://eval-engine.vercel.app",
            },
            headers=auth_header,
        )
        assert prod_reg_resp.status_code == 200

        prod_eval_resp = await ac.post(
            f"/api/v1/projects/{proj_id}/product/evaluate",
            headers=auth_header,
        )
        assert prod_eval_resp.status_code == 200

        # 6. Instant Feedback Diagnostic
        feedback_resp = await ac.post(
            f"/api/v1/projects/{proj_id}/feedback/submit",
            json={
                "github_url": "https://github.com/team/eval-engine",
                "live_url": "https://eval-engine.vercel.app",
            },
            headers=auth_header,
        )
        assert feedback_resp.status_code == 202
        feedback_data = feedback_resp.json()["data"]
        assert "overall_health" in feedback_data
        assert len(feedback_data["top_fixes"]) > 0

        # 7. Check latest feedback endpoint
        latest_fb = await ac.get(f"/api/v1/projects/{proj_id}/feedback/latest", headers=auth_header)
        assert latest_fb.status_code == 200
        assert latest_fb.json()["data"]["project_id"] == proj_id

        # 8. Check overall project status
        status_resp = await ac.get(f"/api/v1/projects/{proj_id}/status", headers=auth_header)
        assert status_resp.status_code == 200
        assert status_resp.json()["data"]["stages"]["feedback"] == "generated"
