# AI-Powered Hackathon Evaluation Engine

read plan.md for more

Technical Blueprint v2 Implementation — Enhanced Multi-Agent Architecture, Evaluation Core & API Layer.

## Architecture Overview
- **3 Evaluation Stages**: Idea Stage (20%), PPT Stage (25%), Product Stage (55%).
- **Cross-Cutting Agents**: Instant Feedback (<90s diagnostic report), Plagiarism/Similarity, Cross-Stage Consistency, Confidence Calibration, Final Judge.
- **Backend Stack**: FastAPI, SQLAlchemy 2.0 (async), Celery + Redis, PostgreSQL (Supabase + pgvector), Clerk Auth, LangGraph, Playwright, Radon/Tree-sitter, Bandit/Semgrep.

## Quickstart

### 1. Environment & Setup
```bash
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows PowerShell

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. Run Tests
```bash
pytest backend/tests -v
```

### 3. Start Local Server
```bash
uvicorn backend.app.main:app --reload --port 8000
```
API Documentation will be live at `http://localhost:8000/api/v1/docs`.

### 4. Run via Docker Compose
```bash
docker-compose -f backend/docker-compose.yml up --build
```
