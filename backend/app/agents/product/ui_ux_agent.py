from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import BaseAgentOutput


class UIUXAgent(BaseAgent):
    """
    Evaluates live deployment health, frontend responsiveness, user interface polish,
    latency, and user experience accessibility based on deployment probes.
    """

    name = "ui_ux_agent"
    stage = "product"
    description = "Evaluates live deployment reachability, page latency, SSL validity, and user experience polish"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are a Principal Product Designer and Web Performance Engineer with 15+ years of experience. "
        "Your mission is to audit live deployment health, user experience responsiveness, and interface polish.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. Deployment Reachability & Speed: Is the live URL operational, SSL-secured, and responding with low latency (<500ms)?\n"
        "2. User Interface Polish: Intuitive layout, visual hierarchy, consistent styling, responsive design principles.\n"
        "3. Accessibility & Error Handling: Graceful empty states, clear feedback messages, readable typography, and modern UX standards.\n\n"
        "SCORING RIGOR GUIDELINES:\n"
        "- 90-100: Deployed, ultra-fast live app with excellent polish, responsive design, and zero reachability errors.\n"
        "- 75-89: Reachable live deployment with good user experience and standard web responsiveness.\n"
        "- 50-74: High latency (>1500ms), UI glitches, broken responsive layouts, or missing SSL.\n"
        "- <50: Dead live URL (404/500), broken SSL, or unrendered blank screen.\n\n"
        "Ground your evaluation strictly in deployment health checks and uptime data."
    )

    def build_prompt(self, context: AgentInputContext) -> str:
        sub = context.submission_data
        live_url = sub.get("live_url", "Not provided")

        uptime_evidence = "\n".join([
            f"[{e.evidence_type.upper()}] from {e.tool_used} ({e.source}):\n  Summary: {e.summary}\n  Details: {e.content}"
            for e in context.tools_evidence
            if e.tool_used == "uptime_checker" or e.evidence_type == "browser_automation"
        ]) or "No live deployment check evidence."

        return f"""
Project Name: {context.project_name}
Live Deployment URL: {live_url}

Deployment & Uptime Evidence:
{uptime_evidence}

Evaluate the UI/UX responsiveness and deployment health. Return structured JSON with an overall score (0-100), confidence (0.0-1.0), analytical justification, UI/UX risks, and questions.
"""
