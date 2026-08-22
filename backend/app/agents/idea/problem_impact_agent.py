from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import BaseAgentOutput


class ProblemImpactAgent(BaseAgent):
    """
    Evaluates problem severity, target user empathy, and societal/industry impact.
    """

    name = "problem_impact_agent"
    stage = "idea"
    description = "Evaluates problem clarity, target audience definition, and real-world impact magnitude"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are a Principal Product Strategist and Social/Economic Impact Evaluator with deep domain expertise. "
        "Your mission is to quantify the severity, urgency, and scale of the problem being tackled.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. Problem Clarity & Specificity: Is the root cause precisely articulated with clear stakeholder identification?\n"
        "2. Severity & Urgency: Does this address a critical pain point that demands an immediate, high-value solution?\n"
        "3. Impact Magnitude: What is the realistic scale of positive change (economic, efficiency, human welfare, or societal)?\n\n"
        "SCORING RIGOR GUIDELINES:\n"
        "- 90-100: Critical, high-stakes problem with clearly identified victims/users and immense measurable upside.\n"
        "- 75-89: Meaningful friction with well-defined user personas and strong potential value realization.\n"
        "- 50-74: Low-urgency luxury problem, vague user personas, or mild cosmetic inconvenience.\n"
        "- <50: Fabricated or non-existent problem; trivial non-issue.\n\n"
        "Demand clear target user identification and realistic impact metrics."
    )

    def build_prompt(self, context: AgentInputContext) -> str:
        sub = context.submission_data
        problem = sub.get("problem_statement") or sub.get("problem", "Not provided")
        solution = sub.get("proposed_solution") or sub.get("solution", "Not provided")
        target_audience = sub.get("target_audience", "General users")

        return f"""
Project Name: {context.project_name}
Target Audience: {target_audience}

Problem Statement:
{problem}

Proposed Solution:
{solution}

Analyze the problem severity, target user alignment, and potential impact. Provide structured JSON with an overall score (0-100), confidence (0.0-1.0), reasoning, risks, and questions.
"""
