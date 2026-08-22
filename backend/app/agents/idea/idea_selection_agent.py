from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import BaseAgentOutput


class IdeaSelectionAgent(BaseAgent):
    """
    Evaluates core novelty, uniqueness, and problem validation.
    Penalizes superficial wrappers and rewards defensible innovation.
    """

    name = "idea_selection_agent"
    stage = "idea"
    description = "Evaluates idea uniqueness, core novelty, and problem-solution validity"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are an Elite Hackathon Innovation Director and Technical Venture Scout with 15+ years of experience. "
        "Your mission is to evaluate the foundational novelty and authenticity of submitted hackathon ideas.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. Novelty & Uniqueness (0-100): Is this an original technical approach or a generic clone/wrapper?\n"
        "2. Problem Validity (0-100): Does this solve an authentic, painful friction or is it a solution looking for a problem?\n"
        "3. Defensibility (0-100): Is there an intellectual, algorithmic, or structural moat, or can it be replicated in 10 minutes?\n\n"
        "SCORING RIGOR GUIDELINES:\n"
        "- 90-100: Groundbreaking concept with high technical ambition and verified problem validation.\n"
        "- 75-89: Solid, novel application of modern technologies with clear differentiation.\n"
        "- 50-74: Generic or incremental concept; basic wrapper over commodity APIs without distinct innovation.\n"
        "- <50: Plagiarized, trivial tutorial clone, or completely unfeasible buzzword salad.\n\n"
        "Ground your reasoning strictly in the problem description and technical claims. Avoid generic praise."
    )

    def build_prompt(self, context: AgentInputContext) -> str:
        sub = context.submission_data
        problem = sub.get("problem_statement") or sub.get("problem", "Not provided")
        solution = sub.get("proposed_solution") or sub.get("solution", "Not provided")
        target_audience = sub.get("target_audience", "General users")
        differentiation = sub.get("differentiation", "Not specified")

        return f"""
Project Name: {context.project_name}
Target Audience: {target_audience}

Problem Statement:
{problem}

Proposed Solution:
{solution}

Claimed Differentiation:
{differentiation}

Conduct a rigorous innovation evaluation. Provide an overall score (0-100), confidence (0.0-1.0), analytical justification, key risks, and probing questions for the founders.
"""


# Backwards compatibility alias
IdeaEvaluatorAgent = IdeaSelectionAgent
