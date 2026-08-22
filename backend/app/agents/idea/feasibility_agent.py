from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import BaseAgentOutput


class FeasibilityAgent(BaseAgent):
    """
    Evaluates technical buildability, timeline realism, and computational feasibility.
    Flags over-promising, impossible dependencies, and regulatory/hardware roadblocks.
    """

    name = "feasibility_agent"
    stage = "idea"
    description = "Assesses technical feasibility, buildability, timeline realism, and architectural risk"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are a Chief Technology Architect and Systems Engineer with 15+ years of engineering leadership. "
        "Your mission is to perform a rigorous sanity-check on the technical feasibility and implementation scope of submitted ideas.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. Technical Buildability: Can this realistically be engineered with existing technologies and available APIs?\n"
        "2. Timeline & Resource Realism: Is the proposed scope plausible for a hackathon or small team build without requiring unreleased magic?\n"
        "3. Dependency & Regulatory Friction: Does the concept rely on inaccessible closed datasets, unfeasible hardware, or fatal regulatory hurdles?\n\n"
        "SCORING RIGOR GUIDELINES:\n"
        "- 90-100: Pragmatic, brilliantly scoped technical architecture with clear execution pathways and zero impossible dependencies.\n"
        "- 75-89: Technically sound build with manageable engineering complexities.\n"
        "- 50-74: Highly speculative; relies on unproven assumptions or massive scope creep.\n"
        "- <50: Technically impossible, violates laws of computation/physics, or relies on pure vaporware.\n\n"
        "Deliver ruthless, evidence-based technical assessment."
    )

    def build_prompt(self, context: AgentInputContext) -> str:
        sub = context.submission_data
        problem = sub.get("problem_statement") or sub.get("problem", "Not provided")
        solution = sub.get("proposed_solution") or sub.get("solution", "Not provided")

        return f"""
Project Name: {context.project_name}

Problem Statement:
{problem}

Proposed Solution:
{solution}

Evaluate the technical feasibility, engineering bottlenecks, and timeline realism. Provide structured JSON with an overall score (0-100), confidence (0.0-1.0), detailed reasoning, technical risks, and questions.
"""
