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
    logger.info("Initializing database schema...")
    await init_db()

    async with AsyncSessionLocal() as session:
        # ── 1. Hackathons ─────────────────────────────────────────────────────
        now = datetime.now(timezone.utc)
        
        h1 = Hackathon(
            id="hack_global_ai_2026",
            name="Global AI Agent Hackathon 2026",
            description="Premier international competition for autonomous multi-agent systems, developer tooling, and intelligent orchestration engines.",
            rubric_weights={"idea": 0.20, "ppt": 0.25, "product": 0.55},
            status="active",
            submission_deadline=now + timedelta(days=14),
        )
        h2 = Hackathon(
            id="hack_web3_infra_2026",
            name="Next-Gen Web3 & Edge AI Summit",
            description="Decentralized intelligence, edge computing, WASM runtimes, and privacy-preserving federated machine learning.",
            rubric_weights={"idea": 0.25, "ppt": 0.25, "product": 0.50},
            status="active",
            submission_deadline=now + timedelta(days=21),
        )
        h3 = Hackathon(
            id="hack_campus_innovate_2026",
            name="Campus Innovation & Health Challenge 2026",
            description="Student-led breakthroughs in campus mental wellness, sustainable logistics, and automated academic support systems.",
            rubric_weights={"idea": 0.30, "ppt": 0.30, "product": 0.40},
            status="active",
            submission_deadline=now + timedelta(days=7),
        )
        session.add_all([h1, h2, h3])
        await session.flush()
        logger.info("Created 3 active Hackathons.")

        # ── 2. Project 1: NexusAgent — FINALIZED (Rank 1) ────────────────────
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
        session.add(p1)
        await session.flush()

        session.add(Submission(
            project_id=p1.id,
            stage="idea",
            payload={
                "problem_statement": "Manual pull request reviews create severe engineering bottlenecks in high-velocity teams, delaying merges by 24–72 hours and causing developer fatigue.",
                "proposed_solution": "Autonomous multi-agent code reviewer using AST parsing, security triage, and LLM-powered diff summarization to deliver consensus in under 60 seconds.",
                "target_audience": "Software engineering teams and open-source maintainers with 10+ active PRs per day.",
                "uniqueness": "Sub-60s multi-agent consensus with zero cloud credential leaks — first reviewer to catch SSRF, secret injection, and logic bugs simultaneously.",
            },
            submitted_by="user_participant",
        ))
        session.add(Submission(
            project_id=p1.id,
            stage="ppt",
            payload={"filename": "nexus_deck.pdf", "total_pages": 10, "deck_text": "NexusAgent Architecture Deck\nSlide 1: Overview\nSlide 2: Multi-Agent Parallel Pipeline\nSlide 3: AST Parsing & Security"},
            submitted_by="user_participant",
        ))
        session.add(Submission(
            project_id=p1.id,
            stage="product",
            payload={"github_url": p1.github_url, "live_url": p1.live_url},
            submitted_by="user_participant",
        ))

        # Claims
        session.add(Claim(
            project_id=p1.id,
            origin_stage="ppt",
            claim_type="architecture",
            claim_text="FastAPI async backend with multi-agent parallel execution under 60 seconds",
            verification_status="verified",
            verification_notes="Verified in backend/app/agents/orchestrator/runner.py via async runner benchmarks.",
        ))
        session.add(Claim(
            project_id=p1.id,
            origin_stage="ppt",
            claim_type="security",
            claim_text="Zero exposed secrets with AST-level static security scanner",
            verification_status="verified",
            verification_notes="Verified in backend/app/tools/security_scan.py with 0 findings.",
        ))

        # Stage 1 Idea Evaluations (4 Agents)
        eval_p1_idea_sel = Evaluation(
            project_id=p1.id, stage="idea", agent_name="idea_selection_agent",
            score=94.0, confidence=0.96,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Core Novelty (95/100)**: Multi-agent consensus mechanism fundamentally replaces single-prompt LLM wrappers with specialized AST parsing and security agents.\n"
                "• **Problem-Solution Fit (94/100)**: Directly eliminates the 24-72 hour PR review latency in developer teams.\n"
                "• **Defensibility (93/100)**: AST-level token caching and multi-agent cross-verification provides a strong technological moat.\n\n"
                "### ✅ Verified Strengths\n"
                "• Zero cloud credential exposure architecture keeping source code strictly localized.\n"
                "• High-velocity parallel execution providing comprehensive reviews in <60 seconds.\n"
                "• Multi-agent agreement threshold prevents hallucinated lint warnings.\n\n"
                "### ⚠️ Identified Weaknesses & Risks\n"
                "• Large monorepo diffs (>5,000 lines) may incur high token costs without pre-chunking.\n"
                "• Edge-case binary and generated protobuf files require explicit ignore filters.\n\n"
                "### 💡 Actionable Recommendations\n"
                "• Implement AST diff token hashing to reduce LLM payload size by ~40%.\n"
                "• Add auto-approval templates for low-risk dependency lockfile bumps."
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
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Problem Magnitude (93/100)**: Developer review fatigue and PR queues cost engineering teams ~6.5 hours per engineer weekly.\n"
                "• **Target Cohort Clarity (92/100)**: Highly precise focus on fast-growing engineering teams with 10+ PRs daily.\n"
                "• **Economic & Team Impact (91/100)**: Quantifiable 70% reduction in first-pass review cycle time.\n\n"
                "### ✅ Verified Strengths\n"
                "• Strong grounding in actionable engineering metrics (PR cycle time, defect escape rate).\n"
                "• High ROI with immediate developer productivity improvements.\n\n"
                "### 💡 Actionable Recommendations\n"
                "• Add interactive inline explanation buttons in GitHub PR review comments for junior devs."
            ),
        )
        session.add(eval_p1_problem)

        eval_p1_feas = Evaluation(
            project_id=p1.id, stage="idea", agent_name="feasibility_agent",
            score=91.0, confidence=0.95,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Stack Viability (93/100)**: FastAPI async coroutines + Pydantic v2 guarantee sub-second request handling.\n"
                "• **Resource Realism (90/100)**: Lightweight deployment without heavy message brokers.\n"
                "• **Execution Constraints (90/100)**: Realistic scope with clear microservice boundaries.\n\n"
                "### ✅ Verified Strengths\n"
                "• Fully non-blocking event loop handles GitHub webhook bursts reliably.\n"
                "• Resilient fallback mechanics for rate limits."
            ),
        )
        session.add(eval_p1_feas)

        eval_p1_market = Evaluation(
            project_id=p1.id, stage="idea", agent_name="market_agent",
            score=90.0, confidence=0.93,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Market Positioning (91/100)**: Clear separation from generic Copilot wrappers by offering multi-agent consensus.\n"
                "• **Competitive Advantage (90/100)**: AST static security checking combined with semantic review.\n"
                "• **Adoption Friction (89/100)**: Zero-config GitHub App integration ensures seamless onboarding."
            ),
        )
        session.add(eval_p1_market)

        # Stage 2 PPT Evaluations (3 Agents)
        eval_p1_arch = Evaluation(
            project_id=p1.id, stage="ppt", agent_name="technical_architecture_agent",
            score=91.0, confidence=0.94,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Architecture Modularity (93/100)**: Clear separation of orchestrator, AST workers, and LLM consensus agents.\n"
                "• **Data Flow Integrity (90/100)**: End-to-end webhook ingestion pipeline clearly mapped.\n"
                "• **Scalability Design (90/100)**: Stateless workers allow horizontal auto-scaling.\n\n"
                "### ✅ Verified Strengths\n"
                "• Well-defined claim extraction points verified against repository code.\n"
                "• Error recovery workflows for Git API rate limits documented."
            ),
        )
        session.add(eval_p1_arch)

        eval_p1_pres = Evaluation(
            project_id=p1.id, stage="ppt", agent_name="presentation_agent",
            score=89.0, confidence=0.92,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Visual Clarity & Flow (90/100)**: Crisp architecture diagrams and structured problem-to-solution narrative.\n"
                "• **Technical Rigor (88/100)**: Concrete benchmark numbers provided for PR processing latency."
            ),
        )
        session.add(eval_p1_pres)

        eval_p1_biz = Evaluation(
            project_id=p1.id, stage="ppt", agent_name="business_impact_agent",
            score=88.0, confidence=0.90,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Business Model (89/100)**: Clear tiering for open-source (free) vs. private repositories (usage-based).\n"
                "• **Enterprise Scaling (87/100)**: Clear path to on-premise deployments for security-sensitive organizations."
            ),
        )
        session.add(eval_p1_biz)

        # Stage 3 Product Evaluations (5 Agents)
        eval_p1_code = Evaluation(
            project_id=p1.id, stage="product", agent_name="code_quality_agent",
            score=96.0, confidence=0.98,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Code Modularity (97/100)**: Clean layered architecture separating repositories, schemas, and agents.\n"
                "• **Typing & Linting (96/100)**: Strict Pydantic v2 schemas across all routes with 100% type hints.\n"
                "• **Test Suite Completeness (95/100)**: 66+ passing automated tests covering all edge cases.\n\n"
                "### ✅ Verified Strengths\n"
                "• Zero lint violations, clean async session management, and robust error boundaries."
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

        eval_p1_ui = Evaluation(
            project_id=p1.id, stage="product", agent_name="ui_ux_agent",
            score=92.0, confidence=0.94,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **User Experience (93/100)**: Intuitive dark-mode dashboard with real-time pipeline telemetry.\n"
                "• **Accessibility & Responsiveness (91/100)**: Full keyboard navigation and clean mobile responsive layouts."
            ),
        )
        session.add(eval_p1_ui)

        eval_p1_func = Evaluation(
            project_id=p1.id, stage="product", agent_name="functionality_agent",
            score=95.0, confidence=0.96,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Core Features (96/100)**: Complete 3-stage evaluation pipeline functioning seamlessly.\n"
                "• **Error Handling (94/100)**: Graceful degradation with clear user feedback on invalid payloads."
            ),
        )
        session.add(eval_p1_func)

        eval_p1_sec = Evaluation(
            project_id=p1.id, stage="product", agent_name="security_agent",
            score=98.0, confidence=0.99,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **OWASP Top 10 Hygiene (99/100)**: Zero SQL injection vulnerabilities via SQLAlchemy ORM parameterized queries.\n"
                "• **Secrets Management (97/100)**: Zero hardcoded API secrets; all configuration loaded from environment."
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
            score=93.0, confidence=0.95,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Production Readiness (94/100)**: Ready for immediate pilot deployment in engineering teams.\n"
                "• **Developer Utility (92/100)**: High recurring daily engagement value for software engineers."
            ),
        )
        session.add(eval_p1_impact)

        # Feedback Report
        session.add(FeedbackReport(
            project_id=p1.id,
            github_url=p1.github_url,
            live_url=p1.live_url,
            overall_health="ok",
            dimensions={
                "deployment_health": {"status": "ok", "response_ms": 78},
                "code_quality": {"status": "ok", "score": 96.0},
                "security_scan": {"status": "ok", "findings_count": 0},
            },
            top_fixes=["Add GitHub App webhook signature verification middleware for production defense."],
        ))

        # Teacher / Judge Feedback
        session.add(JudgeAssignment(
            judge_id="user_judge", project_id=p1.id,
            human_score=95.0,
            comments=(
                "⭐ Faculty & Chief Judge Comprehensive Evaluation:\n\n"
                "• Core Highlights:\n"
                "  1. Live Demo Performance: Verified sub-60s end-to-end multi-agent review consensus on live test PRs.\n"
                "  2. Architecture Quality: Clean Pydantic v2 schemas and fully typed asynchronous endpoints with comprehensive exception handling.\n"
                "  3. Security & Cleanliness: AST security scanner successfully identified test SSRF attempts with zero secret leakage.\n\n"
                "• Recommendations for Scaling:\n"
                "  1. Rate Limiting: Add Redis token bucket rate limiting for webhook burst ingestion from high-traffic GitHub orgs.\n"
                "  2. On-Premise Support: Provide self-hosted Docker runner images for air-gapped enterprise compliance.\n\n"
                "• Overall Verdict: Outstanding submission that sets the benchmark for AI-native developer tooling."
            ),
            status="scored",
        ))

        session.add(FinalResult(
            project_id=p1.id, hackathon_id=h1.id,
            ai_score=93.1, human_score=95.0, final_score=93.7, rank=1,
        ))

        # ── 3. Project 2: VisionForge AI — FINALIZED (Rank 2) ────────────────
        p2 = Project(
            id="proj_vision_forge_02",
            hackathon_id=h1.id,
            name="VisionForge AI - Multimodal Accessibility Layer",
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
                "problem_statement": "Screen readers fail on complex canvas visualizations, D3.js charts, and image-heavy dashboards — leaving 285M visually impaired users locked out of data-rich web apps.",
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

        # Evaluations for P2
        eval_p2_idea = Evaluation(
            project_id=p2.id, stage="idea", agent_name="problem_impact_agent",
            score=91.0, confidence=0.92,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Societal Impact (94/100)**: Directly empowers 285M visually impaired users to access dynamic visual data.\n"
                "• **Market Need (90/100)**: Essential accessibility compliance (WCAG 2.2 / Section 508) for enterprise web apps.\n\n"
                "### ✅ Verified Strengths\n"
                "• Immediate social utility with zero integration overhead for end users."
            ),
        )
        session.add(eval_p2_idea)

        eval_p2_ppt = Evaluation(
            project_id=p2.id, stage="ppt", agent_name="technical_architecture_agent",
            score=86.0, confidence=0.89,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Architecture Rigor (87/100)**: Effective browser content script + background worker + audio synthesis pipeline.\n"
                "• **Latency Optimization (85/100)**: Edge caching for repetitive UI icons and chart legends."
            ),
        )
        session.add(eval_p2_ppt)

        eval_p2_prod = Evaluation(
            project_id=p2.id, stage="product", agent_name="ui_ux_agent",
            score=88.0, confidence=0.90,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Accessibility UX (92/100)**: Exemplary ARIA support, high-contrast states, and seamless keyboard shortcut triggers.\n"
                "• **Audio Fidelity (85/100)**: Natural sounding speech with customizable playback speed."
            ),
        )
        session.add(eval_p2_prod)

        session.add(FeedbackReport(
            project_id=p2.id,
            github_url=p2.github_url,
            live_url=p2.live_url,
            overall_health="ok",
            dimensions={
                "deployment_health": {"status": "ok", "response_ms": 195},
                "code_quality": {"status": "ok", "score": 88.0},
                "security_scan": {"status": "warning", "findings_count": 1, "detail": "Content Security Policy missing on extension popup"},
            },
            top_fixes=["Add strict Content Security Policy headers to extension popup.", "Optimize SVG parser for deeply nested DOM trees."],
        ))

        session.add(JudgeAssignment(
            judge_id="user_judge", project_id=p2.id,
            human_score=88.0,
            comments=(
                "⭐ Faculty & Expert Judge Comprehensive Evaluation:\n\n"
                "• Core Highlights:\n"
                "  1. Societal Impact: Outstanding accessibility tool providing real-time chart-to-speech audio synthesis with 1.4s average latency.\n"
                "  2. User Experience: Browser extension has polished keyboard navigation and full ARIA support.\n\n"
                "• Recommendations for Future Iteration:\n"
                "  1. Security: Add strict CSP headers to extension manifest popup to mitigate XSS risks.\n"
                "  2. SVG Resilience: Enhance error handling when parsing deeply nested D3.js canvas elements.\n\n"
                "• Overall Verdict: High-impact accessibility breakthrough with immediate real-world utility."
            ),
            status="scored",
        ))

        session.add(FinalResult(
            project_id=p2.id, hackathon_id=h1.id,
            ai_score=88.4, human_score=88.0, final_score=88.3, rank=2,
        ))

        # ── 4. Project 3: DataPulse Edge — PRODUCT stage (Hackathon 2) ───────
        p3 = Project(
            id="proj_data_pulse_03",
            hackathon_id=h2.id,
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

        # ── 5. Project 4: CodeShield — PPT stage (Hackathon 1) ────────────────
        p4 = Project(
            id="proj_code_shield_04",
            hackathon_id=h1.id,
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

        eval_p4_idea = Evaluation(
            project_id=p4.id, stage="idea", agent_name="idea_selection_agent",
            score=91.0, confidence=0.93,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Novelty (91/100)**: Focused fine-tuning on 2M CVE records provides high accuracy for zero-day pattern detection.\n"
                "• **Market Urgency (93/100)**: Proactive DevSecOps tooling is a top engineering priority in 2026."
            ),
        )
        session.add(eval_p4_idea)

        # ── 6. Project 5: EcoRoute — IDEA stage (Hackathon 3) ─────────────────
        p5 = Project(
            id="proj_eco_route_05",
            hackathon_id=h3.id,
            name="EcoRoute - Carbon-Aware Last-Mile Delivery",
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

        eval_p5_idea = Evaluation(
            project_id=p5.id, stage="idea", agent_name="problem_impact_agent",
            score=89.0, confidence=0.91,
            reasoning=(
                "### 📌 Rubric Criteria Evaluation\n"
                "• **Environmental Impact (92/100)**: Direct addressal of urban logistics emissions with quantified carbon credit offsets.\n"
                "• **Commercial Viability (86/100)**: Financial incentive structure makes sustainability profitable for fleet managers."
            ),
        )
        session.add(eval_p5_idea)

        await session.commit()
        logger.info("Database seeding completed successfully! Created 3 Hackathons and 5 Projects.")


if __name__ == "__main__":
    asyncio.run(seed_database())
