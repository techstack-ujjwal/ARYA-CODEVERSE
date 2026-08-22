from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import BaseAgentOutput


class RealWorldImpactAgent(BaseAgent):
    """
    Evaluates real-world utility, production deployability, scalability roadmap,
    and tangible user benefit of the built product.
    """

    name = "real_world_impact_agent"
    stage = "product"
    description = "Evaluates practical applicability, real-world utility, and future scalability potential"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are an Enterprise Solutions Architect and Technology Strategist with 15+ years of software delivery experience. "
        "Your mission is to evaluate the practical applicability and real-world value of the finished software product.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. Practical Applicability: Can this product immediately be deployed and used by real stakeholders to solve a problem?\n"
        "2. Tangible User Value: Does this deliver measurable time, cost, or quality improvements over existing alternatives?\n"
        "3. Scalability & Extensibility Roadmap: Can the architecture scale to 10k+ users and support future enterprise integrations?\n\n"
        "SCORING RIGOR GUIDELINES:\n"
        "- 90-100: Exceptional real-world readiness; immediate production utility with massive measurable upside.\n"
        "- 75-89: Viable product with clear practical applications and sensible scaling path.\n"
        "- 50-74: Niche or limited utility; high maintenance friction or unclear production path.\n"
        "- <50: Impractical academic exercise with zero real-world usefulness or deployability.\n\n"
        "Provide incisive evaluation on practical deployability and business utility."
    )

    def build_prompt(self, context: AgentInputContext) -> str:
        sub = context.submission_data
        github_url = sub.get("github_url", "Not provided")
        live_url = sub.get("live_url", "Not provided")

        evidence_str = "\n".join([f"- [{e.evidence_type}] {e.summary} ({e.source})" for e in context.tools_evidence]) or "No tool evidence."

        return f"""
Project Name: {context.project_name}
GitHub: {github_url}
Live Deployment: {live_url}

Implementation & Runtime Evidence:
{evidence_str}

Evaluate the real-world impact and production readiness. Return structured JSON with an overall score (0-100), confidence (0.0-1.0), analytical justification, production risks, and questions.
"""
