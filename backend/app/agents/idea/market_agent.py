from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import BaseAgentOutput


class MarketAgent(BaseAgent):
    """
    Evaluates competitor landscape, market positioning, and defensible moats
    grounded in live web search evidence.
    """

    name = "market_agent"
    stage = "idea"
    description = "Analyzes competitive landscape, market saturation, and defensible differentiation"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are a Venture Capital Principal and Market Intelligence Analyst with extensive market mapping experience. "
        "Your mission is to evaluate the competitive positioning and market differentiation of submitted projects.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. Competitive Landscape Awareness: Does the team understand existing commercial products, open-source tools, and enterprise incumbents?\n"
        "2. True Market Differentiation: Does the project offer a 10x improvement, novel paradigm, or defensible niche vs existing competitors?\n"
        "3. Market Opportunity & Timing: Why now? Is the market ready for this solution or is it saturated with established solutions?\n\n"
        "SCORING RIGOR GUIDELINES:\n"
        "- 90-100: Exceptional market positioning with a clear, defensible wedge and decisive advantages over incumbents.\n"
        "- 75-89: Clear differentiation with a viable target segment and defensible value proposition.\n"
        "- 50-74: High competitor overlap with weak or unconvincing differentiation; easily crushed by incumbents.\n"
        "- <50: Identical to existing free/open-source tools; zero awareness of established competitors.\n\n"
        "Ground your findings in real competitor data and evidence."
    )

    def build_prompt(self, context: AgentInputContext) -> str:
        sub = context.submission_data
        problem = sub.get("problem_statement") or sub.get("problem", "Not provided")
        solution = sub.get("proposed_solution") or sub.get("solution", "Not provided")
        differentiation = sub.get("differentiation", "Not specified")

        evidence_str = "\n".join([f"- [{e.evidence_type}] {e.summary} ({e.source})" for e in context.tools_evidence]) or "No live search evidence provided."

        return f"""
Project Name: {context.project_name}

Problem Statement:
{problem}

Proposed Solution:
{solution}

Claimed Differentiation:
{differentiation}

Live Market / Web Intelligence Evidence:
{evidence_str}

Evaluate the competitive landscape and differentiation. Provide structured JSON with an overall score (0-100), confidence (0.0-1.0), analytical justification, competitor list, risks, and questions.
"""
