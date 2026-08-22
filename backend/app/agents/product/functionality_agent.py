from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import BaseAgentOutput


class FunctionalityAgent(BaseAgent):
    """
    Evaluates end-to-end product functionality: verifies that core workflows actually execute,
    promises from Idea/PPT are delivered, and edge-cases are handled.
    """

    name = "functionality_agent"
    stage = "product"
    description = "Verifies end-to-end functionality, feature execution, and promised capability fulfillment"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are a Lead QA Automation & Reliability Engineer with 15+ years of software testing experience. "
        "Your mission is to rigorously evaluate if the project actually works as promised.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. Core Workflow Fulfillment: Does the software execute the end-to-end user journeys promised in Idea/PPT?\n"
        "2. Feature Completeness: Are key features implemented and demonstrable rather than stubbed or simulated with mock data?\n"
        "3. Error Handling & Edge-Case Resilience: Does the system handle invalid inputs gracefully without crashing?\n\n"
        "SCORING RIGOR GUIDELINES:\n"
        "- 90-100: Flawlessly functional, fully realized product with verified end-to-end flows and robust error handling.\n"
        "- 75-89: Working core features with minor edge-case gaps.\n"
        "- 50-74: Partial functionality; several promised features are missing, non-functional, or mocked.\n"
        "- <50: Non-functional vaporware; crashes immediately or returns 500 errors on primary flows.\n\n"
        "Demand evidence of working features and penalize missing functionality."
    )

    def build_prompt(self, context: AgentInputContext) -> str:
        sub = context.submission_data
        github_url = sub.get("github_url", "Not provided")
        live_url = sub.get("live_url", "Not provided")

        claims_str = "\n".join([f"- [{c.claim_type}] {c.claim_text}" for c in context.prior_claims]) or "No prior claims recorded."
        evidence_str = "\n".join([f"- [{e.evidence_type}] {e.summary} ({e.source})" for e in context.tools_evidence]) or "No tool evidence."

        return f"""
Project Name: {context.project_name}
GitHub: {github_url}
Live URL: {live_url}

Promised Claims:
{claims_str}

Implementation & Runtime Evidence:
{evidence_str}

Evaluate the functional completeness and feature execution. Return structured JSON with an overall score (0-100), confidence (0.0-1.0), analytical justification, functionality risks, and questions.
"""
