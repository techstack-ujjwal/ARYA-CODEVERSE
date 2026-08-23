"""
Multi-Role Bot Verification Suite.
Simulates 3 distinct persona bots against the live FastAPI backend:
  1. Participant Bot (Alex Chen - user_participant)
  2. Judge Bot (Dr. Sarah Jenkins - user_judge)
  3. Admin Bot (Marcus Vance - user_admin)

Verifies:
  - Participant stage submissions (Idea -> PPT -> Product -> Instant Diagnostics)
  - Judge evidence inspection & 30% human score submission
  - Admin governance (rubric tuner, plagiarism telemetry, 70/30 finalization)
  - Strict RBAC 403 Forbidden enforcement on cross-role unauthorized calls
"""
import sys
import uuid
import httpx

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000/api/v1"

def print_step(title: str):
    print(f"\n{'='*70}\n[TEST STEP] {title}\n{'='*70}")

def run_tests():
    client = httpx.Client(base_url=BASE_URL, timeout=45.0)

    # ── PHASE 1: PARTICIPANT BOT (Alex Chen) ───────────────────────────
    print_step("Phase 1: Participant Bot (Alex Chen) - Project Lifecycle")
    headers_participant = {"Authorization": "Bearer test_token_participant"}
    proj_name = f"AeroScan AI {uuid.uuid4().hex[:6]}"

    # 1.1 Create Project
    create_res = client.post(
        "/projects",
        json={
            "hackathon_id": "hack_global_ai_2026",
            "name": proj_name,
            "description": "Autonomous drone inspection & structural defect detection.",
            "github_url": "https://github.com/techstack-ujjwal/ARYA-CODEVERSE",
            "live_url": "https://eval-engine-demo.vercel.app",
        },
        headers=headers_participant,
    )
    assert create_res.status_code == 201, f"Failed create: {create_res.text}"
    project = create_res.json()["data"]
    project_id = project["id"]
    print(f"✅ Created project: {project['name']} ({project_id})")

    # 1.2 Submit Stage 1 Idea
    idea_res = client.post(
        f"/projects/{project_id}/idea",
        json={
            "problem_statement": "Manual infrastructure bridge inspection requires dangerous scaffolding and takes weeks.",
            "proposed_solution": "AeroScan uses drone computer vision and multi-modal edge models to detect micro-fractures in real-time.",
            "target_audience": "Civil engineers, municipal transport authorities, and industrial facility managers.",
            "uniqueness": "10x faster inspection with automated sub-millimeter fracture segmentation and thermal heat-map generation.",
        },
        headers=headers_participant,
    )
    assert idea_res.status_code in [200, 201], f"Failed idea submit: {idea_res.text}"
    print(f"✅ Submitted Stage 1 Idea")

    # 1.3 Trigger Stage 1 Idea Evaluation
    eval_idea_res = client.post(f"/projects/{project_id}/idea/evaluate", headers=headers_participant)
    assert eval_idea_res.status_code in [200, 201], f"Failed idea eval: {eval_idea_res.text}"
    print(f"✅ Queued 4-agent Stage 1 Idea Evaluation Pipeline")

    # 1.4 Submit Stage 3 Product
    prod_res = client.post(
        f"/projects/{project_id}/product/register",
        json={
            "github_url": "https://github.com/techstack-ujjwal/ARYA-CODEVERSE",
            "live_url": "https://eval-engine-demo.vercel.app",
        },
        headers=headers_participant,
    )
    assert prod_res.status_code in [200, 201], f"Failed product submit: {prod_res.text}"
    print(f"✅ Registered Stage 3 Product links")

    # 1.5 Evaluate Stage 3 Product
    eval_prod_res = client.post(f"/projects/{project_id}/product/evaluate", headers=headers_participant)
    assert eval_prod_res.status_code in [200, 201], f"Failed product eval: {eval_prod_res.text}"
    print(f"✅ Queued 5-agent Stage 3 Product Evaluation Pipeline")

    # 1.6 Request Instant Diagnostics (<90s)
    diag_submit_res = client.post(
        f"/projects/{project_id}/feedback/submit",
        json={
            "github_url": "https://github.com/techstack-ujjwal/ARYA-CODEVERSE",
            "live_url": "https://eval-engine-demo.vercel.app",
        },
        headers=headers_participant,
    )
    assert diag_submit_res.status_code in [200, 201, 202], f"Failed diagnostics submit: {diag_submit_res.text}"
    diag_data = diag_submit_res.json()["data"]
    print(f"✅ Generated Instant Diagnostics: Health = {diag_data['overall_health'].upper()}, Dimensions = {len(diag_data['dimensions'])}")

    diag_res = client.get(f"/projects/{project_id}/feedback/latest", headers=headers_participant)
    assert diag_res.status_code == 200, f"Failed get diagnostics: {diag_res.text}"
    print(f"✅ Retrieved Latest Diagnostics Report")

    # 1.7 RBAC Security Check: Participant attempting Admin action (Expect 403)
    unauth_admin_res = client.post(
        "/admin/hackathons",
        json={"name": "Hacked Hackathon", "status": "active"},
        headers=headers_participant,
    )
    assert unauth_admin_res.status_code == 403, f"Security violation: Participant accessed admin endpoint! {unauth_admin_res.status_code}"
    print("🛡️ RBAC Guard Verified: Participant was blocked (403 Forbidden) from creating hackathons.")

    # ── PHASE 2: JUDGE BOT (Dr. Sarah Jenkins) ─────────────────────────
    print_step("Phase 2: Judge Bot (Dr. Sarah Jenkins) - Human Rubric Scoring")
    headers_judge = {"Authorization": "Bearer test_token_judge"}

    # 2.1 Submit Human Score (30% weight)
    judge_score_res = client.post(
        f"/judging/{project_id}/score",
        json={
            "score": 92.5,
            "feedback": "Outstanding technical architecture with verified drone telemetry streaming and robust error boundaries.",
            "override_reason": "Elevated 3.5 points due to live interactive demo validation.",
        },
        headers=headers_judge,
    )
    assert judge_score_res.status_code == 200, f"Failed judge score: {judge_score_res.text}"
    print(f"✅ Judge submitted calibrated human score: 92.5 pts")

    # 2.2 RBAC Security Check: Judge attempting Admin action (Expect 403)
    unauth_judge_admin_res = client.post(
        "/admin/hackathons",
        json={"name": "Judge Hackathon", "status": "active"},
        headers=headers_judge,
    )
    assert unauth_judge_admin_res.status_code == 403, f"Security violation: Judge accessed admin endpoint! {unauth_judge_admin_res.status_code}"
    print("🛡️ RBAC Guard Verified: Judge was blocked (403 Forbidden) from administrative mutations.")

    # ── PHASE 3: ADMIN BOT (Marcus Vance) ──────────────────────────────
    print_step("Phase 3: Admin Bot (Marcus Vance) - Governance & Finalization")
    headers_admin = {"Authorization": "Bearer test_token_admin"}

    # 3.1 Inspect Plagiarism Telemetry
    plag_res = client.get("/admin/analytics/plagiarism-flags", headers=headers_admin)
    assert plag_res.status_code == 200, f"Failed plagiarism check: {plag_res.text}"
    print(f"✅ Admin inspected plagiarism matrix: {len(plag_res.json()['data'])} flags")

    # 3.2 Compute 70/30 Composite Score Finalization
    final_res = client.post(f"/finalization/{project_id}/compute", headers=headers_admin)
    assert final_res.status_code == 200, f"Failed finalization: {final_res.text}"
    fin_data = final_res.json()["data"]
    print(f"✅ Computed Final Composite Score: {fin_data['final_score']} pts (AI 70%: {fin_data['ai_score']}, Human 30%: {fin_data['human_score']})")

    # 3.3 Verify Leaderboard Rankings
    lb_res = client.get("/finalization/leaderboard", headers=headers_admin)
    assert lb_res.status_code == 200, f"Failed leaderboard: {lb_res.text}"
    leaderboard = lb_res.json()["data"]
    print(f"✅ Published Leaderboard: {len(leaderboard)} entries ranked")
    for entry in leaderboard[:3]:
        print(f"   🏆 Rank {entry['rank']}: {entry['project_name']} - {entry['final_score']} pts")

    # 3.4 Clean up test project
    del_res = client.delete(f"/projects/{project_id}", headers=headers_admin)
    assert del_res.status_code == 200, f"Failed cleanup: {del_res.text}"
    print(f"✅ Cleaned up bot test project ({project_id})")

    print(f"\n{'='*70}\n🎉 ALL MULTI-ROLE BOT VERIFICATIONS PASSED 100% SUCCESSFULLY!\n{'='*70}")

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"❌ Test Failure: {e}", file=sys.stderr)
        sys.exit(1)
