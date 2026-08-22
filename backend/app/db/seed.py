"""
Database Seeding Script for AI Hackathon Evaluation Engine.
Populates realistic Hackathons, Projects, Submissions, Claims, Evaluations,
Judge Assignments, and Final Results for testing and local development.

Usage:
    python -m backend.app.db.seed
"""
import asyncio
from loguru import logger
from backend.app.db.session import AsyncSessionLocal, init_db
from backend.app.models.db_models import (
    Hackathon,
    Project,
    Submission,
    Claim,
    Evaluation,
    Evidence,
    FeedbackReport,
    JudgeAssignment,
    FinalResult,
    PlagiarismFlag,
)


async def seed_database():
    logger.info("Initializing database schema...")
    await init_db()

    async with AsyncSessionLocal() as session:
        # 1. Create Hackathon
        hackathon = Hackathon(
            id="hack_global_ai_2026",
            name="Global AI Agent Hackathon 2026",
            description="International competition for autonomous multi-agent systems and developer tooling.",
            rubric_weights={"idea": 0.20, "ppt": 0.25, "product": 0.55},
            status="active",
        )
        session.add(hackathon)
        await session.flush()
        logger.info(f"Created Hackathon: {hackathon.name} ({hackathon.id})")

        # 2. Project 1: Complete Finalized Project ("NexusAgent")
        p1 = Project(
            id="proj_nexus_agent_01",
            hackathon_id=hackathon.id,
            name="NexusAgent - Autonomous Code Reviewer",
            description="Multi-agent GitHub pull request review bot with automated AST security scanning.",
            owner_id="user_participant",
            members=["user_participant", "user_dev_02"],
            status="finalized",
            github_url="https://github.com/nexus-agent/core",
            live_url="https://nexus-agent.vercel.app",
        )
        session.add(p1)
        await session.flush()

        # P1 Submissions
        session.add(Submission(
            project_id=p1.id,
            stage="idea",
            payload={
                "problem_statement": "Manual pull request reviews create severe engineering bottlenecks.",
                "proposed_solution": "Autonomous multi-agent code reviewer with static security triage.",
                "target_audience": "Software engineering teams & open-source maintainers",
                "differentiation": "Sub-60s multi-agent consensus with zero cloud credential leaks.",
            },
            submitted_by="user_participant",
        ))
        session.add(Submission(
            project_id=p1.id,
            stage="ppt",
            payload={"filename": "nexus_deck.pdf", "total_pages": 10},
            submitted_by="user_participant",
        ))
        session.add(Submission(
            project_id=p1.id,
            stage="product",
            payload={"github_url": p1.github_url, "live_url": p1.live_url},
            submitted_by="user_participant",
        ))

        # P1 Claims
        session.add(Claim(
            project_id=p1.id,
            origin_stage="ppt",
            claim_type="architecture",
            claim_text="FastAPI async backend with multi-agent parallel execution",
            verification_status="verified",
            verification_notes="Verified in backend/app/agents/orchestrator/runner.py",
        ))
        session.add(Claim(
            project_id=p1.id,
            origin_stage="ppt",
            claim_type="security",
            claim_text="Zero exposed secrets with SSRF safe uptime probes",
            verification_status="verified",
            verification_notes="Verified in backend/app/tools/uptime_checker.py",
        ))

        # P1 Evaluations (Idea 92, PPT 88, Product 94)
        eval_idea = Evaluation(
            project_id=p1.id,
            stage="idea",
            agent_name="idea_selection_agent",
            score=92.0,
            confidence=0.95,
            reasoning="High innovation factor with clear problem validation in developer tooling.",
        )
        session.add(eval_idea)
        await session.flush()

        session.add(Evidence(
            evaluation_id=eval_idea.id,
            evidence_type="web_search",
            source="https://tavily.com",
            tool_used="tavily_search",
            content={"query": "AI code reviewer"},
        ))

        eval_ppt = Evaluation(
            project_id=p1.id,
            stage="ppt",
            agent_name="technical_architecture_agent",
            score=88.0,
            confidence=0.90,
            reasoning="Well-structured microservices architecture with robust error recovery.",
        )
        session.add(eval_ppt)

        eval_prod = Evaluation(
            project_id=p1.id,
            stage="product",
            agent_name="code_quality_agent",
            score=94.0,
            confidence=0.95,
            reasoning="Exceptional code modularity, typed Pydantic models, and 100% passing tests.",
        )
        session.add(eval_prod)

        # P1 Feedback Report
        session.add(FeedbackReport(
            project_id=p1.id,
            github_url=p1.github_url,
            live_url=p1.live_url,
            overall_health="ok",
            dimensions={
                "deployment_health": {"status": "ok", "response_ms": 85},
                "code_quality": {"status": "ok", "score": 95.0},
                "security_scan": {"status": "ok", "findings_count": 0},
            },
            top_fixes=["Add automated end-to-end integration tests for extra reliability."],
        ))

        # P1 Judge Assignment & Final Result
        # Weighted AI: (92 * 0.20) + (88 * 0.25) + (94 * 0.55) = 18.4 + 22.0 + 51.7 = 92.1
        # Human Judge: 95.0
        # Final Score: (92.1 * 0.70) + (95.0 * 0.30) = 64.47 + 28.5 = 92.97 -> 93.0
        session.add(JudgeAssignment(
            judge_id="user_judge",
            project_id=p1.id,
            human_score=95.0,
            comments="Brilliant live demo, fast latency, and impressive test coverage.",
            status="scored",
        ))
        session.add(FinalResult(
            project_id=p1.id,
            hackathon_id=hackathon.id,
            ai_score=92.1,
            human_score=95.0,
            final_score=93.0,
            rank=1,
        ))

        # 3. Project 2: PPT Stage Project ("VisionForge")
        p2 = Project(
            id="proj_vision_forge_02",
            hackathon_id=hackathon.id,
            name="VisionForge AI",
            description="Real-time multimodal accessibility assistant for visually impaired users.",
            owner_id="user_dev_03",
            members=["user_dev_03"],
            status="ppt",
            github_url="https://github.com/visionforge/app",
        )
        session.add(p2)
        session.add(Submission(
            project_id=p2.id,
            stage="idea",
            payload={"problem_statement": "Screen readers struggle with complex canvas visualizations."},
            submitted_by="user_dev_03",
        ))
        session.add(Submission(
            project_id=p2.id,
            stage="ppt",
            payload={"filename": "vision_forge_pitch.pdf", "total_pages": 8},
            submitted_by="user_dev_03",
        ))
        session.add(Evaluation(
            project_id=p2.id,
            stage="idea",
            agent_name="problem_impact_agent",
            score=89.0,
            confidence=0.90,
            reasoning="High societal impact addressing critical web accessibility gaps.",
        ))

        # 4. Project 3: Idea Stage Project ("DataPulse")
        p3 = Project(
            id="proj_data_pulse_03",
            hackathon_id=hackathon.id,
            name="DataPulse Edge",
            description="Distributed IoT edge processing engine for low-bandwidth telemetry.",
            owner_id="user_dev_04",
            members=["user_dev_04"],
            status="idea",
        )
        session.add(p3)
        session.add(Submission(
            project_id=p3.id,
            stage="idea",
            payload={"problem_statement": "IoT devices in remote locations lack cloud bandwidth for raw video streaming."},
            submitted_by="user_dev_04",
        ))

        await session.commit()
        logger.info("Database seeding completed successfully! Created 1 Hackathon and 3 Projects.")


if __name__ == "__main__":
    asyncio.run(seed_database())
