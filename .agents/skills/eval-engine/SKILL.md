---

name: eval-engine
description: AI-Powered Hackathon Evaluation Engine architecture, stage pipeline, agent registry, and API blueprint. Streamlined for high performance, lightweight dependencies, and token efficiency.
---

# Hackathon Evaluation Engine Blueprint (Streamlined v2)

## Core Philosophy
`Claim -> Evidence -> Verification -> Score -> Recommendation`

## Evaluation Architecture
1. **Idea Stage (20%)**: Evaluates uniqueness, problem clarity, feasibility, and market differentiation (Tools: Tavily/SerpAPI, LLMs).
2. **PPT Stage (25%)**: Evaluates presentation quality, architecture stack claims, and business model using lightweight PDF parsing (`pypdf` / multimodal LLMs).
3. **Product Stage (55%)**: Tool-grounded evaluations: Code Quality (Radon/linters/AST), UI/UX (Playwright/Lighthouse), Functionality (Playwright automated flows), Security (Bandit/Semgrep/audit tools), Real-World Impact.
4. **Cross-Cutting**:
   - **Instant Feedback**: Sub-90s participant diagnostic report for GitHub repo + live URL.
   - **Plagiarism/Similarity**: Vector similarity against public & prior submissions.
   - **Cross-Stage Consistency**: Claims vs. implementation verification.
   - **Final Judge / Synthesis**: 70% AI + 30% Human judge integration.

## Streamlined Tech Stack
- **Framework**: FastAPI, Pydantic v2, pydantic-settings
- **Async Execution**: FastAPI `BackgroundTasks` / `asyncio` (zero-external broker requirement for fast development, modular worker adapter)
- **PDF Extraction**: `pypdf` / `pdfplumber` (lightweight, zero poppler/tesseract system binaries)
- **DB & Storage**: PostgreSQL (Supabase + pgvector) / async SQLAlchemy, local SQLite support for rapid testing
- **Auth**: Clerk JWT verification + dev-mode tokens
- **Observability**: Structured Loguru logging, Sentry/LangSmith optional hooks

## Build Phases
- **Phase 0 (Done)**: Project setup, config, FastAPI app, base security & test harness.
- **Phase 1 (In Progress)**: Core Domain & CRUD (Hackathon, Project, Submission, Claim, Evidence models + Repository layer + Projects API).
- **Phase 2**: Agent Infrastructure (Pydantic base agent schemas, LLM wrappers with tenacity retries, background runner).
- **Phase 3 & 4**: Idea & PPT Stages (evaluators + claim extraction).
- **Phase 5 & 7**: Product Tooling & Instant Feedback (fast participant differentiator).
- **Phase 6 & 8**: Product Agents & Cross-Cutting Intelligence (consistency, similarity, final judge).
- **Phase 9**: Judging & Finalization (70/30 score computation, leaderboard).
- **Phase 10 & 11**: Hardening & Deployment.
