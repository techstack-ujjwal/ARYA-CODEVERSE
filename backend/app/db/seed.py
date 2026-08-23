"""
Database Seeding Script for JuryX Hackathon Evaluation Platform.
Populates exactly 5 Hackathons, 5 Projects, Submissions, Claims, Evaluations,
Evidence records, Judge Assignments, and Final Results.

Usage:
    python -m backend.app.db.seed
"""
import asyncio
from datetime import datetime, timezone, timedelta
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
    logger.info("Initializing database schema for JuryX...")
    await init_db()

    async with AsyncSessionLocal() as session:
        logger.info("Purging existing records for a clean seed...")
        from sqlalchemy import delete
        await session.execute(delete(Evidence))
        await session.execute(delete(Evaluation))
        await session.execute(delete(Claim))
        await session.execute(delete(Submission))
        await session.execute(delete(FeedbackReport))
        await session.execute(delete(JudgeAssignment))
        await session.execute(delete(FinalResult))
        await session.execute(delete(PlagiarismFlag))
        await session.execute(delete(Project))
        await session.execute(delete(Hackathon))
        await session.commit()

        now = datetime.now(timezone.utc)

        # ── 1. EXACTLY 5 HACKATHONS ─────────────────────────────────────────────
        h1 = Hackathon(
            id="hack_global_ai_2026",
            name="Global AI Agent Hackathon 2026",
            description="Premier competition for autonomous multi-agent systems, developer tooling, and intelligent orchestration engines.",
            rubric_weights={"idea": 0.20, "ppt": 0.25, "product": 0.55},
            status="active",
            submission_deadline=now + timedelta(days=14),
        )
        h2 = Hackathon(
            id="hack_web3_infra_2026",
            name="Next-Gen Web3 & Edge AI Summit 2026",
            description="Decentralized intelligence, edge computing, WASM runtimes, and privacy-preserving federated machine learning.",
            rubric_weights={"idea": 0.25, "ppt": 0.25, "product": 0.50},
            status="active",
            submission_deadline=now + timedelta(days=21),
        )
        h3 = Hackathon(
            id="hack_campus_innovate_2026",
            name="Campus Innovation & Health Challenge 2026",
            description="Student-led breakthroughs in campus mental wellness, accessibility tools, and automated academic support systems.",
            rubric_weights={"idea": 0.30, "ppt": 0.30, "product": 0.40},
            status="active",
            submission_deadline=now + timedelta(days=7),
        )
        h4 = Hackathon(
            id="hack_cyber_sec_2026",
            name="Autonomous Cybersecurity & DevSecOps Invitational 2026",
            description="Next-generation vulnerability detection, automated fuzzing, and AST-level binary & source security defense engines.",
            rubric_weights={"idea": 0.20, "ppt": 0.25, "product": 0.55},
            status="active",
            submission_deadline=now + timedelta(days=18),
        )
        h5 = Hackathon(
            id="hack_climate_ai_2026",
            name="GreenTech & Climate Intelligence Hackathon 2026",
            description="Sustainable supply chains, carbon-aware logistics optimization, and renewable grid management via AI agents.",
            rubric_weights={"idea": 0.20, "ppt": 0.25, "product": 0.55},
            status="active",
            submission_deadline=now + timedelta(days=30),
        )

        session.add_all([h1, h2, h3, h4, h5])
        await session.flush()
        logger.info("Created exactly 5 Hackathons.")

        # ── 2. EXACTLY 5 SHOWCASE PROJECTS ─────────────────────────────────────

        # Project 1: NexusAgent (Hackathon 1) — Finalized (Rank 1)
        p1 = Project(
            id="proj_nexus_agent_01",
            hackathon_id=h1.id,
            name="NexusAgent - Autonomous Code Reviewer",
            description="Multi-agent GitHub pull request review bot with automated AST security scanning and intelligent diff summarization.",
            owner_id="user_participant",
            members=["user_participant", "user_dev_02"],
            status="finalized",
            github_url="https://github.com/nexus-agent/core",
            live_url="https://nexus-agent.vercel.app",
        )

        # Project 2: VisionForge AI (Hackathon 1) — Finalized (Rank 2)
        p2 = Project(
            id="proj_vision_forge_02",
            hackathon_id=h1.id,
            name="VisionForge AI - Accessibility Audio Lens",
            description="Real-time browser extension that converts complex SVG charts and interactive dashboards into natural spatial audio narratives for visually impaired users.",
            owner_id="user_participant",
            members=["user_participant", "user_dev_03"],
            status="finalized",
            github_url="https://github.com/visionforge/accessibility-lens",
            live_url="https://visionforge.app",
        )

        # Project 3: DataPulse Edge (Hackathon 2) — Finalized (Rank 3)
        p3 = Project(
            id="proj_data_pulse_03",
            hackathon_id=h2.id,
            name="DataPulse Edge - Distributed IoT Engine",
            description="Distributed edge processing engine that compresses and intelligently aggregates IoT telemetry locally, cutting cloud bandwidth by 94%.",
            owner_id="user_participant",
            members=["user_participant"],
            status="finalized",
            github_url="https://github.com/datapulse/edge-engine",
            live_url="https://datapulse-dashboard.vercel.app",
        )

        # Project 4: CodeShield (Hackathon 4) — Finalized (Rank 4)
        p4 = Project(
            id="proj_code_shield_04",
            hackathon_id=h4.id,
            name="CodeShield - Zero-Day CI Scanner",
            description="Proactive security vulnerability scanner trained on 2M CVE records to detect OWASP Top 10 risks with AST-level call-graph tracing.",
            owner_id="user_participant",
            members=["user_participant", "user_dev_07"],
            status="finalized",
            github_url="https://github.com/codeshield-ai/scanner",
            live_url="https://codeshield.vercel.app",
        )

        # Project 5: EcoRoute (Hackathon 5) — Finalized (Rank 5)
        p5 = Project(
            id="proj_eco_route_05",
            hackathon_id=h5.id,
            name="EcoRoute - Carbon-Aware Last-Mile Delivery",
            description="Sustainable last-mile delivery route optimizer using real-time traffic and vehicle emission profiles to minimize carbon footprint.",
            owner_id="user_participant",
            members=["user_participant"],
            status="finalized",
            github_url="https://github.com/ecoroute/solver",
            live_url="https://ecoroute-live.vercel.app",
        )

        session.add_all([p1, p2, p3, p4, p5])
        await session.flush()
        logger.info("Created exactly 5 Projects.")

        # ── 3. SUBMISSIONS & FULL EVALUATIONS FOR PROJECT 1 (NexusAgent) ─────────
        # Submissions
        session.add(Submission(
            project_id=p1.id, stage="idea",
            payload={
                "problem_statement": "Manual pull request reviews create severe engineering bottlenecks in high-velocity teams, delaying merges by 24–72 hours and causing developer fatigue.",
                "proposed_solution": "Autonomous multi-agent code reviewer using AST parsing, security triage, and LLM-powered diff summarization to deliver consensus in under 60 seconds.",
                "target_audience": "Software engineering teams and open-source maintainers with 10+ active PRs per day.",
                "uniqueness": "Sub-60s multi-agent consensus with zero cloud credential leaks — first reviewer to catch SSRF, secret injection, and logic bugs simultaneously.",
            },
            submitted_by="user_participant",
        ))
        session.add(Submission(
            project_id=p1.id, stage="ppt",
            payload={"filename": "nexus_deck.pdf", "total_pages": 10, "deck_text": "NexusAgent Architecture Deck\nSlide 1: Overview\nSlide 2: Multi-Agent Parallel Pipeline\nSlide 3: AST Parsing & Security"},
            submitted_by="user_participant",
        ))
        session.add(Submission(
            project_id=p1.id, stage="product",
            payload={"github_url": p1.github_url, "live_url": p1.live_url},
            submitted_by="user_participant",
        ))

        # Claims for P1
        session.add(Claim(
            project_id=p1.id, origin_stage="ppt", claim_type="architecture",
            claim_text="FastAPI async backend with multi-agent parallel execution under 60 seconds",
            verification_status="verified",
            verification_notes="Verified in backend runner benchmarks with 42s p95 latency.",
        ))
        session.add(Claim(
            project_id=p1.id, origin_stage="ppt", claim_type="security",
            claim_text="Zero exposed secrets with AST-level static security scanner",
            verification_status="verified",
            verification_notes="Verified in backend security audit with 0 findings.",
        ))

        # ── Stage 1 (Idea) Evaluations with 3-Point Actionable Feedback
        eval_p1_idea_sel = Evaluation(
            project_id=p1.id, stage="idea", agent_name="idea_selection_agent",
            score=94.0, confidence=0.96,
            reasoning=(
                "### 📌 Executive Assessment\n"
                "The core premise of an autonomous multi-agent code review swarm addresses a high-friction engineering bottleneck with strong foundational defensibility and clear technological moat.\n\n"
                "### 💡 Actionable Improvement Points\n"
                "1. **AST Token Optimization**: Implement AST diff pre-tokenization to reduce raw LLM prompt payload by ~42% on massive 5,000+ line PRs.\n"
                "2. **Specialized Syntax Handling**: Add explicit ignore rules and pre-compiled grammars for protobuf, generated OpenAPI client stubs, and large binary fixtures.\n"
                "3. **CI Bot Auto-Approval Policy**: Introduce low-risk lockfile heuristics (e.g. yarn.lock/package-lock.json version bumps) to fast-track routine dependencies without full swarm synthesis."
            ),
        )
        session.add(eval_p1_idea_sel)
        await session.flush()
        session.add(Evidence(
            evaluation_id=eval_p1_idea_sel.id, evidence_type="web_search",
            source="https://tavily.com/search?q=ai+code+review+developer+adoption",
            tool_used="tavily_search",
            content={"query": "AI code reviewer adoption 2026", "results_count": 8, "top_result": "Developer tool review latency statistics 2026"},
        ))

        eval_p1_problem = Evaluation(
            project_id=p1.id, stage="idea", agent_name="problem_impact_agent",
            score=92.0, confidence=0.94,
            reasoning=(
                "### 📌 Executive Assessment\n"
                "Engineering PR review queues directly contribute to developer burnout and release delays. The target audience of high-velocity engineering organizations is well-defined with clear economic ROI.\n\n"
                "### 💡 Actionable Improvement Points\n"
                "1. **Developer Onboarding Flow**: Provide inline educational links inside GitHub comment suggestions explaining why specific design patterns fail quality thresholds.\n"
                "2. **Team Analytics Dashboard**: Track aggregate team PR cycle time reduction and defect escape rates over 30-day cohorts.\n"
                "3. **Custom Review Tone Presets**: Allow teams to configure review personality from 'Strict Formal Security' to 'Junior Friendly Mentorship'."
            ),
        )
        session.add(eval_p1_problem)

        eval_p1_feas = Evaluation(
            project_id=p1.id, stage="idea", agent_name="feasibility_agent",
            score=91.0, confidence=0.95,
            reasoning=(
                "### 📌 Executive Assessment\n"
                "The selected technology stack (FastAPI async coroutines, Pydantic v2 schemas, and localized AST parsers) is highly realistic and deployable within standard container runtimes.\n\n"
                "### 💡 Actionable Improvement Points\n"
                "1. **Redis Task Queue Integration**: Decouple incoming GitHub webhook bursts using Celery/Redis to prevent memory spikes during simultaneous repo webhooks.\n"
                "2. **Rate Limit Exponential Backoff**: Implement token-bucket rate limiting for downstream GitHub GraphQL and LLM API calls.\n"
                "3. **Lightweight Fallback Mode**: Provide a sub-5s regex/AST fast-check when LLM API providers experience transient latency spikes."
            ),
        )
        session.add(eval_p1_feas)

        eval_p1_market = Evaluation(
            project_id=p1.id, stage="idea", agent_name="market_agent",
            score=90.0, confidence=0.93,
            reasoning=(
                "### 📌 Executive Assessment\n"
                "Grounded Tavily web search validates market gap between generic single-prompt assistants and dedicated multi-agent static security reviewers.\n\n"
                "### 💡 Actionable Improvement Points\n"
                "1. **Open-Source GitHub App Verification**: Publish the bot to the official GitHub Marketplace with 1-click zero-config installation.\n"
                "2. **SOC2 / Self-Hosted Docker Image**: Offer on-premise air-gapped deployment configurations for enterprise compliance.\n"
                "3. **Competitive Moat Benchmarking**: Publish open benchmark datasets comparing precision and false-positive rates against existing static linters."
            ),
        )
        session.add(eval_p1_market)

        # ── Stage 2 (PPT) Evaluations with 3-Point Actionable Feedback
        eval_p1_arch = Evaluation(
            project_id=p1.id, stage="ppt", agent_name="technical_architecture_agent",
            score=91.0, confidence=0.94,
            reasoning=(
                "### 📌 Executive Assessment\n"
                "Architecture slides clearly articulate modular microservices, non-blocking webhook ingestion, and isolated AST execution sandboxes.\n\n"
                "### 💡 Actionable Improvement Points\n"
                "1. **Database Connection Pooling**: Explicitly specify PgBouncer / SQLAlchemy async connection pool sizes in architecture slides for >1,000 RPS scalability.\n"
                "2. **Idempotency Keying**: Document webhook idempotency keys to avoid duplicate agent evaluations on rapid GitHub commit pushes.\n"
                "3. **Secrets Isolation Diagram**: Highlight dedicated memory isolation for environment variables during dynamic code execution."
            ),
        )
        session.add(eval_p1_arch)

        eval_p1_pres = Evaluation(
            project_id=p1.id, stage="ppt", agent_name="presentation_agent",
            score=89.0, confidence=0.92,
            reasoning=(
                "### 📌 Executive Assessment\n"
                "Presentation deck exhibits strong visual narrative, crisp system flow diagrams, and compelling problem-solution contrasts.\n\n"
                "### 💡 Actionable Improvement Points\n"
                "1. **Live Benchmark Graph**: Add a side-by-side bar chart showing latency comparison: 45s (NexusAgent) vs. 48 hours (Human Reviewers).\n"
                "2. **Customer Persona Case Study**: Include a 1-slide concrete case study demonstrating false-positive reductions in a real repo.\n"
                "3. **Visual Typography Polish**: Standardize slide font sizes and align footnote references consistently across slides 4 through 8."
            ),
        )
        session.add(eval_p1_pres)

        eval_p1_biz = Evaluation(
            project_id=p1.id, stage="ppt", agent_name="business_impact_agent",
            score=88.0, confidence=0.90,
            reasoning=(
                "### 📌 Executive Assessment\n"
                "Freemium commercial model targeting open-source developers with tiered usage for enterprise private organizations has clear revenue expansion viability.\n\n"
                "### 💡 Actionable Improvement Points\n"
                "1. **Seat vs Usage Pricing**: Clarify whether enterprise billing is based on active developer seats or total lines of code reviewed.\n"
                "2. **Self-Service Trial Conversion**: Define 14-day free trial limits (e.g. up to 100 PRs) to drive immediate team adoption.\n"
                "3. **Enterprise SLA Guarantees**: Outline 99.9% uptime commitments and dedicated webhook processing pipelines for high-tier customers."
            ),
        )
        session.add(eval_p1_biz)

        # ── Stage 3 (Product) Evaluations with 3-Point Actionable Feedback
        eval_p1_ui = Evaluation(
            project_id=p1.id, stage="product", agent_name="ui_ux_agent",
            score=93.0, confidence=0.95,
            reasoning=(
                "### 📌 Executive Assessment\n"
                "Frontend interface provides high density telemetry, responsive layout hierarchies, and smooth micro-interactions.\n\n"
                "### 💡 Actionable Improvement Points (UI/UX Suggestions)\n"
                "1. **Contrast & Tap Target Optimization**: Enhance mobile touch target boundaries to a minimum of 44x44px for icon buttons and navigation links.\n"
                "2. **Keyboard Shortcut Navigation**: Introduce standard keyboard shortcuts ('j' / 'k' to cycle through review points, 'e' to expand evidence drawers).\n"
                "3. **Real-Time Skeleton Loaders**: Replace generic spinner overlays with structured shimmer skeleton placeholders for a smoother perceived load experience."
            ),
        )
        session.add(eval_p1_ui)

        eval_p1_func = Evaluation(
            project_id=p1.id, stage="product", agent_name="functionality_agent",
            score=95.0, confidence=0.96,
            reasoning=(
                "### 📌 Executive Assessment\n"
                "Core product flow executes deterministically. Automated evaluation pipeline, webhook triggers, and live score calculations pass end-to-end.\n\n"
                "### 💡 Actionable Improvement Points (Functionality Suggestions)\n"
                "1. **Granular Error Recovery**: Add client-side automatic retry with exponential backoff on transient network drops during stage evaluation.\n"
                "2. **Batch Project Export**: Support exporting comprehensive evaluation dossiers into standalone PDF and JSON report formats.\n"
                "3. **Interactive Test Runner Hook**: Enable participants to execute custom smoke test assertions directly from the stage workspace sandbox."
            ),
        )
        session.add(eval_p1_func)

        eval_p1_code = Evaluation(
            project_id=p1.id, stage="product", agent_name="code_quality_agent",
            score=96.0, confidence=0.98,
            reasoning=(
                "### 📌 Executive Assessment\n"
                "AST static code inspection confirms strict modular separation, zero unused imports, full type annotations, and high test coverage.\n\n"
                "### 💡 Actionable Improvement Points (Code Quality Suggestions)\n"
                "1. **Pydantic Schema Serialization**: Ensure all datetime objects consistently serialize to ISO-8601 UTC across all endpoint schemas.\n"
                "2. **Cyclomatic Complexity Refactor**: Break down large agent runner loops into composable pure helper functions with cyclomatic rank < 6.\n"
                "3. **Database Repository Indexing**: Verify B-tree composite indices on (hackathon_id, created_at) for sub-10ms leaderboard queries."
            ),
        )
        session.add(eval_p1_code)
        await session.flush()
        session.add(Evidence(
            evaluation_id=eval_p1_code.id, evidence_type="static_analysis",
            source="backend/app/main.py",
            tool_used="static_analysis",
            content={"documentation_score": 96, "lint_clean": True, "test_coverage_pct": 98.5},
        ))

        eval_p1_sec = Evaluation(
            project_id=p1.id, stage="product", agent_name="security_agent",
            score=98.0, confidence=0.99,
            reasoning=(
                "### 📌 Executive Assessment\n"
                "Deterministic security scan confirms zero exposed credentials, clean parameterized SQL queries, and strict CORS configuration.\n\n"
                "### 💡 Actionable Improvement Points (Security Suggestions)\n"
                "1. **Strict Content Security Policy**: Deploy strict CSP response headers restricting inline script execution on production domains.\n"
                "2. **Automated Secret Rotation Webhooks**: Add proactive alerting webhooks when rotated API keys fail handshake tests.\n"
                "3. **Subresource Integrity (SRI)**: Implement SRI hashes on all externally loaded fonts and CDN dependencies."
            ),
        )
        session.add(eval_p1_sec)
        await session.flush()
        session.add(Evidence(
            evaluation_id=eval_p1_sec.id, evidence_type="security_scan",
            source="repo_files",
            tool_used="security_scanner",
            content={"is_clean": True, "security_score": 100.0, "vulnerabilities_found": 0},
        ))

        eval_p1_impact = Evaluation(
            project_id=p1.id, stage="product", agent_name="real_world_impact_agent",
            score=94.0, confidence=0.96,
            reasoning=(
                "### 📌 Executive Assessment\n"
                "High practical utility with immediate developer workflow impact. Live demonstration showcases fast turnaround and zero hallucinated review comments.\n\n"
                "### 💡 Actionable Improvement Points (Real-World Impact Suggestions)\n"
                "1. **VS Code & JetBrains Extension**: Build lightweight IDE sidebars allowing developers to trigger multi-agent reviews before pushing PRs.\n"
                "2. **Multi-Language AST Grammars**: Expand native AST parsing support to Rust, Go, TypeScript, and Python.\n"
                "3. **Public Verified Badge**: Issue cryptographic verification badges that repos can display on their READMEs."
            ),
        )
        session.add(eval_p1_impact)

        # Feedback report for P1
        session.add(FeedbackReport(
            project_id=p1.id, github_url=p1.github_url, live_url=p1.live_url,
            overall_health="ok",
            dimensions={
                "deployment_health": {"status": "ok", "response_ms": 142},
                "code_quality": {"status": "ok", "score": 96.0},
                "security_scan": {"status": "ok", "findings_count": 0},
                "presentation_rigor": {"status": "ok", "score": 90.0},
            },
            top_fixes=[
                "Implement AST token hashing to reduce LLM payload size by ~42%.",
                "Add Redis queue worker for high-volume webhook bursts.",
                "Deploy strict CSP headers to prevent inline XSS vectors.",
            ],
        ))

        # ── 4. EXACTLY 5 JUDGE ASSIGNMENTS & SCORINGS ───────────────────────────
        session.add(JudgeAssignment(
            judge_id="user_judge", project_id=p1.id,
            human_score=92.0,
            comments=(
                "⭐ Faculty Judge Final Evaluation:\n\n"
                "• Core Highlights:\n"
                "  1. Architecture & Execution: Outstanding modular design with clean async separation and high static code quality.\n"
                "  2. Practical Utility: Solves a high-friction engineering problem with verifiable 45s latency and zero secret leakage.\n\n"
                "• Recommended Enhancements:\n"
                "  1. Add Redis worker queue for enterprise-scale webhook ingestion.\n"
                "  2. Build IDE extension integration to review code before git push.\n\n"
                "• Verdict: Exemplary project demonstrating the highest standards of autonomous multi-agent engineering."
            ),
            status="scored",
        ))

        session.add(JudgeAssignment(
            judge_id="user_judge", project_id=p2.id,
            human_score=88.0,
            comments=(
                "⭐ Faculty Judge Final Evaluation:\n\n"
                "• Core Highlights:\n"
                "  1. Societal Impact: Outstanding accessibility tool providing real-time chart-to-speech audio synthesis with 1.4s average latency.\n"
                "  2. User Experience: Browser extension has polished keyboard navigation and full ARIA support.\n\n"
                "• Recommended Enhancements:\n"
                "  1. Security: Add strict CSP headers to extension manifest popup.\n"
                "  2. SVG Resilience: Enhance error handling when parsing deeply nested D3 canvas elements."
            ),
            status="scored",
        ))

        session.add(JudgeAssignment(
            judge_id="user_judge", project_id=p3.id,
            human_score=86.0,
            comments=(
                "⭐ Faculty Judge Final Evaluation:\n\n"
                "• Core Highlights:\n"
                "  1. Technical Depth: WASM-based edge inference demonstrates strong distributed systems understanding.\n"
                "  2. Bandwidth Savings: Verified 94% telemetry reduction on remote IoT sensor feeds.\n\n"
                "• Recommended Enhancements:\n"
                "  1. Add automatic fallback when edge device memory is constrained."
            ),
            status="scored",
        ))

        session.add(JudgeAssignment(
            judge_id="user_judge", project_id=p4.id,
            human_score=85.0,
            comments=(
                "⭐ Faculty Judge Final Evaluation:\n\n"
                "• Core Highlights:\n"
                "  1. Security Focus: Strong zero-day pattern detection trained on 2M CVE records.\n"
                "  2. CI Integration: Easy GitHub Action workflow with clear developer remediation guides."
            ),
            status="scored",
        ))

        session.add(JudgeAssignment(
            judge_id="user_judge", project_id=p5.id,
            human_score=83.0,
            comments=(
                "⭐ Faculty Judge Final Evaluation:\n\n"
                "• Core Highlights:\n"
                "  1. Environmental Impact: Pareto-optimal co-optimization of cost and carbon emissions.\n"
                "  2. Financial Incentives: Live carbon credit pricing calculation makes sustainability attractive for fleet operators."
            ),
            status="scored",
        ))

        # ── 5. EXACTLY 5 FINAL RESULTS (Ranked Leaderboard) ─────────────────────
        session.add(FinalResult(
            project_id=p1.id, hackathon_id=h1.id,
            ai_score=94.2, human_score=92.0, final_score=93.5, rank=1,
        ))
        session.add(FinalResult(
            project_id=p2.id, hackathon_id=h1.id,
            ai_score=88.4, human_score=88.0, final_score=88.3, rank=2,
        ))
        session.add(FinalResult(
            project_id=p3.id, hackathon_id=h2.id,
            ai_score=87.0, human_score=86.0, final_score=86.7, rank=3,
        ))
        session.add(FinalResult(
            project_id=p4.id, hackathon_id=h4.id,
            ai_score=85.5, human_score=85.0, final_score=85.4, rank=4,
        ))
        session.add(FinalResult(
            project_id=p5.id, hackathon_id=h5.id,
            ai_score=84.0, human_score=83.0, final_score=83.7, rank=5,
        ))

        await session.commit()
        logger.info("JuryX database seeding completed! Exactly 5 Hackathons, 5 Projects, 5 Judge Assignments, and 5 Final Results seeded.")


if __name__ == "__main__":
    asyncio.run(seed_database())
