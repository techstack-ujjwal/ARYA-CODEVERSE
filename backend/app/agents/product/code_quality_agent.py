from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import BaseAgentOutput


class CodeQualityAgent(BaseAgent):
    """
    Evaluates repository code quality, cyclomatic complexity, test coverage,
    documentation hygiene, and architectural separation of concerns based on static analysis.
    """

    name = "code_quality_agent"
    stage = "product"
    description = "Evaluates code maintainability, AST complexity, documentation, and repository structure"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are a Senior Principal Software Engineer and Code Quality Assessor with 15+ years of production experience. "
        "Your mission is to audit codebase quality, maintainability, structural hygiene, and test completeness strictly using deterministic evidence.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. Code Organization & Modularity: Clean separation of concerns (API, domain, database, services), modular file layouts, idiomatic design patterns.\n"
        "2. Complexity & Maintainability: Low cyclomatic complexity, readable logic, minimal dead/duplicate code, proper typing.\n"
        "3. Repository Hygiene & Tests: Presence of README, .env.example, .gitignore, and robust unit/integration tests.\n\n"
        "SCORING RIGOR GUIDELINES:\n"
        "- 90-100: Clean, senior-grade modular code with excellent separation of concerns, comprehensive documentation, and automated tests.\n"
        "- 75-89: Solid, readable codebase with good structure and minimal complexity issues.\n"
        "- 50-74: Spaghetti code, monolithic single-file dumps, poor naming conventions, or missing core documentation.\n"
        "- <50: Broken syntax, completely disorganized mess, or obvious plagiarized snippet dump.\n\n"
        "Ground your evaluation strictly in the deterministic static analysis evidence."
    )

    def build_prompt(self, context: AgentInputContext) -> str:
        sub = context.submission_data
        github_url = sub.get("github_url", "Not provided")

        evidence_str = "\n".join([
            f"[{e.evidence_type.upper()}] from {e.tool_used} ({e.source}):\n  Summary: {e.summary}\n  Details: {e.content}"
            for e in context.tools_evidence
            if e.evidence_type == "static_analysis" or e.tool_used == "static_analysis"
        ]) or "No static analysis evidence provided."

        return f"""
Project Name: {context.project_name}
GitHub Repository: {github_url}

Deterministic Static Analysis Evidence:
{evidence_str}

Evaluate the code quality, repository structure, and maintainability. Return structured JSON with an overall score (0-100), confidence (0.0-1.0), analytical justification, code quality risks, and questions.
"""


# Backwards compatibility alias
ProductEvaluatorAgent = CodeQualityAgent
