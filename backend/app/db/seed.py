"""
Database Seeding Script for AI Hackathon Evaluation Engine.
Populates realistic Hackathons, Projects, Submissions, Claims, Evaluations,
Judge Assignments, and Final Results for testing and local development.

Usage:
    python -m backend.app.db.seed

Projects seeded (5 total, diverse stages):
  1. NexusAgent           - finalized  (full pipeline, rank 1)
  2. VisionForge AI       - finalized  (full pipeline, rank 2)
  3. DataPulse Edge       - product    (idea + ppt + product registered, awaiting eval)
  4. CodeShield           - ppt        (idea submitted + ppt uploaded)
  5. EcoRoute             - idea       (idea submitted only)
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
        # ── 1. Hackathon ──────────────────────────────────────────────────────
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

        # ── 2. Project 1: NexusAgent — FINALIZED (Rank 1) ────────────────────
        p1 = Project(
            id="proj_nexus_agent_01",
            hackathon_id=hackathon.id,
            name="NexusAgent - Autonomous Code Reviewer",
            description="Multi-agent GitHub pull request review bot with automated AST security scanning and intelligent diff summarization.",
            owner_id="user_participant",
            members=["user_participant", "user_dev_02"],
            status="finalized",
            github_url="https://github.com/nexus-agent/core",
            live_url="https://nexus-agent.vercel.app",
        )
        session.add(p1)
        await session.flush()

        session.add(Submission(
            project_id=p1.id,
            stage="idea",
            payload={
                "problem_statement": "Manual pull request reviews create severe engineering bottlenecks in high-velocity teams, delaying merges by 24–72 hours.",
                "proposed_solution": "Autonomous multi-agent code reviewer using AST parsing, security triage, and LLM-powered diff summarization to deliver consensus in under 60 seconds.",
                "target_audience": "Software engineering teams and open-source maintainers with 10+ active PRs per day.",
                "uniqueness": "Sub-60s multi-agent consensus with zero cloud credential leaks — first reviewer to catch SSRF, secret injection, and logic bugs simultaneously.",
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
            claim_text="Zero exposed secrets with SSRF-safe uptime probes",
            verification_status="verified",
            verification_notes="Verified in backend/app/tools/uptime_checker.py",
        ))

        # Weighted AI: (92 * 0.20) + (88 * 0.25) + (94 * 0.55) = 18.4 + 22.0 + 51.7 = 92.1
        eval_idea_p1 = Evaluation(
            project_id=p1.id, stage="idea", agent_name="idea_selection_agent",
            score=92.0, confidence=0.95,
            reasoning="High innovation factor with clear problem validation in developer tooling.",
        )
        session.add(eval_idea_p1)
        await session.flush()
        session.add(Evidence(
            evaluation_id=eval_idea_p1.id, evidence_type="web_search",
            source="https://tavily.com", tool_used="tavily_search",
            content={"query": "AI code reviewer adoption 2025"},
        ))
        session.add(Evaluation(
            project_id=p1.id, stage="ppt", agent_name="technical_architecture_agent",
            score=88.0, confidence=0.90,
            reasoning="Well-structured microservices architecture with robust error recovery and clear diagrams.",
        ))
        session.add(Evaluation(
            project_id=p1.id, stage="product", agent_name="code_quality_agent",
            score=94.0, confidence=0.95,
            reasoning="Exceptional code modularity, typed Pydantic models, and 100% passing test suite.",
        ))
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
        session.add(JudgeAssignment(
            judge_id="user_judge", project_id=p1.id,
            human_score=95.0,
            comments="Brilliant live demo, sub-60s latency, and impressive test coverage. Top-tier submission.",
            status="scored",
        ))
        session.add(FinalResult(
            project_id=p1.id, hackathon_id=hackathon.id,
            ai_score=92.1, human_score=95.0, final_score=93.0, rank=1,
        ))

        # ── 3. Project 2: VisionForge AI — FINALIZED (Rank 2) ────────────────
        p2 = Project(
            id="proj_vision_forge_02",
            hackathon_id=hackathon.id,
            name="VisionForge AI",
            description="Real-time multimodal accessibility assistant converting complex canvas visualizations and charts into structured audio descriptions for visually impaired users.",
            owner_id="user_dev_03",
            members=["user_dev_03", "user_dev_05"],
            status="finalized",
            github_url="https://github.com/visionforge/app",
            live_url="https://visionforge-demo.vercel.app",
        )
        session.add(p2)
        await session.flush()

        session.add(Submission(
            project_id=p2.id, stage="idea",
            payload={
                "problem_statement": "Screen readers completely fail on complex canvas visualizations, D3.js charts, and image-heavy dashboards — leaving 285M visually impaired users locked out of data-rich web apps.",
                "proposed_solution": "VisionForge uses a multimodal LLM pipeline to convert charts, diagrams, and SVGs into structured, contextual audio narratives in real-time via a browser extension.",
                "target_audience": "Visually impaired knowledge workers, data analysts, and students using modern web dashboards.",
                "uniqueness": "First browser-native multimodal accessibility layer requiring zero developer integration — works on any website without code changes.",
            },
            submitted_by="user_dev_03",
        ))
        session.add(Submission(
            project_id=p2.id, stage="ppt",
            payload={"filename": "vision_forge_pitch.pdf", "total_pages": 12},
            submitted_by="user_dev_03",
        ))
        session.add(Submission(
            project_id=p2.id, stage="product",
            payload={"github_url": p2.github_url, "live_url": p2.live_url},
            submitted_by="user_dev_03",
        ))

        session.add(Claim(
            project_id=p2.id, origin_stage="ppt",
            claim_type="performance",
            claim_text="Real-time chart narration with under 2-second end-to-end latency",
            verification_status="verified",
            verification_notes="Verified via live product demo — average 1.4s on complex SVGs.",
        ))

        # Weighted AI: (89 * 0.20) + (85 * 0.25) + (87 * 0.55) = 17.8 + 21.25 + 47.85 = 86.9
        session.add(Evaluation(
            project_id=p2.id, stage="idea", agent_name="problem_impact_agent",
            score=89.0, confidence=0.90,
            reasoning="High societal impact addressing critical web accessibility gaps with strong market evidence.",
        ))
        session.add(Evaluation(
            project_id=p2.id, stage="ppt", agent_name="presentation_coherence_agent",
            score=85.0, confidence=0.88,
            reasoning="Clear narrative arc and compelling user stories. Market sizing could be more specific.",
        ))
        session.add(Evaluation(
            project_id=p2.id, stage="product", agent_name="ux_evaluation_agent",
            score=87.0, confidence=0.89,
            reasoning="Polished browser extension UX with excellent keyboard navigation and ARIA support.",
        ))
        session.add(FeedbackReport(
            project_id=p2.id,
            github_url=p2.github_url,
            live_url=p2.live_url,
            overall_health="ok",
            dimensions={
                "deployment_health": {"status": "ok", "response_ms": 210},
                "code_quality": {"status": "ok", "score": 88.0},
                "security_scan": {"status": "warning", "findings_count": 1, "detail": "Content Security Policy missing on extension popup"},
            },
            top_fixes=["Add Content Security Policy headers to the browser extension popup.", "Improve error handling for SVG parsing edge cases."],
        ))
        session.add(JudgeAssignment(
            judge_id="user_judge", project_id=p2.id,
            human_score=88.0,
            comments="Genuinely useful accessibility tool with polished UX. Minor stability issues on complex charts.",
            status="scored",
        ))
        session.add(FinalResult(
            project_id=p2.id, hackathon_id=hackathon.id,
            ai_score=86.9, human_score=88.0, final_score=87.2, rank=2,
        ))

        # ── 4. Project 3: DataPulse Edge — PRODUCT stage (awaiting evaluation) ──
        p3 = Project(
            id="proj_data_pulse_03",
            hackathon_id=hackathon.id,
            name="DataPulse Edge",
            description="Distributed edge processing engine that compresses and intelligently aggregates IoT telemetry locally, reducing cloud bandwidth by 94% without losing anomaly detection fidelity.",
            owner_id="user_dev_04",
            members=["user_dev_04"],
            status="product",
            github_url="https://github.com/datapulse/edge-engine",
            live_url="https://datapulse-dashboard.vercel.app",
        )
        session.add(p3)
        await session.flush()

        session.add(Submission(
            project_id=p3.id, stage="idea",
            payload={
                "problem_statement": "Industrial IoT sensors in remote locations generate 50GB/day of telemetry but cellular bandwidth costs make full cloud streaming economically unviable.",
                "proposed_solution": "DataPulse runs a local WASM anomaly detection model at the edge, transmitting only event-driven diffs and anomaly windows — cutting bandwidth by 94%.",
                "target_audience": "Industrial IoT operators in manufacturing, agriculture, and remote infrastructure monitoring.",
                "uniqueness": "WASM-based edge inference with automatic model sync — works offline for 72 hours and self-reconciles on reconnect.",
            },
            submitted_by="user_dev_04",
        ))
        session.add(Submission(
            project_id=p3.id, stage="ppt",
            payload={"filename": "datapulse_deck.pdf", "total_pages": 9},
            submitted_by="user_dev_04",
        ))
        session.add(Submission(
            project_id=p3.id, stage="product",
            payload={"github_url": p3.github_url, "live_url": p3.live_url},
            submitted_by="user_dev_04",
        ))

        # ── 5. Project 4: CodeShield — PPT stage ──────────────────────────────
        p4 = Project(
            id="proj_code_shield_04",
            hackathon_id=hackathon.id,
            name="CodeShield",
            description="AI-powered security vulnerability scanner that detects OWASP Top 10 issues in any codebase using a fine-tuned LLM trained on 2M CVE records and security audit reports.",
            owner_id="user_dev_06",
            members=["user_dev_06", "user_dev_07"],
            status="ppt",
            github_url="https://github.com/codeshield-ai/scanner",
        )
        session.add(p4)
        await session.flush()

        session.add(Submission(
            project_id=p4.id, stage="idea",
            payload={
                "problem_statement": "90% of security vulnerabilities are introduced in development but not caught until penetration testing — costing $4.5M per breach on average.",
                "proposed_solution": "CodeShield integrates into CI/CD pipelines as a GitHub Action, scanning every PR with a fine-tuned security LLM and producing developer-friendly remediation guides.",
                "target_audience": "DevSecOps teams, startup engineering leads, and security-conscious open-source maintainers.",
                "uniqueness": "Fine-tuned on 2M CVE records with OWASP Top 10 coverage — outperforms Semgrep on novel vulnerability patterns by 37% in internal benchmarks.",
            },
            submitted_by="user_dev_06",
        ))
        session.add(Submission(
            project_id=p4.id, stage="ppt",
            payload={"filename": "codeshield_pitch.pdf", "total_pages": 11},
            submitted_by="user_dev_06",
        ))

        session.add(Evaluation(
            project_id=p4.id, stage="idea", agent_name="idea_selection_agent",
            score=91.0, confidence=0.93,
            reasoning="Strong market validation with quantified cost impact. Highly defensible technical moat.",
        ))

        # ── 6. Project 5: EcoRoute — IDEA stage ───────────────────────────────
        p5 = Project(
            id="proj_eco_route_05",
            hackathon_id=hackathon.id,
            name="EcoRoute",
            description="Sustainable last-mile delivery route optimizer using real-time traffic, vehicle emission profiles, and carbon credit pricing to minimize both cost and environmental impact.",
            owner_id="user_dev_08",
            members=["user_dev_08"],
            status="idea",
        )
        session.add(p5)
        await session.flush()

        session.add(Submission(
            project_id=p5.id, stage="idea",
            payload={
                "problem_statement": "Last-mile delivery generates 30% of urban CO₂ emissions. Fleet operators optimize for speed and cost, with zero visibility into per-route carbon footprint.",
                "proposed_solution": "EcoRoute integrates with existing fleet management systems to provide carbon-aware route optimization, trading marginal time increases for significant emission reductions — with built-in carbon credit revenue calculation.",
                "target_audience": "Urban logistics companies, e-commerce fulfillment centers, and municipal delivery fleets targeting net-zero pledges.",
                "uniqueness": "First optimizer that co-optimizes cost, time, AND carbon in a single Pareto-optimal solver — with live carbon credit market integration to make sustainability financially rewarding.",
            },
            submitted_by="user_dev_08",
        ))

        await session.commit()
        logger.info("Database seeding completed successfully! Created 1 Hackathon and 5 Projects.")


if __name__ == "__main__":
    asyncio.run(seed_database())
