# AI-Powered Hackathon Evaluation Engine
## Technical Blueprint v2 — Enhanced Multi-Agent Architecture, Backend Implementation & Build Guide

**Prepared for:** Ujjwal · Team Debuggers Den
**Scope:** Backend-first delivery — multi-agent evaluation core, API layer, hosting & deployment plan. Frontend implementation deferred to a follow-up phase per project plan.
**Note:** Formalizes and extends the original reference architecture with a 20–30% capability uplift. This is an engineering blueprint, not marketing copy — every recommendation is scoped to be buildable by a small student team inside a hackathon build timeline.

---

## 1. Executive Summary & What Changed in v2

This blueprint formalizes the reference architecture (idea → PPT → product, three-stage weighted evaluation, LLM-as-judge with human-in-the-loop) into an implementation-ready backend design. It keeps the core philosophy — **Claim → Evidence → Verification → Score → Recommendation** — intact, and closes the gap between that philosophy and how the original diagram actually produces evidence (mostly by asking an LLM to "look at the code and say good").

The changes below are the estimated 20–30% capability uplift, concentrated in three places:
- Grounding agents in real tools instead of LLM opinion
- Adding the participant-facing instant feedback loop flagged as missing
- Hardening the system for concurrent, untrusted, adversarial submissions

### 1.1 Original vs. v2 — What Actually Changed

| Dimension | v1 (reference architecture) | v2 (this blueprint) |
|---|---|---|
| Evidence for Product stage | Agents read code/README and judge subjectively | Deterministic tools (static analysis, security scanners, headless browser tests) run first; LLM synthesizes their output instead of guessing |
| Functionality checking | "Don't trust comments, actually test the product" as an instruction to the LLM | Playwright headless-browser agent literally executes the login → create project → upload → run → result flow and records pass/fail per step |
| Security checking | Security agent reasons about auth/SQLi/deps in the abstract | Bandit / Semgrep / npm audit / pip-audit / secret-scanning run as real scans; LLM only explains & prioritizes findings |
| Participant experience | Participants get no feedback until judges score them | New Instant Feedback Agent gives participants a structured, actionable report the moment they submit GitHub + live URL, before final judging |
| Anti-cheating | Not addressed | New Plagiarism/Similarity Agent (embedding search against public repos + prior submissions) and commit-timeline analysis (flags single last-commit dumps) |
| Score reliability | Single LLM call per agent, single OpenAI + single Gemini call for final judge | Self-consistency sampling (N=3, majority/median) on the highest-stakes agents; variance-based confidence instead of naive 50/50 averaging |
| Output reliability | Implicit — no schema mentioned | Every agent returns a Pydantic-validated JSON schema; invalid output triggers an automatic retry with the validation error fed back to the model |
| Throughput / scale | Not addressed — implies synchronous evaluation | Async job queue (Celery + Redis) so evaluation runs in the background; API returns immediately with a status you can poll or get webhooked |
| Observability | Not addressed | LangSmith tracing on every agent run + Sentry error tracking + structured evaluation audit log |
| Safety of running untrusted code | Not addressed | All cloning / execution / live-URL fetching happens in ephemeral sandboxed containers with SSRF protection and timeouts (see §10) |

> **Assumption flagged:** The missing GitHub + live-link feedback feature was mentioned, but the specific list of points it should cover wasn't included in the source material. §2 below proposes a complete, opinionated set of feedback dimensions based on what the rest of the document already evaluates in Stage 3. Treat it as a first draft — trim or add dimensions freely before building.

---

## 2. New Feature — Instant Submission Feedback (GitHub + Live URL)

This is the missing piece flagged in the original request. Today, in the reference architecture, a participant submits their repo and live link and hears nothing until a judge (via the AI pipeline) scores them at the end. That's a wasted opportunity: the same evidence-gathering tools the Product stage already needs can run the moment a team submits, and hand the team a private, non-final improvement report — before the deadline, while they can still act on it.

### 2.1 Trigger & Flow

- Participant pastes `github_url` and `live_url` into the submission form (this can happen more than once before the deadline — it's a self-check tool, not a one-shot judgment).
- `POST /feedback/submit` enqueues a lightweight, fast subset of the Stage-3 tool pipeline (target: **under 90 seconds**, since this needs to feel instant to a participant, unlike the full judge evaluation which can take minutes).
- Results are written to the participant's own dashboard only — judges never see instant-feedback runs unless the team formally submits for judging.
- Participants can resubmit and re-check as many times as the hackathon rules allow before the submission lock.

### 2.2 Proposed Feedback Dimensions

| # | Dimension | What it checks | Backed by |
|---|---|---|---|
| 1 | Repo & Code Quality Snapshot | Folder structure sanity, naming, duplication, cyclomatic complexity hotspots, obvious dead code | Tree-sitter, Radon, ESLint/Pylint |
| 2 | Live Deployment Health | Is the URL reachable, valid SSL, response time, does it 404 on load | httpx + custom uptime checker |
| 3 | Functional Smoke Test | Executes the core flow declared for the project (login, create, main action) headlessly and reports pass/fail per step | Playwright |
| 4 | Security Quick-Scan | Hardcoded secrets/API keys, missing auth on obvious routes, known-vulnerable dependencies | TruffleHog/detect-secrets, npm audit, pip-audit, Bandit |
| 5 | Documentation Completeness | README present, setup/run instructions, .env.example present, license | Static repo file check |
| 6 | Feature-Claim Coverage (early pass) | Cross-checks features claimed in the Idea/PPT submission (if already submitted) against what's actually present in code | LlamaIndex retrieval + LLM synthesis |
| 7 | Commit & Contribution Hygiene | Commit count/spread across the hackathon window, number of contributors, flags a single last-minute dump commit | GitHub API (commits, contributors) |
| 8 | Accessibility & Responsiveness (if web app) | Quick Lighthouse/axe pass on the live URL | Lighthouse CI, axe-core |
| 9 | Actionable Checklist | Plain-language, ranked list of the 3–5 highest-impact fixes before final submission | LLM synthesis of items 1–8 (no new tool) |

### 2.3 Example Response Shape

```
POST /api/v1/projects/{project_id}/feedback/submit
{
  "github_url": "https://github.com/team/repo",
  "live_url": "https://team-project.vercel.app"
}

200 OK (returned once the async job completes; poll GET /feedback/latest
  or subscribe via the project's websocket/webhook channel)
{
  "feedback_id": "fb_8f2c...",
  "generated_at": "2026-08-22T10:14:00Z",
  "overall_health": "needs_attention",  // ok | needs_attention | at_risk
  "dimensions": {
    "code_quality": { "status": "ok", "notes": [...] },
    "deployment_health": { "status": "ok", "response_ms": 412 },
    "functional_smoke": { "status": "failed", "failed_step": "create_project",
      "notes": ["Create Project button returns 500"] },
    "security_scan": { "status": "at_risk", "findings": [".env committed to repo"] },
    "documentation": { "status": "needs_attention", "notes": ["No setup instructions"] },
    "claim_coverage": { "status": "ok", "matched": 4, "total_claimed": 5 },
    "commit_hygiene": { "status": "ok", "commits": 37, "contributors": 4 },
    "accessibility": { "status": "needs_attention", "score": 68 }
  },
  "top_fixes": [
    "Remove .env from git history and rotate any exposed keys",
    "Fix 500 error on Create Project — blocks the core demo flow",
    "Add a README with setup/run steps"
  ]
}
```

> This is **not** a scored evaluation — it deliberately avoids giving a number so teams don't treat it as the final verdict. It reuses the same underlying tools as Stage 3, so building it early also de-risks the harder judge-facing pipeline later.

---

## 3. Enhanced Multi-Agent Architecture

**17 agents total** — the original 12 from the reference diagram, tool-augmented, plus 5 new cross-cutting agents. Orchestration moves from an implicit "LLM as judge" box to an explicit **LangGraph StateGraph** supervised graph with parallel fan-out per stage, conditional edges, and a Postgres-backed checkpointer so a long-running evaluation can be paused for human input and resumed without losing state.

| # | Agent | Stage | New in v2? | Core Job |
|---|---|---|---|---|
| 1 | Idea Selection Agent | Idea | — | Uniqueness, real-problem check, differentiation vs existing solutions |
| 2 | Problem & Impact Agent | Idea | — | Problem clarity, target users, potential social impact |
| 3 | Feasibility Agent | Idea | — | Buildability, timeline realism, unrealistic-claim detection |
| 4 | Market/Existing Solution Agent | Idea | — | Competitor landscape, market gap, differentiation |
| 5 | Presentation Evaluation Agent | PPT | — | Problem statement, solution clarity, storytelling quality |
| 6 | Technical Architecture Agent | PPT | — | Claimed stack/APIs/scalability/security — extracted as checkable claims |
| 7 | Business Impact Agent | PPT | — | Audience, market opportunity, business model, scalability story |
| 8 | Code Quality Agent | Product | Tool-augmented | Structure, readability, duplication, maintainability — now grounded in Tree-sitter/Radon/linters, not just LLM reading |
| 9 | UI/UX Agent | Product | Tool-augmented | Navigation, responsiveness, accessibility — now grounded in Lighthouse/axe-core + vision-LLM screenshot review |
| 10 | Functionality Agent | Product | Tool-augmented | Actually drives the live product via Playwright instead of trusting the README |
| 11 | Security Agent | Product | Tool-augmented | Real scans (Bandit/Semgrep/npm audit/secret scan); LLM explains & ranks findings |
| 12 | Real-World Impact Agent | Product | — | Usefulness, practical applicability, future potential |
| 13 | Instant Feedback Agent | Cross-cutting | **NEW** | Runs the lightweight tool subset in §2 and returns a participant-facing report |
| 14 | Plagiarism/Similarity Agent | Cross-cutting | **NEW** | Embedding search vs. public GitHub + prior submissions; flags high similarity |
| 15 | Cross-Stage Consistency Agent | Cross-cutting | Formalized | Diffs idea claims vs PPT claims vs implementation evidence |
| 16 | Confidence Calibration Agent | Cross-cutting | **NEW** | Reconciles OpenAI vs Gemini score divergence with variance-based confidence instead of a flat average |
| 17 | Final Judge / Synthesis Agent | Cross-cutting | — | Synthesizes all evidence into one report; computes weighted AI score |

### 3.1 Orchestration Pattern

- **Supervisor graph (LangGraph StateGraph):** one top-level graph per project with sub-graphs for Idea, PPT, and Product stages, each fanning out its agents in parallel and joining before moving on.
- **Durable checkpointing:** Postgres-backed checkpointer so a long evaluation (waiting on a Playwright run, or a human judge review) can suspend and resume without losing intermediate state.
- **Structured output:** every agent returns a Pydantic model; a validation-and-retry wrapper (tenacity) re-prompts the model with the schema error if the first response doesn't validate — no more hoping the LLM returned parseable JSON.
- **Self-consistency where it matters:** Security Agent and Final Judge sample N=3 and take the median/majority instead of trusting a single call, since these are the highest-stakes, highest-variance outputs.
- **Ensemble reconciliation:** instead of the reference architecture's implicit "OpenAI + Gemini → final judgment," the Confidence Calibration Agent computes agreement between the two providers and lowers the reported confidence (surfaced to the human judge) when they diverge significantly, rather than silently averaging away disagreement.
- **Async execution:** every stage runs as a Celery task; the API returns a job/status handle immediately and the frontend (built later) can poll or subscribe to a webhook/websocket event on completion.

---

## 4. Tools & Libraries Required per Agent

The core v2 improvement, spelled out per agent: what each one actually calls, beyond "an LLM."

| Agent | Required Tools / Libraries | Purpose |
|---|---|---|
| Idea Selection / Problem & Impact / Feasibility | LLM (GPT-4o / Gemini 1.5 Pro), web search tool (Tavily or SerpAPI) | Reasoning + live competitor/market lookup instead of relying on stale training data |
| Market/Existing Solution Agent | LLM, web search tool, optional Product Hunt / Crunchbase API | Finds real existing products to compare against |
| Presentation Evaluation Agent | Unstructured (PDF parsing), LLM | Extracts structured text/slide content from the PPT PDF before reasoning |
| Technical Architecture Agent | Unstructured, LLM, LlamaIndex (claim extraction) | Extracts checkable architecture/stack claims for later cross-verification |
| Business Impact Agent | Unstructured, LLM, web search tool | Market-size and business-model sanity checks |
| Code Quality Agent | Tree-sitter, Radon (complexity/maintainability), ESLint/Pylint, cloc, LLM (synthesis) | Deterministic static metrics feed the LLM instead of the LLM guessing from a code read-through |
| UI/UX Agent | Playwright (screenshot capture), Lighthouse CI, axe-core (accessibility), vision-capable LLM | Automated screenshots + accessibility score + vision-LLM critique |
| Functionality Agent | Playwright (headless browser automation), sandboxed execution runtime, GitHub API | Actually drives login → create → upload → run → result and records real pass/fail |
| Security Agent | Bandit (Python), Semgrep (multi-language), npm audit / pip-audit, TruffleHog/detect-secrets, LLM (triage) | Real vulnerability/secret scans; LLM explains severity and priority, doesn't invent findings |
| Real-World Impact Agent | LLM, web search tool | Practical applicability & scalability reasoning |
| Instant Feedback Agent | Subset of the above (Radon, Playwright, npm audit/pip-audit, TruffleHog, httpx uptime check), LLM (summary) | Fast, participant-facing pass — see §2 |
| Plagiarism/Similarity Agent | GitHub Code Search API, embeddings (OpenAI text-embedding-3 or Cohere), vector store (pgvector/Supabase Vecs) | Similarity search vs. public repos and prior submissions in the same hackathon |
| Cross-Stage Consistency Agent | LlamaIndex (retrieval over stored claims), embeddings, LLM | Diffs claims extracted in Idea/PPT stages against Product-stage evidence |
| Confidence Calibration Agent | LLM outputs from both providers, custom variance/agreement scorer | No external tool — pure statistical reconciliation logic |
| Final Judge / Synthesis Agent | LangGraph orchestrator, weighted-scoring calculator, LLM | Combines every agent's evidence into the final report and AI score |
| All agents (cross-cutting) | LangSmith (tracing), Sentry (errors), Pydantic (schema validation), tenacity (retries) | Observability and reliability infrastructure, not a per-agent choice |

---

## 5. Backend Folder Structure

Backend-only, as agreed — frontend scaffolding comes after this is working end-to-end.

```
hackathon-eval-engine/
|-- backend/
|   |-- app/
|   |   |-- main.py                     # FastAPI app entrypoint
|   |   |-- core/
|   |   |   |-- config.py               # Settings (pydantic-settings)
|   |   |   |-- security.py             # Clerk JWT verification
|   |   |   |-- rate_limiter.py         # slowapi config
|   |   |   `-- logging.py
|   |   |-- api/
|   |   |   `-- v1/
|   |   |       |-- router.py
|   |   |       `-- endpoints/
|   |   |           |-- auth.py
|   |   |           |-- projects.py
|   |   |           |-- idea.py
|   |   |           |-- ppt.py
|   |   |           |-- product.py
|   |   |           |-- feedback.py     # NEW — instant feedback
|   |   |           |-- evaluation.py
|   |   |           |-- judging.py
|   |   |           |-- finalization.py
|   |   |           |-- admin.py
|   |   |           `-- webhooks.py
|   |   |-- agents/
|   |   |   |-- orchestrator/
|   |   |   |   |-- graph.py            # LangGraph StateGraph definition
|   |   |   |   `-- state.py            # Shared graph state schema
|   |   |   |-- idea/
|   |   |   |   |-- idea_selection_agent.py
|   |   |   |   |-- problem_impact_agent.py
|   |   |   |   |-- feasibility_agent.py
|   |   |   |   `-- market_agent.py
|   |   |   |-- ppt/
|   |   |   |   |-- presentation_agent.py
|   |   |   |   |-- technical_architecture_agent.py
|   |   |   |   `-- business_impact_agent.py
|   |   |   |-- product/
|   |   |   |   |-- code_quality_agent.py
|   |   |   |   |-- ui_ux_agent.py
|   |   |   |   |-- functionality_agent.py
|   |   |   |   |-- security_agent.py
|   |   |   |   `-- real_world_impact_agent.py
|   |   |   `-- shared/
|   |   |       |-- instant_feedback_agent.py         # NEW
|   |   |       |-- plagiarism_agent.py                # NEW
|   |   |       |-- cross_stage_consistency_agent.py
|   |   |       |-- confidence_calibration_agent.py    # NEW
|   |   |       `-- final_judge_agent.py
|   |   |-- tools/                      # deterministic tool wrappers agents call
|   |   |   |-- static_analysis.py      # Tree-sitter, Radon, linters
|   |   |   |-- security_scan.py        # Bandit, Semgrep, npm/pip audit, secret scan
|   |   |   |-- browser_automation.py   # Playwright wrapper
|   |   |   |-- github_client.py        # PyGithub / GitPython wrapper
|   |   |   |-- uptime_checker.py       # live URL health checks
|   |   |   |-- pdf_parser.py           # Unstructured wrapper
|   |   |   |-- embeddings.py           # embedding + vector search wrapper
|   |   |   `-- web_search.py           # Tavily/SerpAPI wrapper
|   |   |-- models/                     # Pydantic schemas + ORM models
|   |   |   |-- schemas/                # request/response + agent output schemas
|   |   |   `-- db_models/
|   |   |-- db/
|   |   |   |-- session.py
|   |   |   `-- repositories/
|   |   |-- workers/
|   |   |   |-- celery_app.py
|   |   |   `-- tasks.py                # evaluate_idea, evaluate_ppt, evaluate_product, run_feedback...
|   |   |-- services/                   # business logic between API and agents/db
|   |   `-- utils/
|   |-- tests/
|   |-- alembic/                        # DB migrations
|   |-- requirements.txt
|   |-- Dockerfile
|   |-- Dockerfile.worker               # separate image — Playwright/browser deps live here
|   `-- docker-compose.yml              # api + worker + redis (local dev)
|-- frontend/                           # scaffolded in the next phase
|-- infra/                              # IaC / render.yaml / fly.toml
|-- docs/
|-- .env.example
`-- README.md
```

---

## 6. Complete API Route Specification

All routes are versioned under `/api/v1`. Auth is Clerk-issued JWT verified on every non-public route (dependency-injected in FastAPI). Feedback routes are new; everything else formalizes what the reference architecture's stage flow implies.

### 6.1 Auth

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/auth/webhook` | Clerk webhook — sync user create/update/delete into local DB |
| GET | `/api/v1/auth/me` | Return current authenticated user + role |

### 6.2 Projects

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/projects` | Create a project (team + hackathon reference) |
| GET | `/api/v1/projects` | List projects (filterable by hackathon, team, status) |
| GET | `/api/v1/projects/{id}` | Get a single project |
| PATCH | `/api/v1/projects/{id}` | Update project metadata |
| DELETE | `/api/v1/projects/{id}` | Delete a project (admin/owner only) |
| POST | `/api/v1/projects/{id}/team-members` | Add a teammate to the project |
| GET | `/api/v1/projects/{id}/status` | Current pipeline status across all three stages |

### 6.3 Idea Stage

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/projects/{id}/idea` | Submit idea/problem/proposed-solution text |
| POST | `/api/v1/projects/{id}/idea/evaluate` | Enqueue Stage-1 agent evaluation |
| GET | `/api/v1/projects/{id}/idea/evaluation` | Get idea-stage scores + evidence |
| GET | `/api/v1/projects/{id}/idea/evidence` | Raw evidence/competitor findings backing the score |

### 6.4 PPT Stage

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/projects/{id}/ppt/upload` | Upload the presentation PDF |
| POST | `/api/v1/projects/{id}/ppt/evaluate` | Enqueue Stage-2 agent evaluation |
| GET | `/api/v1/projects/{id}/ppt/evaluation` | Get PPT-stage scores + evidence |
| GET | `/api/v1/projects/{id}/ppt/claims` | Extracted claims (for cross-stage consistency) |

### 6.5 Product Stage

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/projects/{id}/product/register` | Register `github_url` + `live_url` for judged evaluation |
| POST | `/api/v1/projects/{id}/product/evaluate` | Enqueue Stage-3 agent evaluation (full judged pass) |
| GET | `/api/v1/projects/{id}/product/evaluation` | Get product-stage scores + evidence |
| GET | `/api/v1/projects/{id}/product/repo-metadata` | Commit history, contributors, languages, size |

### 6.6 Feedback — NEW

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/projects/{id}/feedback/submit` | Trigger instant feedback with `github_url` + `live_url` |
| GET | `/api/v1/projects/{id}/feedback/latest` | Latest feedback report |
| GET | `/api/v1/projects/{id}/feedback/history` | All past feedback runs for this project |
| POST | `/api/v1/projects/{id}/feedback/resubmit` | Re-run feedback after fixes (rate-limited per hackathon rules) |

### 6.7 Evaluation (aggregate / cross-stage)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/projects/{id}/evaluation/summary` | Combined report across all 3 stages |
| GET | `/api/v1/projects/{id}/evaluation/evidence` | All evidence items, filterable by stage/agent |
| GET | `/api/v1/projects/{id}/evaluation/consistency` | Cross-stage consistency findings |
| GET | `/api/v1/projects/{id}/evaluation/confidence` | Confidence + AI-provider agreement detail |
| POST | `/api/v1/projects/{id}/evaluation/re-run` | Re-run the full pipeline (admin/judge triggered) |

### 6.8 Judging

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/judges/{judge_id}/assigned-projects` | Projects assigned to a judge |
| POST | `/api/v1/judging/assignments` | Assign judges to projects (admin) |
| GET | `/api/v1/judging/{project_id}` | Full AI evaluation + evidence for judge review |
| POST | `/api/v1/judging/{project_id}/score` | Submit/override human score with reason |
| POST | `/api/v1/judging/{project_id}/comment` | Add a judge comment |
| POST | `/api/v1/judging/{project_id}/question` | Save/answer a judge question for the team |

### 6.9 Finalization

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/finalization/{project_id}/compute` | Compute 70% AI + 30% human final score |
| GET | `/api/v1/finalization/leaderboard` | Ranked leaderboard for a hackathon |
| POST | `/api/v1/finalization/publish` | Publish final results (admin) |

### 6.10 Admin

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/admin/hackathons` | Create a hackathon event |
| GET | `/api/v1/admin/hackathons/{id}` | Hackathon detail |
| POST | `/api/v1/admin/rubrics` | Define/edit scoring rubric weights |
| POST | `/api/v1/admin/judges/assign` | Bulk-assign judges to projects |
| GET | `/api/v1/admin/analytics/judge-consistency` | Inter-rater reliability across judges |
| GET | `/api/v1/admin/analytics/plagiarism-flags` | All projects flagged by the Plagiarism Agent |

### 6.11 Webhooks & System

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/webhooks/n8n` | Outbound notification hook (Slack/email on status change) |
| POST | `/api/v1/webhooks/github` | Optional — push events trigger a fresh feedback run |
| GET | `/api/v1/health` | Liveness/readiness check |
| GET | `/api/v1/health/agents` | Model/provider availability check (OpenAI, Gemini) |

---

## 7. Core Data Models (Overview)

Kept intentionally brief — full column-level schema belongs in the migration files, not this document. This is the entity map everything above assumes.

| Entity | Key Fields |
|---|---|
| Hackathon | id, name, rubric_weights, submission_deadline, status |
| Team / Project | id, hackathon_id, name, members[], status (idea/ppt/product/judged/finalized) |
| Submission (Idea/PPT/Product) | id, project_id, stage, payload (text/file_url/github_url/live_url), submitted_at |
| Evaluation | id, project_id, stage, agent, score, confidence, model_used, created_at |
| Evidence | id, evaluation_id, type, source, content, tool_used |
| Claim | id, project_id, origin_stage (idea/ppt), text, verification_status |
| FeedbackReport | id, project_id, github_url, live_url, dimensions(json), top_fixes[], created_at |
| PlagiarismFlag | id, project_id, matched_source, similarity_score, status |
| JudgeAssignment | id, judge_id, project_id, human_score, comments, questions[] |
| FinalResult | id, project_id, ai_score, human_score, final_score, rank |

---

## 8. Backend Packages & Dependencies

### 8.1 Python (`requirements.txt`)

| Category | Packages |
|---|---|
| Web framework | fastapi, uvicorn[standard], pydantic, pydantic-settings |
| Agent orchestration | langgraph, langchain, langchain-openai, langchain-google-genai, langsmith |
| Database | sqlalchemy[asyncio], alembic, asyncpg, supabase |
| Auth | python-jose[cryptography], svix (Clerk webhook signature verification) |
| Async / queue | celery, redis, flower (queue monitoring) |
| PDF / document parsing | unstructured[pdf], pypdf, pdfplumber |
| Retrieval / RAG | llama-index, pgvector (or vecs for Supabase) |
| Code analysis | tree-sitter, tree-sitter-languages, radon, bandit, pip-audit |
| Security | detect-secrets, semgrep (CLI, invoked via subprocess) |
| Browser automation | playwright |
| Git / GitHub | PyGithub, GitPython |
| HTTP / resilience | httpx, tenacity |
| Validation | jsonschema |
| Testing | pytest, pytest-asyncio |
| Observability | sentry-sdk |
| Rate limiting | slowapi |
| Utilities | python-dotenv, loguru |

### 8.2 System-Level / CLI Tools (installed in Docker image, not pip)

- **Node.js** — required to run `npm audit` and `eslint` against JS/TS submissions, and for Playwright's browser binaries
- **git** — cloning submitted repositories
- **Semgrep CLI** and **TruffleHog** binaries
- **Playwright browsers** — installed via `playwright install --with-deps chromium`
- **Chromium system dependencies** — libnss3, libatk1.0, libgtk-3, fonts-liberation, libasound2, etc. (all pulled in by `--with-deps`)

> Keep the API image and the browser-automation/static-analysis worker image separate (`Dockerfile` vs `Dockerfile.worker`). The API container should stay slim; the worker container carries the heavy Chromium + Node + Semgrep toolchain and can be scaled independently.

---

## 9. Step-by-Step Build Guide

### Phase 0 — Project Setup
- Initialize the monorepo with the folder structure in §5
- Set up FastAPI skeleton, `pydantic-settings` config, and health-check route
- Set up Postgres (Supabase) + Alembic migrations, Redis, and local docker-compose for api + worker + redis
- Wire up Clerk auth (JWT verification dependency + webhook sync endpoint)

### Phase 1 — Core Domain & CRUD
- Implement Hackathon, Team/Project, Submission models + migrations
- Build Projects API (§6.2) with role-based access (participant/judge/admin)
- Add project status tracking (idea/ppt/product/judged/finalized)

### Phase 2 — Agent Infrastructure (build once, reuse everywhere)
- Define the shared Pydantic output schema every agent must return (score, evidence[], confidence, risks[], questions[])
- Build the validation-and-retry wrapper around LLM calls (tenacity + schema re-prompt on failure)
- Stand up Celery + Redis for async agent execution
- Wire LangSmith tracing on every agent call from day one — debugging multi-agent pipelines without traces is painful

### Phase 3 — Idea Stage (4 agents)
- Build Idea Selection, Problem & Impact, Feasibility, Market agents with the web-search tool wired in
- Build the Idea API (§6.3) and background task to run all 4 in parallel via LangGraph fan-out
- Test end-to-end with 2–3 sample ideas before moving on

### Phase 4 — PPT Stage (3 agents)
- Build the PDF ingestion pipeline (Unstructured) and PPT upload endpoint
- Build Presentation, Technical Architecture, Business Impact agents
- Add claim extraction so the Technical Architecture agent's output is stored as checkable Claim records, not just prose

### Phase 5 — Product Stage Tooling (build tools before agents)
- Build `github_client.py` — clone repo into an ephemeral sandbox, pull commit/contributor metadata
- Build `static_analysis.py` — Tree-sitter parse + Radon + linters
- Build `security_scan.py` — Bandit/Semgrep/npm audit/pip-audit/secret scan, normalized into one findings schema
- Build `browser_automation.py` — Playwright wrapper that takes a declared flow (login/create/upload/run) and returns per-step pass/fail + screenshots
- Build `uptime_checker.py` — live URL reachability, SSL, response time

### Phase 6 — Product Stage Agents (5 agents, now grounded in Phase 5 tools)
- Build Code Quality, UI/UX, Functionality, Security, Real-World Impact agents — each agent's prompt receives the deterministic tool output as context, not raw code
- Build the Product API (§6.5)

### Phase 7 — Instant Feedback (NEW)
- Build Instant Feedback Agent reusing the Phase 5 tools (fast subset only — skip the heavier LLM synthesis agents)
- Build the Feedback API (§6.6) and target sub-90-second turnaround
- This is a good milestone demo — it's the most tangible new feature for your own hackathon pitch

### Phase 8 — Cross-Cutting Intelligence
- Build Cross-Stage Consistency Agent (diff idea/PPT claims vs product evidence)
- Build Plagiarism/Similarity Agent (embeddings + vector search over public repos + prior submissions)
- Build Confidence Calibration Agent (OpenAI vs Gemini agreement scoring)
- Build Final Judge/Synthesis Agent — combines everything into the weighted 20/25/55 AI score

### Phase 9 — Judging & Finalization
- Build Judging API (§6.8) — assignment, score override, comments, questions
- Build Finalization API (§6.9) — 70% AI + 30% human calculation, leaderboard, publish
- Build Admin API (§6.10) including judge-consistency and plagiarism-flag analytics

### Phase 10 — Hardening
- Sandbox all repo cloning / code execution / URL fetching (see §10.4) — do this before you ever point the pipeline at real participant submissions
- Add rate limiting (slowapi) and SSRF protection on any endpoint that fetches a user-supplied URL
- Add Sentry error tracking and structured audit logging for every evaluation run
- Write integration tests covering at least one full idea → ppt → product → judge → finalize run

### Phase 11 — Deployment
- Follow §10 to deploy API, worker, Redis, and Postgres
- Set up CI/CD (GitHub Actions) to build and push both Docker images on merge to main
- Smoke-test the deployed instant-feedback endpoint against a real public repo + live URL before demoing

### Phase 12 — Frontend (next phase, not in this document)
- Once backend is stable end-to-end, scaffold Next.js + TypeScript per §11 of the original brief
- Build participant, judge, and admin dashboards against the API surface in §6

---

## 10. Hosting, Deployment & Runtime Requirements

### 10.1 Component → Hosting Recommendation

| Component | Recommendation | Notes |
|---|---|---|
| API service (FastAPI) | Render / Railway / Fly.io (or AWS ECS Fargate for scale) | 1 vCPU / 1GB RAM minimum; keep this image slim, no browser deps here |
| Worker service (Celery) | Same provider, separate service | 2GB+ RAM — carries Playwright/Chromium + Semgrep + Node toolchain; autoscale by queue depth |
| Postgres | Supabase (managed) | Enable the `pgvector` extension for embeddings |
| Redis | Upstash Redis or Redis Cloud | Celery broker + result backend |
| File storage | Supabase Storage | PPT PDFs, Playwright screenshots |
| Domain / TLS | Cloudflare in front of the API | Also gives basic DDoS/rate-limit protection at the edge |
| CI/CD | GitHub Actions | Build + push both Docker images (api, worker) on merge to main |
| Secrets | Provider's secret manager (Render secrets / AWS Secrets Manager) | Never commit `.env` — see §10.3 |

### 10.2 Browser Automation Runtime Requirements

Since the Functionality, UI/UX, and Instant Feedback agents drive a real headless browser, the worker environment specifically needs:

- Chromium installed via `playwright install --with-deps chromium` in the worker Dockerfile — this pulls in the required system libraries (libnss3, libatk-bridge2.0, libgtk-3, libasound2, fonts-liberation, etc.)
- Run Chromium in `--no-sandbox` mode inside the container (standard practice for containerized Playwright; the container itself is the sandbox boundary — see §10.4 for why that boundary still needs to be an ephemeral, isolated one)
- 2GB+ RAM per worker instance — a single headless Chromium page can use 300–500MB
- Cap concurrent browser sessions per worker (e.g. via a Celery concurrency limit) rather than letting the queue spawn unbounded Chromium instances
- 30–60 second hard timeout per browser-driven check so one hung live site can't stall the whole queue

### 10.3 Required Environment Variables (checklist, no values)

- `DATABASE_URL`, `REDIS_URL`
- `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- `OPENAI_API_KEY`, `GOOGLE_API_KEY` (Gemini)
- `TAVILY_API_KEY` or `SERPAPI_KEY` (web search tool)
- `GITHUB_TOKEN` (higher rate limits for repo/commit metadata)
- `LANGSMITH_API_KEY`, `LANGSMITH_PROJECT`
- `SENTRY_DSN`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

### 10.4 Security & Sandboxing — Read Before Pointing This at Real Submissions

This pipeline clones untrusted repositories, runs static analysis and dependency audits over untrusted code, and fetches untrusted live URLs. That's a real attack surface, not a hypothetical one — treat it accordingly.

- Never clone or run participant code directly on the API or worker host. Use ephemeral, resource-limited sandbox containers (Docker-in-Docker with strict limits, gVisor/Firecracker, or a hosted sandbox service such as E2B) for anything that touches submitted code.
- SSRF protection on the live-URL fetcher and uptime checker — block requests to private/internal IP ranges (127.0.0.0/8, 10.0.0.0/8, 169.254.169.254 cloud metadata endpoint, etc.) before making the request.
- Hard timeouts and output-size caps on every subprocess call (Semgrep, npm audit, etc.) — a malicious repo can otherwise be used to hang or exhaust a worker.
- Rate-limit `/feedback/submit` per project/team so the instant-feedback loop can't be used to hammer the LLM/tool budget.

---

## 11. What Happens Next

This document intentionally stops at the backend. Once the phases in §9 are working end-to-end against real test submissions — including a full idea → ppt → product → feedback → judge → finalize run — the Next.js + TypeScript frontend (participant, judge, and admin dashboards) can be scaffolded directly against the API surface in §6 with no backend guesswork left.

**Suggested build order if the team is time-boxed for a hackathon:**

`Phase 0–2 (infra)` → `Phase 5–7 (product tooling + instant feedback — most demo-able differentiator)` → `Phase 3–4 (idea/ppt)` → `Phase 8–9 (cross-cutting + judging)` → `Phase 10–11 (harden + deploy)`

Building the instant-feedback loop early both de-risks the harder product-evaluation pipeline and gives you something compelling to show early.
