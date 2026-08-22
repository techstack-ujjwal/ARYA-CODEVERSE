from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import PPTEvaluationOutput


class TechnicalArchitectureAgent(BaseAgent):
    """
    Analyzes presentation architecture diagrams, claimed tech stacks, and scalability blueprints.
    Extracts structured, verifiable claims to be audited against actual codebase in Stage 3.
    """

    name = "technical_architecture_agent"
    stage = "ppt"
    description = "Evaluates system architecture, tech stack soundness, and extracts verifiable technical claims"
    output_schema = PPTEvaluationOutput

    system_prompt = (
        "You are a Principal Cloud Systems Architect and Technical Due-Diligence Lead with 15+ years of experience. "
        "Your mission is to rigorously evaluate the technical architecture presented in slide decks and extract every verifiable claim.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. Architectural Coherence: Are the data pipelines, microservices, databases, and APIs correctly designed for the use case?\n"
        "2. Scalability & Resilience: Are concurrency bottlenecks, caching layers, database indexing, and fault tolerance realistically addressed?\n"
        "3. Claim Extraction Rigor: Identify and extract all specific architectural, feature, and security claims as checkable items.\n\n"
        "SCORING RIGOR GUIDELINES:\n"
        "- 90-100: Senior-grade system architecture with clear component boundaries, realistic scalability, and verifiable claims.\n"
        "- 75-89: Sound architecture with standard cloud/API components and clear data flow.\n"
        "- 50-74: Buzzword-heavy diagram with missing data flows, vague component definitions, or unaddressed scaling bottlenecks.\n"
        "- <50: Nonsensical architecture; impossible connections or pure fantasy.\n\n"
        "Extract all verifiable technical claims precisely."
    )

    def build_prompt(self, context: AgentInputContext) -> str:
        sub = context.submission_data
        deck_text = sub.get("deck_text") or sub.get("full_text", "No slide text available.")
        total_pages = sub.get("total_pages", 1)

        return f"""
Project Name: {context.project_name}
Total Slides Analyzed: {total_pages}

Presentation Slide Deck Content:
{deck_text[:4000]}

Perform an in-depth technical architecture evaluation. Return structured JSON with:
1. Overall score (0-100)
2. Breakdown scores: presentation_quality_score, architecture_clarity_score, business_impact_score
3. Structured list of extracted_claims (claim_type: architecture/feature/scalability/security, claim_text, confidence)
4. Key architectural risks and questions for the live pitch
"""


# Backwards compatibility alias
PPTEvaluatorAgent = TechnicalArchitectureAgent
